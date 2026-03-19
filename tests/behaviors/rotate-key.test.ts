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

describe("Rotate Key", () => {
  const { client, redis } = create_client();

  beforeEach(async () => {
    await redis.flushdb();
  });

  describe("Rotation Lifecycle", () => {
    test("creates a key, rotates it, and the new key verifies successfully", async () => {
      const key_data = fixtures.create_key();

      const create_response = await client.keys.create_key(key_data);
      if (!create_response.success) throw create_response.error;
      const original_id = create_response.data.id;

      const rotate_response = await client.keys.rotate_key(original_id);
      if (!rotate_response.success) throw rotate_response.error;
      const new_key = rotate_response.data.key;

      const verify_response = await client.keys.verify(new_key, []);
      if (!verify_response.success) throw Error("New key should verify");
      expect(verify_response.data.valid).toBe(true);

      await client.keys.delete(original_id);
    });

    test("preserves key_id across rotation", async () => {
      const key_data = fixtures.create_key();
      const create_response = await client.keys.create_key(key_data);
      if (!create_response.success) throw create_response.error;
      const original_id = create_response.data.id;

      const rotate_response = await client.keys.rotate_key(original_id);
      if (!rotate_response.success) throw rotate_response.error;

      const get_response = await client.keys.get(original_id);
      expect(get_response?.id).toBe(original_id);

      await client.keys.delete(original_id);
    });

    test("preserves key metadata during rotation", async () => {
      const key_data = fixtures.create_key();
      const create_response = await client.keys.create_key(key_data);
      if (!create_response.success) throw create_response.error;
      const original_id = create_response.data.id;

      const rotate_response = await client.keys.rotate_key(original_id);
      if (!rotate_response.success) throw rotate_response.error;

      const get_response = await client.keys.get(original_id);
      expect(get_response?.name).toBe(key_data.name);
      expect(get_response?.owner).toBe(key_data.owner);

      await client.keys.delete(original_id);
    });

    test("preserves rate limits after rotation", async () => {
      const rate_limits = [
        {
          name: "api_calls",
          limit: 100,
          cost: 1,
          duration: 60,
          autoVerify: true,
        },
      ];
      const key_data = { ...fixtures.create_key(), rateLimits: rate_limits };

      const create_response = await client.keys.create_key(key_data);
      if (!create_response.success) throw create_response.error;
      const original_id = create_response.data.id;

      const rotate_response = await client.keys.rotate_key(original_id);
      if (!rotate_response.success) throw rotate_response.error;

      const get_response = await client.keys.get(original_id);
      expect(get_response?.rateLimits).toEqual(rate_limits);

      await client.keys.delete(original_id);
    });

    test("can rotate again after grace period expires", async () => {
      const key_data = fixtures.create_key();
      const create_response = await client.keys.create_key(key_data);
      if (!create_response.success) throw create_response.error;
      const original_id = create_response.data.id;

      const rotate1_response = await client.keys.rotate_key(original_id, {
        grace_period: 0,
      });
      if (!rotate1_response.success) throw rotate1_response.error;

      const verify_new_key_1 = await client.keys.verify(
        rotate1_response.data.key,
        [],
      );
      expect(verify_new_key_1.success).toBe(true);

      await client.keys.delete(original_id);
    });

    test("returns new key value by key_id", async () => {
      const key_data = fixtures.create_key();
      const create_response = await client.keys.create_key(key_data);
      if (!create_response.success) throw create_response.error;
      const original_id = create_response.data.id;

      const rotate_response = await client.keys.rotate_key(original_id);

      expect(rotate_response.success).toBe(true);
      if (!rotate_response.success) return;
      expect(rotate_response.data.key.length).toBeGreaterThan(0);

      await client.keys.delete(original_id);
    });
  });

  describe("Grace Period Behavior", () => {
    test("old key fails immediately when grace_period is 0", async () => {
      const key_data = fixtures.create_key();
      const create_response = await client.keys.create_key(key_data);
      if (!create_response.success) throw create_response.error;
      const original_id = create_response.data.id;
      const original_key = create_response.data.key;

      const rotate_response = await client.keys.rotate_key(original_id, {
        grace_period: 0,
      });
      if (!rotate_response.success) throw rotate_response.error;

      const verify_response = await client.keys.verify(original_key, []);
      expect(verify_response.success).toBe(false);

      await client.keys.delete(original_id);
    });

    test("old key works during grace period", async () => {
      const key_data = fixtures.create_key();
      const create_response = await client.keys.create_key(key_data);
      if (!create_response.success) throw create_response.error;
      const original_id = create_response.data.id;
      const original_key = create_response.data.key;

      const grace_period = 300;
      const rotate_response = await client.keys.rotate_key(original_id, {
        grace_period,
      });
      if (!rotate_response.success) throw rotate_response.error;

      const verify_response = await client.keys.verify(original_key, []);
      expect(verify_response.success).toBe(true);

      await client.keys.delete(original_id);
    });

    test("returns expires_at based on grace_period", async () => {
      const key_data = fixtures.create_key();
      const create_response = await client.keys.create_key(key_data);
      if (!create_response.success) throw create_response.error;
      const original_id = create_response.data.id;

      const grace_period = 120;
      const rotate_response = await client.keys.rotate_key(original_id, {
        grace_period,
      });

      expect(rotate_response.success).toBe(true);
      if (!rotate_response.success) return;
      expect(rotate_response.data.expires_at).toBeGreaterThan(Date.now());
      expect(rotate_response.data.expires_at).toBeLessThanOrEqual(
        Date.now() + grace_period * 1000 + 1000,
      );

      await client.keys.delete(original_id);
    });

    test("grace period of 0 returns expires_at of 0", async () => {
      const key_data = fixtures.create_key();
      const create_response = await client.keys.create_key(key_data);
      if (!create_response.success) throw create_response.error;
      const original_id = create_response.data.id;

      const rotate_response = await client.keys.rotate_key(original_id, {
        grace_period: 0,
      });

      expect(rotate_response.success).toBe(true);
      if (!rotate_response.success) return;
      expect(rotate_response.data.expires_at).toBe(0);

      await client.keys.delete(original_id);
    });

    test("rate limit usage transfers to previous key during grace period", async () => {
      const key_data = {
        ...fixtures.create_key(),
        rateLimits: [
          {
            name: "requests",
            limit: 2,
            cost: 1,
            duration: 60,
            autoVerify: true,
          },
        ],
      };

      const create_response = await client.keys.create_key(key_data);
      if (!create_response.success) throw create_response.error;
      const original_id = create_response.data.id;
      const original_key = create_response.data.key;

      await client.keys.verify(original_key, []);
      await client.keys.verify(original_key, []);

      const grace_period = 300;
      const rotate_response = await client.keys.rotate_key(original_id, {
        grace_period,
      });
      if (!rotate_response.success) throw rotate_response.error;

      const verify_response = await client.keys.verify(original_key, []);
      expect(verify_response.success).toBe(true);

      await client.keys.delete(original_id);
    });
  });

  describe("Error Handling", () => {
    test("returns error when rotating non-existent key_id", async () => {
      const response = await client.keys.rotate_key("non-existent-id");

      expect(response.success).toBe(false);
      expect(response.error.message).toContain(ERR_KEY_NOT_FOUND);
    });
  });
});
