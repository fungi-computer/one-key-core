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

  describe("create_key", () => {
    test("Generates, hashes, and stores a new key", async () => {
      const key_data = fixtures.create_key();
      const response = await client.keys.create_key(key_data);

      if (!response.success) throw response.error;
      expect(response.data!.key).not.toBeUndefined();

      const key = await client.keys.get(response.data.key);

      expect(key?.hash).toBeUndefined();
      await client.keys.delete(response.data.key);
      const key_again = await client.keys.get(response.data.key);
      expect(key_again).toBeNull();
    });
  });

  describe("delete", () => {
    test("Deletes a key given the KEY NOT HASH", async () => {
      const key_data = fixtures.create_key();
      const response = await client.keys.create_key(key_data);

      if (!response.success) throw response.error;

      await client.keys.delete(response.data.key);
      const key_again = await client.keys.get(response.data.key);
      expect(key_again).toBeNull();
    });

    test("Returns error when deleting non-existent key", async () => {
      const non_existent_key = "non_existent_key_123";
      const response = await client.keys.delete(non_existent_key);

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
        response.data.key,
      );

      expect(delete_response.success).toBe(false);
      expect(delete_response.error.message).toBe("Redis connection failed");

      await client.keys.delete(response.data.key);
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
      await client.keys.delete(response.data.key);
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

      await client.keys.delete(response.data.key);
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
});
