import { describe, test, expect, beforeEach } from "vitest";
import Redis from "ioredis";
import Storage from "../src/storage/storage";
import Client from "../src/client/client";
import * as fixtures from "./fixtures";
import { ERR_KEY_NOT_FOUND } from "../src/errors";

const HOST = "localhost";
const PORT = 6379;

const redis = new Redis({ host: HOST, port: PORT });

describe("Client Keys", () => {
  const storage = Storage({ redis: redis });
  const client = Client({ storage });

  beforeEach(async () => {
    await redis.flushdb();
  });

  describe("get", () => {
    test("Gets a key by key_id", async () => {
      const key_data = fixtures.create_key();
      const create_response = await client.keys.create_key(key_data);

      if (!create_response.success) throw create_response.error;

      const get_response = await client.keys.get(create_response.data.id);

      expect(get_response?.id).toBe(create_response.data.id);
      expect(get_response?.owner).toBe(key_data.owner);
      expect(get_response?.hash).toBeUndefined();

      await client.keys.delete(create_response.data.id);
      const key_again = await client.keys.get(create_response.data.id);
      expect(key_again).toBeNull();
    });

    test("Returns null for non-existent key_id", async () => {
      const get_response = await client.keys.get("non-existent-id");

      expect(get_response).toBeNull();
    });
  });

  describe("create_key", () => {
    test("Generates, hashes, and stores a new key", async () => {
      const key_data = fixtures.create_key();
      const response = await client.keys.create_key(key_data);

      if (!response.success) throw response.error;
      expect(response.data!.key).not.toBeUndefined();

      const key = await client.keys.get(response.data.id);

      expect(key?.hash).toBeUndefined();
      await client.keys.delete(response.data.id);
      const key_again = await client.keys.get(response.data.id);
      expect(key_again).toBeNull();
    });

    test("Generates key with custom prefix", async () => {
      const key_data = fixtures.create_key();
      const response = await client.keys.create_key(key_data, {
        prefix: "test",
      });

      if (!response.success) throw response.error;
      expect(response.data!.key).toMatch(/^test_/);

      await client.keys.delete(response.data.id);
    });

    test("Returns error when owner is missing", async () => {
      const response = await client.keys.create_key({
        name: "Test Key",
        rateLimits: [],
      } as any);

      expect(response.success).toBe(false);
      expect(response.error.message).toContain("owner");
    });
  });

  describe("delete", () => {
    test("Deletes a key by key_id", async () => {
      const key_data = fixtures.create_key();
      const response = await client.keys.create_key(key_data);

      if (!response.success) throw response.error;

      await client.keys.delete(response.data.id);
      const key_again = await client.keys.get(response.data.id);
      expect(key_again).toBeNull();
    });

    test("Returns error when deleting non-existent key", async () => {
      const non_existent_id = "non_existent_id_123";
      const response = await client.keys.delete(non_existent_id);

      expect(response.success).toBe(false);
      expect(response.error.message).toBe(ERR_KEY_NOT_FOUND);
    });

    test("Returns error when Redis fails during delete", async () => {
      const key_data = fixtures.create_key();
      const response = await client.keys.create_key(key_data);

      if (!response.success) throw response.error;

      const failing_redis = Object.assign(new Redis({ host: HOST, port: PORT }), {
        multi: () => {
          throw new Error("Redis connection failed");
        },
      });

      const storage_with_failing_redis = Storage({ redis: failing_redis });
      const client_with_failing_redis = Client({ storage: storage_with_failing_redis });

      const delete_response = await client_with_failing_redis.keys.delete(
        response.data.id,
      );

      expect(delete_response.success).toBe(false);
      expect(delete_response.error.message).toBe("Redis connection failed");

      await client.keys.delete(response.data.id);
    });
  });

  describe("verify", () => {
    test("Verifies a key and returns valid=true", async () => {
      const key_data = fixtures.create_key();
      const response = await client.keys.create_key(key_data);

      if (!response.success) throw response.error;

      const verify_response = await client.keys.verify(response.data.key, []);

      if (!verify_response.success) throw Error("Shouldn't break here");
      const { data: key } = verify_response;
      expect(key.valid).toBe(true);
      await client.keys.delete(response.data.id);
    });

    test("Returns error when verifying non-existent key", async () => {
      const response = await client.keys.verify("non_existent_key", []);

      expect(response.success).toBe(false);
      expect(response.error.message).toContain("KEY_NOT_FOUND");
    });
  });

  describe("update", () => {
    test("Updates an existing key", async () => {
      const key_data = fixtures.create_key();
      const response = await client.keys.create_key(key_data);

      if (!response.success) throw response.error;

      const update_response = await client.keys.update(response.data.key, {
        name: "Updated Key Name",
      });

      expect(update_response.success).toBe(true);
      expect(update_response.data?.name).toBe("Updated Key Name");

      await client.keys.delete(response.data.id);
    });

    test("Returns error when updating non-existent key", async () => {
      const non_existent_key = "non_existent_key_123";
      const response = await client.keys.update(non_existent_key, {
        name: "New Name",
      });

      expect(response.success).toBe(false);
      expect(response.error.message).toBe(ERR_KEY_NOT_FOUND);
    });
  });

  describe("lookup", () => {
    test("Returns full key data for a valid plaintext key", async () => {
      const key_data = fixtures.create_key();
      const create_response = await client.keys.create_key(key_data);

      if (!create_response.success) throw create_response.error;

      const lookup_response = await client.keys.lookup(create_response.data.key);

      expect(lookup_response.success).toBe(true);
      expect(lookup_response.data?.id).toBe(create_response.data.id);
      expect(lookup_response.data?.owner).toBe(key_data.owner);
      expect(lookup_response.data?.name).toBe(key_data.name);
      expect(lookup_response.data?.hash).toBeUndefined();

      await client.keys.delete(create_response.data.id);
    });

    test("Returns error for non-existent key", async () => {
      const lookup_response = await client.keys.lookup("non_existent_key");

      expect(lookup_response.success).toBe(false);
      expect(lookup_response.error.message).toBe(ERR_KEY_NOT_FOUND);
    });
  });
});
