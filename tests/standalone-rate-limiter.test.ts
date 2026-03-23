import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import Redis from "ioredis";
import { ERR_INVALID_LIMIT, ERR_INVALID_DURATION } from "../src/errors";
import limits from "../src/storage/limits";
import type { LimitsFactoryStorage } from "../src/storage/limits";
import type { CheckLimitResult } from "../src/storage/limits";

const HOST = "localhost";
const PORT = 6379;

describe("standalone rate limiter", () => {
  let redis: Redis;
  let rate_limiter: ReturnType<typeof limits>;

  beforeAll(async () => {
    redis = new Redis({ host: HOST, port: PORT });
    await redis.flushdb();

    // Create limits factory with default key prefix for testing
    const storage: LimitsFactoryStorage = {
      keys_storage: {} as any,
      workspaces_storage: {} as any,
    };

    rate_limiter = limits(redis, storage, { keyPrefix: "test:ratelimit:e2e" });
  });

  afterAll(async () => {
    await redis.quit();
  });

  beforeEach(async () => {
    await redis.flushdb();
  });

  describe("basic rate limiting", () => {
    it("allows exactly N requests for limit N", async () => {
      const identifier = "basic_user";
      const limit = 3;
      const duration = 60;

      // Make exactly 'limit' number of requests - all should be allowed
      for (let i = 0; i < limit; i++) {
        const result = await rate_limiter.check_limit(identifier, limit, duration);
        expect(result.success).toBe(true);
        if (!result.success) throw result.error;
        expect(result.data.allowed).toBe(true);
        expect(result.data.remaining).toBe(limit - i - 1);
      }
    });

    it("denies request number N+1 when limit is N", async () => {
      const identifier = "denied_user";
      const limit = 2;
      const duration = 60;

      // Exhaust the limit
      await rate_limiter.check_limit(identifier, limit, duration);
      await rate_limiter.check_limit(identifier, limit, duration);

      // Third request should be denied
      const result = await rate_limiter.check_limit(identifier, limit, duration);
      expect(result.success).toBe(true);
      if (!result.success) throw result.error;
      expect(result.data.allowed).toBe(false);
      expect(result.data.remaining).toBe(0);
    });

    it("returns correct remaining count after each request", async () => {
      const identifier = "count_user";
      const limit = 5;
      const duration = 60;

      const results: CheckLimitResult[] = [];

      for (let i = 0; i < limit; i++) {
        const result = await rate_limiter.check_limit(identifier, limit, duration);
        expect(result.success).toBe(true);
        if (!result.success) throw result.error;
        results.push(result.data);
      }

      // Verify remaining counts decrease
      expect(results[0].remaining).toBe(4);
      expect(results[1].remaining).toBe(3);
      expect(results[2].remaining).toBe(2);
      expect(results[3].remaining).toBe(1);
      expect(results[4].remaining).toBe(0);
    });
  });

  describe("sliding window", () => {
    it("only counts requests within the current window", async () => {
      const identifier = "window_user";
      const limit = 2;
      const duration = 1; // 1 second window

      // Exhaust the limit
      const result1 = await rate_limiter.check_limit(identifier, limit, duration);
      expect(result1.success).toBe(true);
      if (!result1.success) throw result1.error;
      expect(result1.data.allowed).toBe(true);

      const result2 = await rate_limiter.check_limit(identifier, limit, duration);
      expect(result2.success).toBe(true);
      if (!result2.success) throw result2.error;
      expect(result2.data.allowed).toBe(true);

      // Third request should be denied
      const result3 = await rate_limiter.check_limit(identifier, limit, duration);
      expect(result3.success).toBe(true);
      if (!result3.success) throw result3.error;
      expect(result3.data.allowed).toBe(false);

      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Next request should be allowed again (window expired)
      const result4 = await rate_limiter.check_limit(identifier, limit, duration);
      expect(result4.success).toBe(true);
      if (!result4.success) throw result4.error;
      expect(result4.data.allowed).toBe(true);
    });

    it("allows new requests after the sliding window expires", async () => {
      const identifier = "expire_user";
      const limit = 1;
      const duration = 1; // 1 second

      // First request allowed
      const r1 = await rate_limiter.check_limit(identifier, limit, duration);
      expect(r1.success).toBe(true);
      if (!r1.success) throw r1.error;
      expect(r1.data.allowed).toBe(true);

      // Second request denied
      const r2 = await rate_limiter.check_limit(identifier, limit, duration);
      expect(r2.success).toBe(true);
      if (!r2.success) throw r2.error;
      expect(r2.data.allowed).toBe(false);

      // Wait for window
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Should be allowed again
      const r3 = await rate_limiter.check_limit(identifier, limit, duration);
      expect(r3.success).toBe(true);
      if (!r3.success) throw r3.error;
      expect(r3.data.allowed).toBe(true);
    });
  });

  describe("key prefix isolation", () => {
    it("two rate limiters with different prefixes do not interfere", async () => {
      const identifier = "shared_user";

      // Create two rate limiters with different prefixes
      const storage: LimitsFactoryStorage = {
        keys_storage: {} as any,
        workspaces_storage: {} as any,
      };

      const limiter1 = limits(redis, storage, { keyPrefix: "prefix_a" });
      const limiter2 = limits(redis, storage, { keyPrefix: "prefix_b" });

      const limit = 1;
      const duration = 60;

      // Exhaust limiter1's limit for shared_user
      const r1 = await limiter1.check_limit(identifier, limit, duration);
      expect(r1.success).toBe(true);
      if (!r1.success) throw r1.error;
      expect(r1.data.allowed).toBe(true);

      // limiter2 should still allow the same user (different prefix)
      const r2 = await limiter2.check_limit(identifier, limit, duration);
      expect(r2.success).toBe(true);
      if (!r2.success) throw r2.error;
      expect(r2.data.allowed).toBe(true);
    });

    it("requests with same identifier but different prefixes are isolated", async () => {
      const storage: LimitsFactoryStorage = {
        keys_storage: {} as any,
        workspaces_storage: {} as any,
      };

      const limiter1 = limits(redis, storage, { keyPrefix: "isolated_1" });
      const limiter2 = limits(redis, storage, { keyPrefix: "isolated_2" });

      const limit = 2;
      const duration = 60;

      // Make 2 requests on limiter1
      await limiter1.check_limit("user_a", limit, duration);
      await limiter1.check_limit("user_a", limit, duration);

      // user_a on limiter1 should be exhausted
      const exhausted = await limiter1.check_limit("user_a", limit, duration);
      expect(exhausted.success).toBe(true);
      if (!exhausted.success) throw exhausted.error;
      expect(exhausted.data.allowed).toBe(false);

      // user_a on limiter2 should still be allowed (different prefix)
      const allowed = await limiter2.check_limit("user_a", limit, duration);
      expect(allowed.success).toBe(true);
      if (!allowed.success) throw allowed.error;
      expect(allowed.data.allowed).toBe(true);
    });
  });

  describe("duration accuracy", () => {
    it("reset value represents remaining time until oldest entry expires", async () => {
      const identifier = "reset_user";
      const limit = 10;
      const duration = 30; // 30 seconds (30000 ms)

      const result = await rate_limiter.check_limit(identifier, limit, duration);

      expect(result.success).toBe(true);
      if (!result.success) throw result.error;

      // Reset is the remaining time in ms, should be close to duration when window just started
      // Allow some tolerance since time passes during execution
      expect(result.data.reset).toBeGreaterThanOrEqual(29000);
      expect(result.data.reset).toBeLessThanOrEqual(30000);
    });

    it("rate limit correctly resets after duration expires", async () => {
      const identifier = "expiry_user";
      const limit = 1;
      const duration = 2; // 2 seconds

      // Exhaust the limit
      const r1 = await rate_limiter.check_limit(identifier, limit, duration);
      expect(r1.success).toBe(true);
      if (!r1.success) throw r1.error;
      expect(r1.data.allowed).toBe(true);

      const r2 = await rate_limiter.check_limit(identifier, limit, duration);
      expect(r2.success).toBe(true);
      if (!r2.success) throw r2.error;
      expect(r2.data.allowed).toBe(false);

      // Wait 2.5 seconds for the window to fully expire
      await new Promise((resolve) => setTimeout(resolve, 2500));

      // Should be allowed again
      const r3 = await rate_limiter.check_limit(identifier, limit, duration);
      expect(r3.success).toBe(true);
      if (!r3.success) throw r3.error;
      expect(r3.data.allowed).toBe(true);
      expect(r3.data.remaining).toBe(0); // limit is 1, so after 1 request remaining is 0
    });

    it("shorter duration windows expire faster", async () => {
      const storage: LimitsFactoryStorage = {
        keys_storage: {} as any,
        workspaces_storage: {} as any,
      };

      const short_limiter = limits(redis, storage, { keyPrefix: "short_window" });
      const long_limiter = limits(redis, storage, { keyPrefix: "long_window" });

      const identifier = "duration_test";
      const limit = 1;

      // Exhaust both limits
      await short_limiter.check_limit(identifier, 1, 1); // 1 second window
      await long_limiter.check_limit(identifier, 1, 5); // 5 second window

      // Short window should expire first
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Short window should be reset
      const short_result = await short_limiter.check_limit(identifier, 1, 1);
      expect(short_result.success).toBe(true);
      if (!short_result.success) throw short_result.error;
      expect(short_result.data.allowed).toBe(true);

      // Long window should still be exhausted
      const long_result = await long_limiter.check_limit(identifier, 1, 5);
      expect(long_result.success).toBe(true);
      if (!long_result.success) throw long_result.error;
      expect(long_result.data.allowed).toBe(false);
    });
  });

  describe("validation errors", () => {
    it("empty identifier returns error", async () => {
      const result = await rate_limiter.check_limit("", 10, 60);
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.message).toContain("INVALID_CHECK_LIMIT");
    });

    it("identifier exceeding 256 characters returns error", async () => {
      const long_identifier = "a".repeat(257);
      const result = await rate_limiter.check_limit(long_identifier, 10, 60);
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.message).toContain("INVALID_CHECK_LIMIT");
    });

    it("identifier at max length (256) is valid", async () => {
      const max_identifier = "a".repeat(256);
      const result = await rate_limiter.check_limit(max_identifier, 10, 60);
      expect(result.success).toBe(true);
      if (!result.success) throw result.error;
      expect(result.data.allowed).toBe(true);
    });

    it("limit of 0 returns INVALID_LIMIT error", async () => {
      const result = await rate_limiter.check_limit("user", 0, 60);
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.message).toContain(ERR_INVALID_LIMIT);
    });

    it("negative limit returns INVALID_LIMIT error", async () => {
      const result = await rate_limiter.check_limit("user", -1, 60);
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.message).toContain(ERR_INVALID_LIMIT);
    });

    it("non-integer limit returns INVALID_LIMIT error", async () => {
      const result = await rate_limiter.check_limit("user", 1.5, 60);
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.message).toContain(ERR_INVALID_LIMIT);
    });

    it("duration of 0 returns INVALID_DURATION error", async () => {
      const result = await rate_limiter.check_limit("user", 10, 0);
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.message).toContain(ERR_INVALID_DURATION);
    });

    it("negative duration returns INVALID_DURATION error", async () => {
      const result = await rate_limiter.check_limit("user", 10, -1);
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.message).toContain(ERR_INVALID_DURATION);
    });

    it("duration exceeding 86400 returns INVALID_DURATION error", async () => {
      const result = await rate_limiter.check_limit("user", 10, 86401);
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.message).toContain(ERR_INVALID_DURATION);
    });

    it("duration at max (86400) is valid", async () => {
      const result = await rate_limiter.check_limit("user", 10, 86400);
      expect(result.success).toBe(true);
      if (!result.success) throw result.error;
      expect(result.data.allowed).toBe(true);
    });

    it("minimum valid limit (1) works correctly", async () => {
      const result = await rate_limiter.check_limit("user", 1, 60);
      expect(result.success).toBe(true);
      if (!result.success) throw result.error;
      expect(result.data.allowed).toBe(true);
      expect(result.data.remaining).toBe(0);
    });

    it("minimum valid duration (1) works correctly", async () => {
      const result = await rate_limiter.check_limit("user", 10, 1);
      expect(result.success).toBe(true);
      if (!result.success) throw result.error;
      expect(result.data.allowed).toBe(true);
    });
  });

  describe("return value structure", () => {
    it("returns correct structure with allowed, remaining, and reset fields", async () => {
      const result = await rate_limiter.check_limit("structure_user", 5, 60);
      expect(result.success).toBe(true);
      if (!result.success) throw result.error;

      const data = result.data;
      expect(data).toHaveProperty("allowed");
      expect(data).toHaveProperty("remaining");
      expect(data).toHaveProperty("reset");

      expect(typeof data.allowed).toBe("boolean");
      expect(typeof data.remaining).toBe("number");
      expect(typeof data.reset).toBe("number");
    });

    it("allowed is true when under limit", async () => {
      const result = await rate_limiter.check_limit("allowed_user", 5, 60);
      expect(result.success).toBe(true);
      if (!result.success) throw result.error;
      expect(result.data.allowed).toBe(true);
    });

    it("allowed is false when at limit", async () => {
      const limit = 2;
      await rate_limiter.check_limit("denied_structure_user", limit, 60);
      await rate_limiter.check_limit("denied_structure_user", limit, 60);

      const result = await rate_limiter.check_limit("denied_structure_user", limit, 60);
      expect(result.success).toBe(true);
      if (!result.success) throw result.error;
      expect(result.data.allowed).toBe(false);
    });

    it("remaining decreases correctly", async () => {
      const limit = 3;
      const identifier = "remaining_decrease";

      const r1 = await rate_limiter.check_limit(identifier, limit, 60);
      expect(r1.success).toBe(true);
      if (!r1.success) throw r1.error;
      expect(r1.data.remaining).toBe(2);

      const r2 = await rate_limiter.check_limit(identifier, limit, 60);
      expect(r2.success).toBe(true);
      if (!r2.success) throw r2.error;
      expect(r2.data.remaining).toBe(1);

      const r3 = await rate_limiter.check_limit(identifier, limit, 60);
      expect(r3.success).toBe(true);
      if (!r3.success) throw r3.error;
      expect(r3.data.remaining).toBe(0);
    });

    it("remaining cannot go negative", async () => {
      const limit = 1;

      // Exhaust
      await rate_limiter.check_limit("negative_remaining", limit, 60);
      // Over limit
      await rate_limiter.check_limit("negative_remaining", limit, 60);
      await rate_limiter.check_limit("negative_remaining", limit, 60);

      const result = await rate_limiter.check_limit("negative_remaining", limit, 60);
      expect(result.success).toBe(true);
      if (!result.success) throw result.error;
      expect(result.data.remaining).toBeGreaterThanOrEqual(0);
    });

    it("reset is remaining duration in milliseconds", async () => {
      const result = await rate_limiter.check_limit("reset_ts", 10, 30);

      expect(result.success).toBe(true);
      if (!result.success) throw result.error;

      // Reset is remaining time until oldest entry expires, should be ~30 seconds
      expect(result.data.reset).toBeGreaterThanOrEqual(29000);
      expect(result.data.reset).toBeLessThanOrEqual(30000);
    });

    it("reset value decreases as requests are made within the window", async () => {
      const identifier = "consistent_reset";

      const r1 = await rate_limiter.check_limit(identifier, 10, 60);
      expect(r1.success).toBe(true);
      if (!r1.success) throw r1.error;
      const reset1 = r1.data.reset;

      // Small delay so time passes
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Make another request in the same window
      const r2 = await rate_limiter.check_limit(identifier, 10, 60);
      expect(r2.success).toBe(true);
      if (!r2.success) throw r2.error;

      // Reset should be less than before (time has passed)
      expect(r2.data.reset).toBeLessThan(reset1);
    });
  });
});
