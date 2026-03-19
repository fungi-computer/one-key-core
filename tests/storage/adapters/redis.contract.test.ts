import { describe, test, expect, beforeEach } from "vitest";
import Redis from "ioredis";
import Storage from "../../../src/storage/storage";
import * as fixtures from "../../behaviors/fixtures";
import { ERR_KEY_NOT_FOUND, ERR_WORKSPACE_NOT_FOUND, ERR_RATE_LIMIT_INVALID } from "../../../src/errors";

const HOST = "localhost";
const PORT = 6379;

const create_storage_adapter = () => {
  const redis = new Redis({ host: HOST, port: PORT });
  const storage = Storage({ redis });
  return { storage, redis };
};

describe("Storage Contract Tests", () => {
  const { storage, redis } = create_storage_adapter();

  beforeEach(async () => {
    await redis.flushdb();
  });

  describe("keys", () => {
    describe("keys.get", () => {
      test("Gets a key from a hash", async () => {
        const key = fixtures.create_key();
        const create_response = await storage.keys.create(key);
        const { data: created } = create_response;
        if (!created) throw new Error("Failed to create key");

        const retrieved = await storage.keys.get(key.hash);

        expect(retrieved?.id).toBe(created.id);
      });
    });

    describe("keys.create", () => {
      test("Creates a key record given hash, name, and owner", async () => {
        const key = fixtures.create_key();
        const response = await storage.keys.create(key);
        const { success } = response;
        if (!success) return;
        const { data: created } = response;

        expect(created?.id).not.toBeUndefined();
        await storage.keys.delete(key.hash);
      });

      test("Returns error for invalid key data", async () => {
        const response = await storage.keys.create({
          hash: "test-hash",
          owner: 123 as any,
          name: "Test Key",
        });

        expect(response.success).toBe(false);
        expect(response.error.message).toContain("KEY_VALIDATION");
      });

      test("Does not write over a key that already exists", async () => {
        const key = fixtures.create_key();
        const response = await storage.keys.create(key);
        const { success } = response;
        if (!success) return;

        const response2 = await storage.keys.create(key);
        const { success: success2 } = response2;
        if (success2) return;
        const { error } = response2;

        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain("DUPLICATE_KEY");

        await storage.keys.delete(key.hash);
      });
    });

    describe("keys.list", () => {
      test("Returns a list of keys at the given cursor and length", async () => {
        const key = fixtures.create_key();
        await storage.keys.create(key);
        const { keys: list } = await storage.keys.list(0, 10);
        const [first] = list;

        expect(first.id).not.toBeUndefined();
      });

      test("Returns empty array when no keys exist", async () => {
        const { keys: list, next_cursor } = await storage.keys.list(0, 10);

        expect(list).toEqual([]);
        expect(next_cursor).toBe("0");
      });

      test("Uses cursor for pagination", async () => {
        for (let i = 0; i < 5; i++) {
          const key = fixtures.create_key(`owner-${i}`);
          await storage.keys.create(key);
        }

        const { keys: first_page, next_cursor } = await storage.keys.list(0, 2);

        expect(first_page.length).toBeGreaterThan(0);
        const { keys: second_page } = await storage.keys.list(
          parseInt(next_cursor),
          2,
        );

        expect(second_page.length).toBeGreaterThan(0);
      });
    });

    describe("keys.list_by_owner", () => {
      test("Returns a list of keys by owner id at the given cursor and length", async () => {
        const owner = "test-owner-123";
        const key = fixtures.create_key(owner);
        await storage.keys.create(key);
        const { keys: list } = await storage.keys.list_by_owner(owner, 0, 10);
        const [first] = list;

        expect(first?.id).not.toBeUndefined();
      });

      test("Returns empty array when owner has no keys", async () => {
        const { keys: list, next_cursor } = await storage.keys.list_by_owner(
          "non-existent-owner",
          0,
          10,
        );

        expect(list).toEqual([]);
        expect(next_cursor).toBe("0");
      });
    });

    describe("keys.update", () => {
      test("Updates a key record", async () => {
        const key = fixtures.create_key();
        await storage.keys.create(key);

        const before_update = await storage.keys.get(key.hash);
        expect(before_update?.rateLimits?.length).toBeGreaterThan(0);

        await storage.keys.update(key.hash, {
          rateLimits: [],
        });

        const fetched_key = await storage.keys.get(key.hash);

        expect(fetched_key?.rateLimits).toStrictEqual([]);
      });

      test("Returns error for invalid update data", async () => {
        const key = fixtures.create_key();
        await storage.keys.create(key);

        const response = await storage.keys.update(key.hash, {
          rateLimits: [{ name: "invalid" }] as any,
        });

        expect(response.success).toBe(false);
        expect(response.error.message).toContain("KEY_VALIDATION");

        await storage.keys.delete(key.hash);
      });

      test("Returns error when updating non-existent key", async () => {
        const response = await storage.keys.update("non-existent-hash", {
          name: "New Name",
        });

        expect(response.success).toBe(false);
        expect(response.error.message).toContain("KEY_NOT_FOUND");
      });
    });

    describe("keys.delete", () => {
      test("Deletes a key", async () => {
        const key = fixtures.create_key();
        await storage.keys.create(key);

        const record = await storage.keys.get(key.hash);
        expect(record).not.toBeNull();
        await storage.keys.delete(key.hash);
        const record2 = await storage.keys.get(key.hash);

        expect(record2).toBeNull();
      });

      test("Removes the id:{id} index entry", async () => {
        const key = fixtures.create_key();
        const create_response = await storage.keys.create(key);
        const { data: created } = create_response;
        if (!created) throw new Error("Failed to create key");

        const hash_before = await storage.keys.get_by_id(created.id);
        expect(hash_before.success).toBe(true);

        await storage.keys.delete(key.hash);

        const hash_after = await storage.keys.get_by_id(created.id);
        expect(hash_after.success).toBe(false);
      });
    });

    describe("keys.get_by_id", () => {
      test("Returns the hash for a valid key_id", async () => {
        const key = fixtures.create_key();
        const create_response = await storage.keys.create(key);
        const { data: created } = create_response;
        if (!created) throw new Error("Failed to create key");

        const response = await storage.keys.get_by_id(created.id);

        expect(response.success).toBe(true);
        expect(response.data).toBe(key.hash);
      });

      test("Returns error for non-existent key_id", async () => {
        const response = await storage.keys.get_by_id("non-existent-id");

        expect(response.success).toBe(false);
        expect(response.error.message).toContain("KEY_NOT_FOUND");
      });
    });

    describe("keys.rotate", () => {
      test("Updates the id:{id} index to point to new hash", async () => {
        const key = fixtures.create_key();
        const create_response = await storage.keys.create(key);
        const { data: created } = create_response;
        if (!created) throw new Error("Failed to create key");

        const rotate_response = await storage.keys.rotate(
          key.hash,
          "new-hash-123",
          0,
        );
        expect(rotate_response.success).toBe(true);

        const lookup = await storage.keys.get_by_id(created.id);
        expect(lookup.success).toBe(true);
        expect(lookup.data).toBe("new-hash-123");
      });

      test("Sets expiration based on grace_period", async () => {
        const key = fixtures.create_key();
        await storage.keys.create(key);
        const grace_period = 60;

        const result = await storage.keys.rotate(
          key.hash,
          "new-hash-456",
          grace_period,
        );

        expect(result.success).toBe(true);
        if (!result.success) return;
        expect(result.data.expires_at).toBeGreaterThan(Date.now());
        expect(result.data.expires_at).toBeLessThanOrEqual(
          Date.now() + grace_period * 1000 + 1000,
        );

        await storage.keys.delete("new-hash-456");
      });

      test("Grace period of 0 sets expires_at to 0", async () => {
        const key = fixtures.create_key();
        await storage.keys.create(key);

        const result = await storage.keys.rotate(key.hash, "new-hash", 0);

        expect(result.success).toBe(true);
        if (!result.success) return;
        expect(result.data.expires_at).toBe(0);

        await storage.keys.delete("new-hash");
      });

      test("Returns error when rotating non-existent key", async () => {
        const result = await storage.keys.rotate(
          "non-existent-hash",
          "new-hash",
        );

        expect(result.success).toBe(false);
        expect(result.error.message).toBe(ERR_KEY_NOT_FOUND);
      });

      test("Preserves other key fields during rotation", async () => {
        const key = fixtures.create_key();
        const create_result = await storage.keys.create(key);
        if (!create_result.success) throw create_result.error;
        const stored_key = create_result.data;

        const result = await storage.keys.rotate(stored_key.hash, "new-hash");

        expect(result.success).toBe(true);
        if (!result.success) return;

        const rotated_key = await storage.keys.get("new-hash");
        expect(rotated_key?.id).toBe(stored_key.id);
        expect(rotated_key?.owner).toBe(stored_key.owner);
        expect(rotated_key?.name).toBe(stored_key.name);

        await storage.keys.delete("new-hash");
      });
    });
  });

  describe("workspaces", () => {
    describe("workspaces.get", () => {
      test("Gets a workspace from an owner id", async () => {
        const workspace = fixtures.create_workspace();
        await storage.workspaces.create(workspace);
        const retrieved = await storage.workspaces.get(workspace.owner);

        expect(retrieved).not.toBeNull();
      });
    });

    describe("workspaces.create", () => {
      test("Creates a workspace record", async () => {
        const workspace = fixtures.create_workspace();
        const result = await storage.workspaces.create(workspace);
        expect(result).not.toBeNull();
        await storage.workspaces.delete(workspace.owner);
      });

      test("Returns error for invalid workspace data", async () => {
        const response = await storage.workspaces.create({
          owner: 123 as any,
          name: "Test Workspace",
        });

        expect(response.success).toBe(false);
        if (response.success) throw Error("Should NOT succeed");
        expect(response.error.message).toContain("WORKSPACE_VALIDATION");
      });

      test("Returns error for workspace missing required name field", async () => {
        const owner = fixtures.create_owner();
        const response = await storage.workspaces.create({
          owner,
        } as any);

        expect(response.success).toBe(false);
        if (response.success) throw Error("Should NOT succeed");
        expect(response.error.message).toContain("WORKSPACE_VALIDATION");
      });

      test("Returns error when workspace already exists", async () => {
        const workspace = fixtures.create_workspace();
        await storage.workspaces.create(workspace);

        const response2 = await storage.workspaces.create(workspace);

        expect(response2.success).toBe(false);
        if (response2.success) throw Error("Should NOT succeed");
        expect(response2.error.message).toContain("DUPLICATE_WORKSPACE");

        await storage.workspaces.delete(workspace.owner);
      });
    });

    describe("workspaces.update", () => {
      test("Updates a workspace record", async () => {
        const workspace = fixtures.create_workspace();
        await storage.workspaces.create(workspace);

        await storage.workspaces.update(workspace.owner, { rateLimits: [] });
        const fetched_workspace = await storage.workspaces.get(workspace.owner);

        expect(fetched_workspace!.rateLimits).toStrictEqual([]);
        await storage.workspaces.delete(workspace.owner);
      });

      test("Returns error for invalid update data", async () => {
        const workspace = fixtures.create_workspace();
        await storage.workspaces.create(workspace);

        const response = await storage.workspaces.update(workspace.owner, {
          rateLimits: [{ name: "invalid" }] as any,
        });

        expect(response.success).toBe(false);
        if (response.success) throw Error("Should NOT succeed");
        expect(response.error.message).toContain("WORKSPACE_VALIDATION");

        await storage.workspaces.delete(workspace.owner);
      });

      test("Returns error when updating non-existent workspace", async () => {
        const response = await storage.workspaces.update("non-existent-owner", {
          name: "New Name",
        });

        expect(response.success).toBe(false);
        if (response.success) throw Error("Should NOT succeed");
        expect(response.error.message).toContain(ERR_WORKSPACE_NOT_FOUND);
      });
    });

    describe("workspaces.delete", () => {
      test("Deletes a workspace", async () => {
        const workspace = fixtures.create_workspace();
        await storage.workspaces.create(workspace);

        const record = await storage.workspaces.get(workspace.owner);
        expect(record).not.toBeNull();
        await storage.workspaces.delete(workspace.owner);
        const record2 = await storage.workspaces.get(workspace.owner);
        expect(record2).toBeNull();
      });
    });

    describe("workspaces.list", () => {
      test("Returns a list of workspaces at the given cursor and length", async () => {
        const workspace = fixtures.create_workspace();
        await storage.workspaces.create(workspace);
        const { workspaces: list } = await storage.workspaces.list(0, 10);

        expect(list[0].owner).not.toBeUndefined();
        await storage.workspaces.delete(workspace.owner);
      });

      test("Returns empty array when no workspaces exist", async () => {
        const { workspaces: list, next_cursor } = await storage.workspaces.list(
          0,
          10,
        );

        expect(list).toEqual([]);
        expect(next_cursor).toBe("0");
      });

      test("Uses cursor for pagination", async () => {
        const workspace_ids = [];
        for (let i = 0; i < 5; i++) {
          const workspace = fixtures.create_workspace(`owner-${i}`);
          await storage.workspaces.create(workspace);
          workspace_ids.push(workspace.owner);
        }

        const { workspaces: first_page, next_cursor } =
          await storage.workspaces.list(0, 2);

        expect(first_page.length).toBeGreaterThan(0);
        const { workspaces: second_page } = await storage.workspaces.list(
          parseInt(next_cursor),
          2,
        );

        expect(second_page.length).toBeGreaterThan(0);

        for (const id of workspace_ids) {
          await storage.workspaces.delete(id);
        }
      });
    });
  });

  describe("limits", () => {
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

      test("Returns error when key not found", async () => {
        const non_existent_hash = "non_existent_hash_123";
        const response = await storage.limits.check_limits(
          non_existent_hash,
          [],
        );

        expect(response.success).toBe(false);
        if (response.success) throw Error("Should not succeed");
        expect(response.error.message).toBe(ERR_KEY_NOT_FOUND);
      });

      test("Applies workspace rate limits to key when key has no rate limits", async () => {
        const owner = fixtures.create_owner();

        const workspace = fixtures.create_workspace(owner);
        const workspace_response = await storage.workspaces.create(workspace);
        if (!workspace_response.success)
          throw workspace_response.error;

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

      test("Applies workspace rate limits that exceed their limit", async () => {
        const workspace =
          fixtures.create_workspace_with_exceeded_limits();
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
        if (!workspace_response.success)
          throw workspace_response.error;

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
        const override_limit = result.data!.find(
          (l) => l.name === "api_calls",
        );
        expect(override_limit?.cost).toBe(10);

        await storage.keys.delete(key_data.hash);
        await storage.workspaces.delete(owner);
      });
    });
  });
});
