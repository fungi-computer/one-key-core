import { describe, test, expect } from "vitest";
import Redis from "ioredis";
import OneKey from "../../src/client/client";
import * as fixtures from "../fixtures";

const HOST = "localhost";
const PORT = 6379;

describe("redis failure recovery", () => {
  test("should throw when using disconnected redis", async () => {
    const redis = new Redis({ host: HOST, port: PORT, lazyConnect: true });
    await redis.quit();

    const client = OneKey({ redis });

    await expect(client.keys.create_key({ owner: "user", name: "key" }))
      .rejects.toThrow();
  });

  test("should handle storage errors when redis closes mid-operation", async () => {
    const redis = new Redis({ host: HOST, port: PORT });
    await redis.flushdb();

    const client = OneKey({ redis });

    const owner = fixtures.create_owner();
    const create_response = await client.keys.create_key({ owner, name: "test-key" });
    if (!create_response.success) throw create_response.error;

    const key_id = create_response.data.id;

    await redis.quit();

    await expect(client.admin.keys.get(key_id)).rejects.toThrow();
  });
});
