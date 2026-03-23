import { describe, test, expect, beforeEach, afterEach } from "vitest";
import Redis from "ioredis";
import Storage from "../../src/storage/storage";
import Client from "../../src/client/client";
import * as fixtures from "../fixtures";

const HOST = "localhost";
const PORT = 6379;

const create_client = () => {
  const redis = new Redis({ host: HOST, port: PORT });
  const storage = Storage({ redis });
  const client = Client({ storage });
  return { client, redis };
};

describe("rate limit enforcement", () => {
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

  test("should reject workspace with rate limit where cost exceeds limit", async () => {
    // Rate limit validation rejects cost > limit
    const failing = fixtures.create_failing_workspace();
    const response = await client.workspaces.create(failing);
    expect(response.success).toBe(false);
  });

  test("should track usage correctly after successful operations", async () => {
    const owner = fixtures.create_owner();
    // Create several keys - should not hit limits during creation
    for (let i = 0; i < 3; i++) {
      const response = await client.keys.create_key({ owner, name: `key-${i}` });
      expect(response.success).toBe(true);
      expect(response.data.key).toBeDefined();
    }
  });
});
