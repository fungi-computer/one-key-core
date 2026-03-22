import { describe, test, expect, beforeEach, afterEach } from "vitest";
import Redis from "ioredis";
import Storage from "../src/storage/storage";
import limits, { type Limits, type LimitsOptions } from "../src/storage/limits";

const HOST = "localhost";
const PORT = 6379;

const create_storage_adapter = () => {
  const redis = new Redis({ host: HOST, port: PORT });
  const storage = Storage({ redis });
  return { storage, redis };
};

const create_limits_with_options = (options?: LimitsOptions) => {
  const redis = new Redis({ host: HOST, port: PORT });
  const storage = Storage({ redis });
  // Create limits with custom options by calling limits factory directly
  const customLimits = limits(redis, {
    get_key: (key_id: string) => storage.keys.get(key_id),
    get_workspace: (workspace_id: string) => storage.workspaces.get(workspace_id),
  }, options);
  return { customLimits, redis };
};

describe("Limits.check_limit standalone API", () => {
  let standaloneLimits: Limits;
  let redis: Redis;

  beforeEach(async () => {
    const { storage, redis: r } = create_storage_adapter();
    redis = r;
    await redis.flushdb();
    // Create standalone limits instance for testing - same storage, no key dependencies
    standaloneLimits = storage.limits;
  });

  afterEach(async () => {
    await redis.quit();
  });

  test("should allow requests under limit", async () => {
    const result = await standaloneLimits.check_limit("192.168.1.1", 10, 60);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.allowed).toBe(true);
      expect(result.data.remaining).toBe(9);
    }
  });

  test("should reject requests over limit", async () => {
    for (let i = 0; i < 5; i++) {
      const r = await standaloneLimits.check_limit("192.168.1.2", 5, 60);
      expect(r.success).toBe(true);
    }
    const result = await standaloneLimits.check_limit("192.168.1.2", 5, 60);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.allowed).toBe(false);
      expect(result.data.remaining).toBe(0);
    }
  });

  test("should return error on invalid identifier", async () => {
    const empty_result = await standaloneLimits.check_limit("", 5, 60);
    expect(empty_result.success).toBe(false);

    const long_result = await standaloneLimits.check_limit("a".repeat(257), 5, 60);
    expect(long_result.success).toBe(false);
  });

  test("should return error on invalid limit", async () => {
    const zero_result = await standaloneLimits.check_limit("ip", 0, 60);
    expect(zero_result.success).toBe(false);

    const negative_result = await standaloneLimits.check_limit("ip", -1, 60);
    expect(negative_result.success).toBe(false);
  });

  test("should return error on invalid duration", async () => {
    const zero_result = await standaloneLimits.check_limit("ip", 5, 0);
    expect(zero_result.success).toBe(false);

    const too_large_result = await standaloneLimits.check_limit("ip", 5, 86401);
    expect(too_large_result.success).toBe(false);
  });
});

describe("Limits with custom key prefix", () => {
  test("should use custom key prefix", async () => {
    const { customLimits, redis } = create_limits_with_options({ keyPrefix: "custom" });
    await redis.flushdb();

    const result = await customLimits.check_limit("ip", 10, 60);
    expect(result.success).toBe(true);

    // Verify the key format in Redis: custom:ip:window
    const keys = await redis.keys("custom:ip:window");
    expect(keys.length).toBe(1);
    expect(keys[0]).toBe("custom:ip:window");

    await redis.quit();
  });

  test("should allow coexisting limiters with different prefixes", async () => {
    const { customLimits: limiter1, redis: redis1 } = create_limits_with_options({ keyPrefix: "app1" });
    const { customLimits: limiter2, redis: redis2 } = create_limits_with_options({ keyPrefix: "app2" });

    // Use same identifier for both limiters
    await limiter1.check_limit("client_a", 5, 60);
    await limiter2.check_limit("client_a", 10, 60);

    // Verify separate keys in Redis
    const app1Keys = await redis1.keys("app1:client_a:window");
    const app2Keys = await redis2.keys("app2:client_a:window");

    expect(app1Keys.length).toBe(1);
    expect(app1Keys[0]).toBe("app1:client_a:window");
    expect(app2Keys.length).toBe(1);
    expect(app2Keys[0]).toBe("app2:client_a:window");

    await redis1.quit();
    await redis2.quit();
  });

  test("should default to ratelimit prefix when no option provided", async () => {
    const { customLimits, redis } = create_limits_with_options();
    await redis.flushdb();

    await customLimits.check_limit("192.168.1.100", 10, 60);

    // Verify the default key format: ratelimit:identifier:window
    const keys = await redis.keys("ratelimit:192.168.1.100:window");
    expect(keys.length).toBe(1);

    await redis.quit();
  });
});
