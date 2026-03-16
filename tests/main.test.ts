import { describe, test, expect, beforeAll } from "vitest";
import OneKey from "../src/main";
import Redis from "ioredis";
import Storage from "../src/storage/storage";
import { keys, owners, workspaces } from "./fixtures";
import { nanoid } from "nanoid";
import { StoredKey } from "../src/types/keys";

const HOST = "localhost";
const PORT = "6379";

const redis = new Redis({ host: HOST, port: PORT });
let global_key: StoredKey | null = null;
describe("one-key", () => {
  const storage = Storage({ redis: redis });
  beforeAll(async () => {
    await redis.flushdb();
    const response = await storage.keys.create(keys.passing_key);
    const { success } = response;
    if (!success) return;
    const { data: key } = response;
    global_key = key;
    await storage.workspaces.create(workspaces.passing_workspace);
  });
  test.skip("Sanity", () => {
    const one_key = OneKey({ redis: redis });
    // const key = one_key.create_key({ name: "Test Key", owner: "555" });
    expect(1).toBe(1);
  });
  describe("Storage", () => {
    describe("storage.keys", () => {
      describe("keys.get", () => {
        test("Gets a key from a hash", async () => {
          const key = await storage.keys.get(keys.passing_key.hash);

          expect(key?.id).not.toBeUndefined();
        });
      });
      describe("keys.create", () => {
        test("Creates a key record given hash, name, and owner", async () => {
          const response = await storage.keys.create(keys.failing_owner_key);
          const { success } = response;
          if (!success) return;
          const { data: key } = response;

          expect(key?.id).not.toBeUndefined();
          await storage.keys.delete(keys.failing_owner_key.hash);
        });
        test("Will NOT write over a key that already exists", async () => {
          const response = await storage.keys.create(keys.failing_owner_key);
          const { success } = response;
          if (!success) return;
          const { data: key } = response;

          const response2 = await storage.keys.create(keys.failing_owner_key);
          const { success: success2 } = response2;
          if (success2) return;
          const { error } = response2;

          expect(key?.id).not.toBeUndefined();
          expect(error).toBeInstanceOf(Error);

          await storage.keys.delete(keys.failing_owner_key.hash);
        });
      });
      describe("keys.list", () => {
        test("Returns a list of keys at the given cursor and length", async () => {
          const { keys: list } = await storage.keys.list(0, 10);
          const [first] = list;

          expect(first.id).not.toBeUndefined();
        });
      });
      describe("keys.list_by_owner", () => {
        beforeAll(async () => {
          const storage = Storage({ redis: redis });
          await storage.keys.create(keys.failing_owner_key);
        });
        test("Returns a list of keys by owner id at the given cursor and length", async () => {
          const { keys: list } = await storage.keys.list_by_owner(
            owners.owner_failing_limit_checks,
            0,
            10,
          );
          const [first] = list;

          expect(first?.id).not.toBeUndefined();
        });
      });
      describe("keys.update", () => {
        test("Updates a key record", async () => {
          const hash = nanoid(16);
          const response = await storage.keys.create({
            ...keys.passing_key,
            hash,
          });

          const { success } = response;
          if (!success) return;
          const { data: key } = response;

          expect(key).not.toBeNull();
          expect(key!.rateLimits).toStrictEqual(keys.passing_key.rateLimits);

          await storage.keys.update(hash, {
            rateLimits: [],
          });

          const fetched_key = await storage.keys.get(hash);

          expect(fetched_key?.rateLimits).toStrictEqual([]);
          expect(fetched_key?.rateLimits).not.toStrictEqual(key!.rateLimits);
        });
      });
      describe("keys.delete", () => {
        test("Deletes a key", async () => {
          const response = await storage.keys.create({
            ...keys.passing_key,
            hash: nanoid(16),
          });
          const { success } = response;
          if (!success) return;
          const { data: key } = response;

          const record = await storage.keys.get(key!.hash);
          expect(record).not.toBeNull();
          await storage.keys.delete(key!.hash);
          const record2 = await storage.keys.get(key!.hash);

          expect(record2).toBeNull();
        });
      });
    });
    describe("storage.workspaces", () => {
      describe("workspaces.get", () => {
        test("Gets a workspace from a owner id", async () => {
          const workspace = await storage.workspaces.get(
            workspaces.passing_workspace.owner,
          );

          expect(workspace).not.toBeNull();
        });
      });
      describe("workspaces.create", () => {
        test("Creates a key record given hash, name, and owner", async () => {
          const workspace = await storage.workspaces.create(
            workspaces.failing_workspace,
          );
          expect(workspace).not.toBeNull();
          await storage.workspaces.delete(workspaces.failing_workspace.owner);
        });
      });
      describe("workspaces.update", () => {
        test("Updates a workspace record", async () => {
          const response = await storage.workspaces.create(
            workspaces.failing_workspace,
          );
          const { success } = response;
          if (!success) return;
          const { data: workspace } = response;

          expect(workspace).not.toBeNull();
          expect(workspace!.rateLimits).toStrictEqual(
            workspaces.failing_workspace.rateLimits,
          );

          await storage.workspaces.update(workspace!.owner, { rateLimits: [] });
          const fetched_workspace = await storage.workspaces.get(
            workspace!.owner,
          );

          expect(fetched_workspace!.rateLimits).toStrictEqual([]);
          expect(fetched_workspace!.rateLimits).not.toStrictEqual(
            workspace?.rateLimits,
          );
          await storage.workspaces.delete(workspaces.failing_workspace.owner);
        });
      });
      describe("workspaces.delete", () => {
        test("Deletes a workspace", async () => {
          const response = await storage.workspaces.create(
            workspaces.failing_workspace,
          );
          const { success } = response;
          if (!success) return;
          const { data: workspace } = response;
          const record = storage.workspaces.get(
            workspaces.failing_workspace.owner,
          );
          expect(workspace!.owner).not.toBeUndefined;
          expect(record).not.toBeNull();
          await storage.workspaces.delete(workspaces.failing_workspace.owner);
          const record2 = await storage.workspaces.get(
            workspaces.failing_workspace.owner,
          );
          expect(record2).toBeNull();
        });
      });

      describe("workspaces.list", () => {
        test("Returns a list of keys at the given cursor and length", async () => {
          const { workspaces: list } = await storage.workspaces.list(0, 10);

          expect(list[0].owner).not.toBeUndefined;
        });
      });
    });
    describe("storage.limits", () => {
      describe("limits.get_usage", () => {
        test("Gets a limits usage given a scope, key_id, and limit_name", async () => {
          await storage.limits.check_limits(keys.passing_key.hash, []);

          const usage = await storage.limits.get_usage(
            "key",
            global_key!.id,
            keys.passing_key.rateLimits[0].name,
          );

          expect(usage).toBe(1);
        });
      });

      describe("limits.check_limits", () => {
        test("Checks and increments usage given key hash and RateLimit array", async () => {
          const response = await storage.limits.check_limits(
            keys.passing_key.hash,
            [],
          );

          const { success } = response;
          if (!success) return;
          const { data: checks } = response;

          expect(checks?.length).toBe(3);

          const usage = await storage.limits.get_usage(
            "key",
            global_key!.id,
            keys.passing_key.rateLimits[0].name,
          );

          expect(usage).toBe(2);
        });
      });
    });
  });
});
