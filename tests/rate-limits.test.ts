import { describe, test, expect, beforeEach, afterEach } from "vitest";
import Redis from "ioredis";
import Storage from "../src/storage/storage";
import type { Limits } from "../src/storage/limits";

const HOST = "localhost";
const PORT = 6379;

const create_storage_adapter = () => {
  const redis = new Redis({ host: HOST, port: PORT });
  const storage = Storage({ redis });
  return { storage, redis };
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
