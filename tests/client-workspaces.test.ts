import { describe, test, expect, beforeEach } from "vitest";
import Redis from "ioredis";
import Storage from "../src/storage/storage";
import Client from "../src/client/client";
import * as fixtures from "./fixtures";
import { ERR_DUPLICATE_WORKSPACE, ERR_WORKSPACE_NOT_FOUND } from "../src/errors";

const HOST = "localhost";
const PORT = 6379;

const redis = new Redis({ host: HOST, port: PORT });

describe("Client Workspaces", () => {
  const storage = Storage({ redis: redis });
  const client = Client({ storage });

  beforeEach(async () => {
    await redis.flushdb();
  });

  describe("create", () => {
    test("Returns error when workspace already exists", async () => {
      const workspace_data = fixtures.create_workspace();
      const response = await client.workspaces.create(workspace_data);

      if (!response.success) throw response.error;
      expect(response.data.owner).toBe(workspace_data.owner);

      const duplicate_response = await client.workspaces.create(workspace_data);

      expect(duplicate_response.success).toBe(false);
      expect(duplicate_response.error.message).toBe(ERR_DUPLICATE_WORKSPACE);
    });
  });

  describe("update", () => {
    test("Returns error when updating non-existent workspace", async () => {
      const owner = fixtures.create_owner();
      const response = await client.workspaces.update(owner, {
        name: "New Name",
      });

      expect(response.success).toBe(false);
      expect(response.error.message).toBe(ERR_WORKSPACE_NOT_FOUND);
    });
  });

  describe("delete", () => {
    test("Returns error when deleting non-existent workspace", async () => {
      const owner = fixtures.create_owner();
      const response = await client.workspaces.delete(owner);

      expect(response.success).toBe(false);
      expect(response.error.message).toBe(ERR_WORKSPACE_NOT_FOUND);
    });
  });
});
