import { describe, test, expect, beforeEach, afterEach } from "vitest";
import Redis from "ioredis";
import OneKey from "../../src/client/client";
import * as fixtures from "../fixtures";

const HOST = "localhost";
const PORT = 6379;

const create_client = () => {
  const redis = new Redis({ host: HOST, port: PORT });
  const client = OneKey({ redis });
  return { client, redis };
};

describe("key pagination", () => {
  let client: ReturnType<typeof create_client>["client"];
  let redis: ReturnType<typeof create_client>["redis"];

  beforeEach(async () => {
    const setup = create_client();
    client = setup.client;
    redis = setup.redis;
    await redis.flushdb();
  });

  afterEach(async () => {
    await redis?.quit();
  });

  test("should list all keys for owner without pagination", async () => {
    const owner = fixtures.create_owner();
    // Create 15 keys for the owner
    for (let i = 0; i < 15; i++) {
      const response = await client.keys.create_key({ owner, name: `key-${i}` });
      if (!response.success) throw response.error;
    }

    // list_by_owner returns all keys with pagination support
    const result = await client.admin.keys.list_by_owner(owner);
    expect(result.keys.length).toBe(15);
  });

  test("should return empty result when owner has no keys", async () => {
    const owner = fixtures.create_owner();
    const result = await client.admin.keys.list_by_owner(owner);
    expect(result.keys.length).toBe(0);
  });
});
