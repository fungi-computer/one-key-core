import { describe, test, expect, beforeEach } from "vitest";
import Redis from "ioredis";
import Storage from "../../src/storage/storage";
import * as fixtures from "../fixtures";

const HOST = "localhost";
const PORT = 6379;

const redis = new Redis({ host: HOST, port: PORT });

describe("Limits Storage", () => {
  const storage = Storage({ redis: redis });

  beforeEach(async () => {
    await redis.flushdb();
  });

  describe("limits.get_usage", () => {
    test("Gets a limits usage given a scope, key_id, and limit_name", async () => {
      const key = fixtures.create_key();
      const workspace = fixtures.create_workspace(key.owner);
      await storage.keys.create(key);
      await storage.workspaces.create(workspace);

      await storage.limits.check_limits(key.hash, []);

      const retrieved = await storage.keys.get(key.hash);

      const usage = await storage.limits.get_usage(
        "key",
        retrieved!.id,
        key.rateLimits[0].name,
      );

      expect(usage).toBe(1);
    });
  });

  describe("limits.check_limits", () => {
    test("Checks and increments usage given key hash and RateLimit array", async () => {
      const key = fixtures.create_key();
      const workspace = fixtures.create_workspace(key.owner);
      await storage.keys.create(key);
      await storage.workspaces.create(workspace);

      const response = await storage.limits.check_limits(key.hash, []);
      const { success } = response;

      if (!success) return;
      const { data: checks } = response;

      expect(checks?.length).toBe(3);

      checks?.forEach((check) => {
        expect(check.exceeded).toBe(false);
      });
    });

    test("Inherits workspace limits when key has no rate limits", async () => {
      const key = fixtures.create_key();
      key.rateLimits = [];
      const workspace = fixtures.create_workspace(key.owner);
      await storage.keys.create(key);
      await storage.workspaces.create(workspace);

      const response = await storage.limits.check_limits(key.hash, []);

      if (!response.success) throw response.error;
      const { data: checks } = response;

      expect(checks?.length).toBe(1);
      expect(checks?.[0].scope).toBe("workspace");
    });

    test("Returns error for invalid rate limit in request", async () => {
      const key = fixtures.create_key();
      await storage.keys.create(key);

      const response = await storage.limits.check_limits(key.hash, [
        { name: "ab", limit: 50 } as any,
      ]);

      expect(response.success).toBe(false);
      if (response.success) throw Error("Should NOT succeed");
      expect(response.error.message).toContain("RATE_LIMIT_INVALID");
    });
  });
});
