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

describe("workspace pagination", () => {
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

  test("should paginate workspaces with cursor", async () => {
    // Create 10 workspaces with different owners
    for (let i = 0; i < 10; i++) {
      const workspace_owner = `owner-${fixtures.create_owner()}-${i}`;
      const response = await client.admin.workspaces.create({
        owner: workspace_owner,
        name: `workspace-${i}`,
      });
      if (!response.success) throw response.error;
    }

    // Collect all workspaces across pages using pagination
    // Note: SSCAN COUNT is a hint, not guaranteed
    const all_workspaces: string[] = [];
    let cursor: number | string = 0;

    do {
      const page = await client.admin.workspaces.list(cursor, 3);
      page.workspaces.forEach((ws) => all_workspaces.push(ws.owner));
      cursor = page.next_cursor === "0" ? 0 : parseInt(page.next_cursor as string, 10);
    } while (cursor !== 0 && all_workspaces.length < 10);

    // Verify we got all 10 workspaces
    expect(all_workspaces.length).toBe(10);

    // Verify cursor is exhausted
    expect(cursor).toBe(0);
  });

  test("should return empty result when no workspaces exist", async () => {
    await redis.flushdb();
    const result = await client.admin.workspaces.list(0, 10);
    expect(result.workspaces.length).toBe(0);
    expect(result.next_cursor).toBe("0");
  });
});
