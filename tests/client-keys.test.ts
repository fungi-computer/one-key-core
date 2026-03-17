import { describe, test, expect, beforeEach } from "vitest";
import Redis from "ioredis";
import Storage from "../src/storage/storage";
import Client from "../src/client/client";
import * as fixtures from "./fixtures";

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
});
