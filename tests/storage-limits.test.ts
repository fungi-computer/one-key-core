import { describe, test, expect, beforeEach } from "vitest";
import Redis from "ioredis";
import Storage from "../src/storage/storage";
import * as fixtures from "./fixtures";
import { ERR_KEY_NOT_FOUND, ERR_RATE_LIMIT_INVALID } from "../src/errors";

const HOST = "localhost";
const PORT = 6379;

const redis = new Redis({ host: HOST, port: PORT });

describe("Storage Limits", () => {
  const storage = Storage({ redis: redis });

  beforeEach(async () => {
    await redis.flushdb();
  });

  describe("check_limits", () => {
    test("Returns error when key not found", async () => {
      const non_existent_hash = "non_existent_hash_123";
      const response = await storage.limits.check_limits(non_existent_hash, []);

      expect(response.success).toBe(false);
      expect(response.error.message).toBe(ERR_KEY_NOT_FOUND);
    });

    test("Returns error when Zod validation fails", async () => {
      const key_data = fixtures.create_key();
      const create_response = await storage.keys.create(key_data);

      if (!create_response.success) throw create_response.error;

      const invalid_limits = [
        { name: "ab", limit: 10, duration: 60 },
      ];

      const response = await storage.limits.check_limits(key_data.hash, invalid_limits);
      expect(response.success).toBe(false);
      expect(response.error.message).toContain(ERR_RATE_LIMIT_INVALID);

      await storage.keys.delete(key_data.hash);
    });

    test("Throws when Redis pipeline fails", async () => {
      const key_data = fixtures.create_key();
      const create_response = await storage.keys.create(key_data);

      if (!create_response.success) throw create_response.error;

      const failing_redis = Object.assign(new Redis({ host: HOST, port: PORT }), {
        pipeline: () => {
          throw new Error("Redis pipeline failed");
        },
      });

      const storage_with_failing_redis = Storage({ redis: failing_redis });

      await expect(
        storage_with_failing_redis.limits.check_limits(key_data.hash, []),
      ).rejects.toThrow("Redis pipeline failed");

      await storage.keys.delete(key_data.hash);
    });

    test("Applies workspace rate limits to key when key has no rate limits", async () => {
      const owner = fixtures.create_owner();

      const workspace = fixtures.create_workspace(owner);
      const workspace_response = await storage.workspaces.create(workspace);
      if (!workspace_response.success) throw workspace_response.error;

      const key_data = fixtures.create_key(owner);
      key_data.rateLimits = [];
      const key_response = await storage.keys.create(key_data);
      if (!key_response.success) throw key_response.error;

      const result = await storage.limits.check_limits(key_data.hash, []);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data![0].name).toBe("workspace_requests");
      expect(result.data![0].scope).toBe("workspace");

      await storage.keys.delete(key_data.hash);
      await storage.workspaces.delete(owner);
    });

    test("Checks both key-level and workspace-level rate limits independently", async () => {
      const owner = fixtures.create_owner();

      const workspace = fixtures.create_workspace(owner);
      workspace.rateLimits = [
        { name: "requests_per_second", limit: 100, cost: 1, duration: 60, autoVerify: true },
      ];
      const workspace_response = await storage.workspaces.create(workspace);
      if (!workspace_response.success) throw workspace_response.error;

      const key_data = fixtures.create_key(owner);
      key_data.rateLimits = [
        { name: "requests_per_second", limit: 200, cost: 1, duration: 60, autoVerify: true },
      ];
      const key_response = await storage.keys.create(key_data);
      if (!key_response.success) throw key_response.error;

      const result = await storage.limits.check_limits(key_data.hash, []);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      const key_limit = result.data!.find((l) => l.scope === "key");
      const workspace_limit = result.data!.find((l) => l.scope === "workspace");
      expect(key_limit?.limit).toBe(200);
      expect(workspace_limit?.limit).toBe(100);

      await storage.keys.delete(key_data.hash);
      await storage.workspaces.delete(owner);
    });
  });
});
