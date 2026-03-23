import { describe, test, expect, beforeEach } from "vitest";
import Redis from "ioredis";
import OneKey from "../../src/client/client";
import * as fixtures from "../fixtures";
import { ERR_DUPLICATE_WORKSPACE, ERR_WORKSPACE_NOT_FOUND } from "../../src/errors";

const HOST = "localhost";
const PORT = 6379;

const create_client = () => {
  const redis = new Redis({ host: HOST, port: PORT });
  const client = OneKey({ redis });
  return { client, redis };
};

describe("Workspace Management", () => {
  const { client, redis } = create_client();

  beforeEach(async () => {
    await redis.flushdb();
  });

  describe("Workspace Lifecycle", () => {
    test("creates a workspace, updates it, and deletes it", async () => {
      const workspace_data = fixtures.create_workspace();

      const create_response = await client.admin.workspaces.create(workspace_data);
      if (!create_response.success) throw create_response.error;
      expect(create_response.data.owner).toBe(workspace_data.owner);

      const update_response = await client.admin.workspaces.update(
        workspace_data.owner,
        { name: "Updated Workspace" },
      );
      expect(update_response.success).toBe(true);

      const delete_response = await client.admin.workspaces.delete(
        workspace_data.owner,
      );
      expect(delete_response.success).toBe(true);
    });

    test("returns error when workspace already exists", async () => {
      const workspace_data = fixtures.create_workspace();

      const response = await client.admin.workspaces.create(workspace_data);
      if (!response.success) throw response.error;

      const duplicate_response = await client.admin.workspaces.create(workspace_data);

      expect(duplicate_response.success).toBe(false);
      expect(duplicate_response.error.message).toBe(ERR_DUPLICATE_WORKSPACE);
    });
  });

  describe("Error Handling", () => {
    test("returns error when updating non-existent workspace", async () => {
      const owner = fixtures.create_owner();

      const response = await client.admin.workspaces.update(owner, {
        name: "New Name",
      });

      expect(response.success).toBe(false);
      expect(response.error.message).toBe(ERR_WORKSPACE_NOT_FOUND);
    });

    test("returns error when deleting non-existent workspace", async () => {
      const owner = fixtures.create_owner();

      const response = await client.admin.workspaces.delete(owner);

      expect(response.success).toBe(false);
      expect(response.error.message).toBe(ERR_WORKSPACE_NOT_FOUND);
    });
  });
});
