import { describe, test, expect, beforeAll } from "vitest";
import Redis from "ioredis";
import Storage from "../src/storage/storage";

const HOST = "localhost";
const PORT = 6379;

import Client from "../src/client/client";
import { keys } from "./fixtures";
const redis = new Redis({ host: HOST, port: PORT });

const storage = Storage({ redis: redis });
const client = Client({ storage });

describe("Client", () => {
  beforeAll(async () => {
    await redis.flushdb();
  });
  describe("keys", () => {
    describe("create_key", () => {
      test("Generates, hashes, and stores a new key", async () => {
        const response = await client.keys.create_key(keys.passing_key);

        if (!response.success) throw response.error;
        expect(response.data!.key).not.toBeUndefined();

        const key = await client.keys.get(response.data.key);

        // @ts-expect-error I know it doesn't exist on the
        // type, would still like a test verifying it
        // doesn't magically appear.
        expect(key?.hash).toBeUndefined();
        await client.keys.delete(response.data.key);
        const key_again = await client.keys.get(response.data.key);
        expect(key_again).toBeNull();
      });
    });
    describe("delete", () => {
      test("Deletes a key given the KEY NOT HASH", async () => {
        const response = await client.keys.create_key(keys.passing_key);

        if (!response.success) throw response.error;

        await client.keys.delete(response.data.key);
        const key_again = await client.keys.get(response.data.key);
        expect(key_again).toBeNull();
      });
    });
    describe("verify", () => {
      test("Verifys a given key", async () => {
        const response = await client.keys.create_key(keys.passing_key);

        if (!response.success) throw response.error;

        const verify_response = await client.keys.verify(response.data.key, []);
        if (!verify_response.success) throw Error("Shouldn't break here");
        const { data: key } = verify_response;
        expect(key.valid).toBe(true);
        await client.keys.delete(response.data.key);
      });
    });
  });
});
