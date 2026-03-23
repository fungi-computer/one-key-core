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

describe("duplicate detection", () => {
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

  test("should reject duplicate workspace for same owner", async () => {
    const owner = fixtures.create_owner();
    const create1 = await client.admin.workspaces.create({
      owner,
      name: "unique-workspace",
    });
    if (!create1.success) throw create1.error;

    const create2 = await client.admin.workspaces.create({
      owner,
      name: "unique-workspace",
    });
    expect(create2.success).toBe(false);
    expect(create2.error.message).toContain("DUPLICATE_WORKSPACE");
  });

  test("should allow same workspace name for different owners", async () => {
    const owner1 = fixtures.create_owner();
    const owner2 = fixtures.create_owner();

    const ws1 = await client.admin.workspaces.create({
      owner: owner1,
      name: "shared-name",
    });
    if (!ws1.success) throw ws1.error;

    const ws2 = await client.admin.workspaces.create({
      owner: owner2,
      name: "shared-name",
    });
    expect(ws2.success).toBe(true);
    expect(ws1.data.owner).not.toBe(ws2.data.owner);
  });
});
