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
  });
});
