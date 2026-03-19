import { describe, test, expect, beforeEach } from "vitest";
import Redis from "ioredis";
import Storage from "../src/storage/storage";
import Client from "../src/client/client";
import * as fixtures from "./fixtures";
import {
  ERR_KEY_NOT_FOUND,
  ERR_KEY_ALREADY_ROTATED,
  ERR_ROTATION_FAILED,
} from "../src/errors";

const HOST = "localhost";
const PORT = 6379;

const redis = new Redis({ host: HOST, port: PORT });

describe("Key Rotation", () => {
  const storage = Storage({ redis: redis });
  const client = Client({ storage: storage });

  beforeEach(async () => {
    await redis.flushdb();
  });

  describe("Storage Keys", () => {
    describe("rotate", () => {
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
        if (result.success) return;
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

  describe("Client Keys", () => {
    describe("rotate_key", () => {
      test("Returns new key value", async () => {
        const key_data = fixtures.create_key();
        const create_response = await client.keys.create_key(key_data);
        if (!create_response.success) throw create_response.error;
        const original_key = create_response.data.key;

        const rotate_response = await client.keys.rotate_key(original_key);

        expect(rotate_response.success).toBe(true);
        if (!rotate_response.success) return;
        expect(rotate_response.data.key).not.toBe(original_key);
        expect(rotate_response.data.key.length).toBeGreaterThan(0);

        await client.keys.delete(rotate_response.data.key);
      });

      test("Returns expires_at based on grace_period", async () => {
        const key_data = fixtures.create_key();
        const create_response = await client.keys.create_key(key_data);
        if (!create_response.success) throw create_response.error;
        const original_key = create_response.data.key;

        const grace_period = 120;
        const rotate_response = await client.keys.rotate_key(original_key, {
          grace_period,
        });

        expect(rotate_response.success).toBe(true);
        if (!rotate_response.success) return;
        expect(rotate_response.data.expires_at).toBeGreaterThan(Date.now());
        expect(rotate_response.data.expires_at).toBeLessThanOrEqual(
          Date.now() + grace_period * 1000 + 1000,
        );

        await client.keys.delete(rotate_response.data.key);
      });

      test("Grace period of 0 returns expires_at of 0", async () => {
        const key_data = fixtures.create_key();
        const create_response = await client.keys.create_key(key_data);
        if (!create_response.success) throw create_response.error;
        const original_key = create_response.data.key;

        const rotate_response = await client.keys.rotate_key(original_key, {
          grace_period: 0,
        });

        expect(rotate_response.success).toBe(true);
        if (!rotate_response.success) return;
        expect(rotate_response.data.expires_at).toBe(0);

        await client.keys.delete(rotate_response.data.key);
      });

      test("Returns error when rotating non-existent key", async () => {
        const response = await client.keys.rotate_key("non-existent-key");

        expect(response.success).toBe(false);
        if (response.success) return;
        expect(response.error.message).toContain(ERR_KEY_NOT_FOUND);
      });

      test("Preserves key metadata during rotation", async () => {
        const key_data = fixtures.create_key();
        const create_response = await client.keys.create_key(key_data);
        if (!create_response.success) throw create_response.error;
        const original_key = create_response.data.key;
        const original_id = create_response.data.id;

        const rotate_response = await client.keys.rotate_key(original_key);
        if (!rotate_response.success) throw rotate_response.error;

        const get_response = await client.keys.get(original_id);
        expect(get_response?.id).toBe(original_id);
        expect(get_response?.name).toBe(key_data.name);
        expect(get_response?.owner).toBe(key_data.owner);

        await client.keys.delete(original_id);
      });
    });

    describe("verify after rotation", () => {
      test("New key verifies successfully", async () => {
        const key_data = fixtures.create_key();
        const create_response = await client.keys.create_key(key_data);
        if (!create_response.success) throw create_response.error;
        const original_key = create_response.data.key;

        const rotate_response = await client.keys.rotate_key(original_key);
        if (!rotate_response.success) throw rotate_response.error;
        const new_key = rotate_response.data.key;

        const verify_response = await client.keys.verify(new_key, []);
        expect(verify_response.success).toBe(true);
        if (!verify_response.success) return;
        expect(verify_response.data.valid).toBe(true);

        await client.keys.delete(new_key);
      });

      test("Old key fails immediately when grace_period is 0", async () => {
        const key_data = fixtures.create_key();
        const create_response = await client.keys.create_key(key_data);
        if (!create_response.success) throw create_response.error;
        const original_key = create_response.data.key;

        const rotate_response = await client.keys.rotate_key(original_key, {
          grace_period: 0,
        });
        if (!rotate_response.success) throw rotate_response.error;

        const verify_response = await client.keys.verify(original_key, []);
        expect(verify_response.success).toBe(false);
        if (verify_response.success) return;
        expect(verify_response.error.message).toContain(ERR_KEY_NOT_FOUND);

        await client.keys.delete(rotate_response.data.key);
      });

      test("Old key works during grace period", async () => {
        const key_data = fixtures.create_key();
        const create_response = await client.keys.create_key(key_data);
        if (!create_response.success) throw create_response.error;
        const original_key = create_response.data.key;

        const grace_period = 300;
        const rotate_response = await client.keys.rotate_key(original_key, {
          grace_period,
        });
        if (!rotate_response.success) throw rotate_response.error;

        const verify_response = await client.keys.verify(original_key, []);
        expect(verify_response.success).toBe(true);
        if (!verify_response.success) return;
        expect(verify_response.data.valid).toBe(true);

        await client.keys.delete(rotate_response.data.key);
      });

      test("Rate limit usage transfers to previous key during grace period", async () => {
        const key_data = fixtures.create_key();
        const create_response = await client.keys.create_key({
          ...key_data,
          rateLimits: [
            {
              name: "requests",
              limit: 2,
              cost: 1,
              duration: 60,
              autoVerify: true,
            },
          ],
        });
        if (!create_response.success) throw create_response.error;
        const original_key = create_response.data.key;

        await client.keys.verify(original_key, []);
        await client.keys.verify(original_key, []);

        const grace_period = 300;
        const rotate_response = await client.keys.rotate_key(original_key, {
          grace_period,
        });
        if (!rotate_response.success) throw rotate_response.error;

        const verify_response = await client.keys.verify(original_key, []);
        expect(verify_response.success).toBe(true);

        await client.keys.delete(rotate_response.data.key);
      });

      test("Cannot rotate during active grace period of previous rotation", async () => {
        const key_data = fixtures.create_key();
        const create_response = await client.keys.create_key(key_data);
        if (!create_response.success) throw create_response.error;
        const original_key = create_response.data.key;

        const rotate1_response = await client.keys.rotate_key(original_key, {
          grace_period: 300,
        });
        if (!rotate1_response.success) throw rotate1_response.error;

        const rotate_again_response =
          await client.keys.rotate_key(original_key);

        expect(rotate_again_response.success).toBe(false);
        if (rotate_again_response.success) return;
        expect(rotate_again_response.error.message).toContain(
          ERR_KEY_ALREADY_ROTATED,
        );

        await client.keys.delete(rotate1_response.data.key);
      });
    });

    describe("rotation edge cases", () => {
      test("Can rotate again after grace period expires", async () => {
        const key_data = fixtures.create_key();
        const create_response = await client.keys.create_key(key_data);
        if (!create_response.success) throw create_response.error;
        const original_key = create_response.data.key;

        const grace_period = 0;
        const rotate1_response = await client.keys.rotate_key(original_key, {
          grace_period,
        });
        if (!rotate1_response.success) throw rotate1_response.error;
        const new_key_1 = rotate1_response.data.key;

        const verify_new_key_1 = await client.keys.verify(new_key_1, []);
        expect(verify_new_key_1.success).toBe(true);

        await client.keys.delete(new_key_1);
      });

      test("Rotating without grace_period uses new key only", async () => {
        const key_data = fixtures.create_key();
        const create_response = await client.keys.create_key(key_data);
        if (!create_response.success) throw create_response.error;
        const original_key = create_response.data.key;

        const rotate_response = await client.keys.rotate_key(original_key);
        if (!rotate_response.success) throw rotate_response.error;

        const verify_original = await client.keys.verify(original_key, []);
        expect(verify_original.success).toBe(false);

        const verify_new = await client.keys.verify(
          rotate_response.data.key,
          [],
        );
        expect(verify_new.success).toBe(true);

        await client.keys.delete(rotate_response.data.key);
      });

      test("Preserves rate limits after rotation", async () => {
        const key_data = fixtures.create_key();
        const rate_limits = [
          {
            name: "api_calls",
            limit: 100,
            cost: 1,
            duration: 60,
            autoVerify: true,
          },
        ];
        const create_response = await client.keys.create_key({
          ...key_data,
          rateLimits: rate_limits,
        });
        if (!create_response.success) throw create_response.error;
        const original_key = create_response.data.key;
        const original_id = create_response.data.id;

        const rotate_response = await client.keys.rotate_key(original_key);
        if (!rotate_response.success) throw rotate_response.error;

        const get_response = await client.keys.get(original_id);
        expect(get_response?.rateLimits).toEqual(rate_limits);

        await client.keys.delete(original_id);
      });
    });
  });
});
