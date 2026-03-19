import { describe, test, expect, beforeEach } from "vitest";
import Redis from "ioredis";
import Storage from "../../src/storage/storage";
import Client from "../../src/client/client";
import * as fixtures from "./fixtures";
import { ERR_KEY_NOT_FOUND } from "../../src/errors";

const HOST = "localhost";
const PORT = 6379;

const create_client = () => {
  const redis = new Redis({ host: HOST, port: PORT });
  const storage = Storage({ redis });
  const client = Client({ storage });
  return { client, redis };
};

describe("Create Key", () => {
  const { client, redis } = create_client();

  beforeEach(async () => {
    await redis.flushdb();
  });

  describe("Key Lifecycle", () => {
    test("creates a key, verifies it works, and deletes it", async () => {
      const key_data = fixtures.create_key();

      const create_response = await client.keys.create_key(key_data);
      if (!create_response.success) throw create_response.error;
      expect(create_response.data.key).not.toBeUndefined();

      const verify_response = await client.keys.verify(create_response.data.key, []);
      if (!verify_response.success) throw Error("Verification should succeed");
      expect(verify_response.data.valid).toBe(true);

      const get_response = await client.keys.get(create_response.data.id);
      expect(get_response?.id).toBe(create_response.data.id);
      expect(get_response?.owner).toBe(key_data.owner);
      expect(get_response?.hash).toBeUndefined();

      const delete_response = await client.keys.delete(create_response.data.id);
      expect(delete_response.success).toBe(true);

      const get_after_delete = await client.keys.get(create_response.data.id);
      expect(get_after_delete).toBeNull();
    });

    test("creates a key with custom prefix", async () => {
      const key_data = fixtures.create_key();

      const response = await client.keys.create_key(key_data, {
        prefix: "test",
      });

      if (!response.success) throw response.error;
      expect(response.data.key).toMatch(/^test_/);

      await client.keys.delete(response.data.id);
    });

    test("looks up key by plaintext value", async () => {
      const key_data = fixtures.create_key();
      const create_response = await client.keys.create_key(key_data);
      if (!create_response.success) throw create_response.error;

      const lookup_response = await client.keys.lookup(create_response.data.key);

      expect(lookup_response.success).toBe(true);
      expect(lookup_response.data?.id).toBe(create_response.data.id);
      expect(lookup_response.data?.owner).toBe(key_data.owner);
      expect(lookup_response.data?.hash).toBeUndefined();

      await client.keys.delete(create_response.data.id);
    });

    test("updates an existing key", async () => {
      const key_data = fixtures.create_key();
      const create_response = await client.keys.create_key(key_data);
      if (!create_response.success) throw create_response.error;

      const update_response = await client.keys.update(create_response.data.id, {
        name: "Updated Key Name",
      });

      expect(update_response.success).toBe(true);
      expect(update_response.data?.name).toBe("Updated Key Name");

      await client.keys.delete(create_response.data.id);
    });
  });

  describe("Error Handling", () => {
    test("returns error when owner is missing", async () => {
      const response = await client.keys.create_key({
        name: "Test Key",
        rateLimits: [],
      } as any);

      expect(response.success).toBe(false);
      expect(response.error.message).toContain("owner");
    });

    test("returns null when getting non-existent key", async () => {
      const get_response = await client.keys.get("non-existent-id");

      expect(get_response).toBeNull();
    });

    test("returns error when updating non-existent key", async () => {
      const response = await client.keys.update("non-existent-id", {
        name: "New Name",
      });

      expect(response.success).toBe(false);
      expect(response.error.message).toBe(ERR_KEY_NOT_FOUND);
    });

    test("returns error when deleting non-existent key", async () => {
      const response = await client.keys.delete("non_existent_id_123");

      expect(response.success).toBe(false);
      expect(response.error.message).toBe(ERR_KEY_NOT_FOUND);
    });

    test("returns error when verifying non-existent key", async () => {
      const response = await client.keys.verify("non_existent_key", []);

      expect(response.success).toBe(false);
      expect(response.error.message).toContain("KEY_NOT_FOUND");
    });

    test("returns error when looking up non-existent key", async () => {
      const response = await client.keys.lookup("non_existent_key");

      expect(response.success).toBe(false);
      expect(response.error.message).toBe(ERR_KEY_NOT_FOUND);
    });

    test("returns error when Redis fails during delete", async () => {
      const key_data = fixtures.create_key();
      const create_response = await client.keys.create_key(key_data);
      if (!create_response.success) throw create_response.error;

      const failing_redis = Object.assign(new Redis({ host: HOST, port: PORT }), {
        multi: () => {
          throw new Error("Redis connection failed");
        },
      });

      const failing_storage = Storage({ redis: failing_redis });
      const failing_client = Client({ storage: failing_storage });

      const delete_response = await failing_client.keys.delete(
        create_response.data.id,
      );

      expect(delete_response.success).toBe(false);
      expect(delete_response.error.message).toBe("Redis connection failed");

      await client.keys.delete(create_response.data.id);
    });
  });
});
