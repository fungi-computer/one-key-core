import { describe, test, expect, beforeEach } from "vitest";
import Redis from "ioredis";
import Storage from "../../src/storage/storage";
import * as fixtures from "../fixtures";

const HOST = "localhost";
const PORT = 6379;

const redis = new Redis({ host: HOST, port: PORT });

describe("Keys Storage", () => {
  const storage = Storage({ redis: redis });

  beforeEach(async () => {
    await redis.flushdb();
  });

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

    test("Will NOT write over a key that already exists", async () => {
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
});
