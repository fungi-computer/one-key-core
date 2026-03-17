const rate_limit_script = `
  -- Sliding window rate limiter
  -- KEYS[1]: rate limit key (sorted set)
  -- ARGV[1]: limit (number)
  -- ARGV[2]: duration (milliseconds)
  -- ARGV[3]: cost (number)
  -- ARGV[4]: current timestamp (milliseconds, from client)

  local key = KEYS[1]
  local limit = tonumber(ARGV[1])
  local duration = tonumber(ARGV[2])
  local cost = tonumber(ARGV[3])
  local now = tonumber(ARGV[4])
  local scope = tostring(ARGV[5])

  -- 1. Remove expired entries
  redis.call('ZREMRANGEBYSCORE', key, 0, now - duration)

  -- 2. Check if key exists before adding (to only set expiry once)
  local key_exists = redis.call('EXISTS', key)
  local key_exists_before = (key_exists == 1)

  -- 3. Count current valid entries
  local current = redis.call('ZCARD', key)

  -- 4. Check if adding cost would exceed limit
  if current + cost > limit then
      -- Get the oldest entry's score to compute reset time
      local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
      local reset = 0
      if #oldest > 0 then
          local oldest_score = tonumber(oldest[2])
          reset = math.max(0, duration - (now - oldest_score))
      end
      return {0, limit - current, reset, scope}  -- exceeded
  end

  -- 5. Add cost entries with unique members
  for i = 1, cost do
      -- Unique member: timestamp + random hex (collision probability negligible)
      local member = now .. ':' .. string.format('%x', math.random(1, 2^31-1))
      redis.call('ZADD', key, now, member)
  end

  -- 5. Set expiration only if key was just created
  if not key_exists_before then
      redis.call('PEXPIRE', key, duration)
  end

  -- 6. Compute remaining and reset after addition
  local new_current = current + cost
  local remaining = limit - new_current
  local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
  local reset = 0
  if #oldest > 0 then
      local oldest_score = tonumber(oldest[2])
      reset = math.max(0, duration - (now - oldest_score))
  end

  return {1, remaining, reset, scope}  -- allowed
`;

export default rate_limit_script;
