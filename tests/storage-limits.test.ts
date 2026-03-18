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
      if (response.success) throw Error("Should not succeed");
      expect(response.error.message).toBe(ERR_KEY_NOT_FOUND);
    });

    test("Returns error when Zod validation fails", async () => {
      const key_data = fixtures.create_key();
      const create_response = await storage.keys.create(key_data);

      if (!create_response.success) throw create_response.error;

      const invalid_limits = [{ name: "ab", limit: 10, duration: 60 }];

      const response = await storage.limits.check_limits(
        key_data.hash,
        invalid_limits,
      );
      if (response.success) throw Error("Should not succeed");
      expect(response.success).toBe(false);
      expect(response.error.message).toContain(ERR_RATE_LIMIT_INVALID);

      await storage.keys.delete(key_data.hash);
    });

    test("Throws when Redis pipeline fails", async () => {
      const key_data = fixtures.create_key();
      const create_response = await storage.keys.create(key_data);

      if (!create_response.success) throw create_response.error;

      const failing_redis = Object.assign(
        new Redis({ host: HOST, port: PORT }),
        {
          pipeline: () => {
            throw new Error("Redis pipeline failed");
          },
        },
      );

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
      if (!result.success) throw Error("Should succeed");

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data![0].name).toBe(
        fixtures.rate_limits.workspace_requests.name,
      );
      expect(result.data![0].scope).toBe("workspace");

      await storage.keys.delete(key_data.hash);
      await storage.workspaces.delete(owner);
    });

    test("Applies both key and workspace rate limits", async () => {
      const owner = fixtures.create_owner();

      const workspace = fixtures.create_workspace(owner);
      const workspace_response = await storage.workspaces.create(workspace);
      if (!workspace_response.success) throw workspace_response.error;

      const key_data = fixtures.create_key(owner);
      key_data.rateLimits = [];
      const key_response = await storage.keys.create(key_data);
      if (!key_response.success) throw key_response.error;

      const result = await storage.limits.check_limits(key_data.hash, []);
      if (!result.success) throw Error("Should succeed");

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data![0].scope).toBe("workspace");

      await storage.keys.delete(key_data.hash);
      await storage.workspaces.delete(owner);
    });

    test("Applies workspace rate limits that exceed their limit", async () => {
      const workspace = fixtures.create_failing_workspace();
      await storage.workspaces.create(workspace);

      const key = fixtures.create_key(workspace.owner);
      await storage.keys.create(key);

      const result = await storage.limits.check_limits(key.hash, []);
      if (!result.success) throw Error("Should succeed");

      expect(result.success).toBe(true);
      expect(result.data?.some((l) => l.exceeded)).toBe(true);

      await storage.keys.delete(key.hash);
      await storage.workspaces.delete(workspace.owner);
    });

    test("Requested limits override stored limits with same name", async () => {
      const owner = fixtures.create_owner();

      const workspace = fixtures.create_workspace(owner);
      const workspace_response = await storage.workspaces.create(workspace);
      if (!workspace_response.success) throw workspace_response.error;

      const key_data = fixtures.create_key(owner);
      key_data.rateLimits = [
        {
          name: "api_calls",
          limit: 100,
          cost: 5,
          duration: 60,
          autoVerify: true,
        },
      ];
      const key_response = await storage.keys.create(key_data);
      if (!key_response.success) throw key_response.error;

      const result = await storage.limits.check_limits(key_data.hash, [
        { name: "api_calls", limit: 100, cost: 10, duration: 60 },
      ]);

      if (!result.success) throw Error("Should succeed");

      expect(result.success).toBe(true);
      const override_limit = result.data!.find((l) => l.name === "api_calls");
      expect(override_limit?.cost).toBe(10);

      await storage.keys.delete(key_data.hash);
      await storage.workspaces.delete(owner);
    });
  });
});
