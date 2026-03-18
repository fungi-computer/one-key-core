import { describe, test, expect, beforeEach } from "vitest";
import Redis from "ioredis";
import Storage from "../../src/storage/storage";
import * as fixtures from "../fixtures";
import { ERR_WORKSPACE_NOT_FOUND } from "../../src/errors";

const HOST = "localhost";
const PORT = 6379;

const redis = new Redis({ host: HOST, port: PORT });

describe("Workspaces Storage", () => {
  const storage = Storage({ redis: redis });

  beforeEach(async () => {
    await redis.flushdb();
  });

  describe("workspaces.get", () => {
    test("Gets a workspace from an owner id", async () => {
      const workspace = fixtures.create_workspace();
      await storage.workspaces.create(workspace);
      const retrieved = await storage.workspaces.get(workspace.owner);

      expect(retrieved).not.toBeNull();
    });
  });

  describe("workspaces.create", () => {
    test("Creates a workspace record", async () => {
      const workspace = fixtures.create_workspace();
      const result = await storage.workspaces.create(workspace);
      expect(result).not.toBeNull();
      await storage.workspaces.delete(workspace.owner);
    });

    test("Returns error for invalid workspace data", async () => {
      const response = await storage.workspaces.create({
        owner: 123 as any,
        name: "Test Workspace",
      });

      expect(response.success).toBe(false);
      if (response.success) throw Error("Should NOT succeed");
      expect(response.error.message).toContain("WORKSPACE_VALIDATION");
    });

    test("Returns error for workspace missing required name field", async () => {
      const owner = fixtures.create_owner();
      const response = await storage.workspaces.create({
        owner,
      } as any);

      expect(response.success).toBe(false);
      if (response.success) throw Error("Should NOT succeed");
      expect(response.error.message).toContain("WORKSPACE_VALIDATION");
    });

    test("Returns error when workspace already exists", async () => {
      const workspace = fixtures.create_workspace();
      await storage.workspaces.create(workspace);

      const response2 = await storage.workspaces.create(workspace);

      expect(response2.success).toBe(false);
      if (response2.success) throw Error("Should NOT succeed");
      expect(response2.error.message).toContain("DUPLICATE_WORKSPACE");

      await storage.workspaces.delete(workspace.owner);
    });
  });

  describe("workspaces.update", () => {
    test("Updates a workspace record", async () => {
      const workspace = fixtures.create_workspace();
      await storage.workspaces.create(workspace);

      await storage.workspaces.update(workspace.owner, { rateLimits: [] });
      const fetched_workspace = await storage.workspaces.get(workspace.owner);

      expect(fetched_workspace!.rateLimits).toStrictEqual([]);
      await storage.workspaces.delete(workspace.owner);
    });

    test("Returns error for invalid update data", async () => {
      const workspace = fixtures.create_workspace();
      await storage.workspaces.create(workspace);

      const response = await storage.workspaces.update(workspace.owner, {
        rateLimits: [{ name: "invalid" }] as any,
      });

      expect(response.success).toBe(false);
      if (response.success) throw Error("Should NOT succeed");
      expect(response.error.message).toContain("WORKSPACE_VALIDATION");

      await storage.workspaces.delete(workspace.owner);
    });

    test("Returns error when updating non-existent workspace", async () => {
      const response = await storage.workspaces.update("non-existent-owner", {
        name: "New Name",
      });

      expect(response.success).toBe(false);
      if (response.success) throw Error("Should NOT succeed");
      expect(response.error.message).toContain(ERR_WORKSPACE_NOT_FOUND);
    });
  });

  describe("workspaces.delete", () => {
    test("Deletes a workspace", async () => {
      const workspace = fixtures.create_workspace();
      await storage.workspaces.create(workspace);

      const record = await storage.workspaces.get(workspace.owner);
      expect(record).not.toBeNull();
      await storage.workspaces.delete(workspace.owner);
      const record2 = await storage.workspaces.get(workspace.owner);
      expect(record2).toBeNull();
    });
  });

  describe("workspaces.list", () => {
    test("Returns a list of workspaces at the given cursor and length", async () => {
      const workspace = fixtures.create_workspace();
      await storage.workspaces.create(workspace);
      const { workspaces: list } = await storage.workspaces.list(0, 10);

      expect(list[0].owner).not.toBeUndefined();
      await storage.workspaces.delete(workspace.owner);
    });

    test("Returns empty array when no workspaces exist", async () => {
      const { workspaces: list, next_cursor } = await storage.workspaces.list(
        0,
        10,
      );

      expect(list).toEqual([]);
      expect(next_cursor).toBe("0");
    });

    test("Uses cursor for pagination", async () => {
      const workspace_ids = [];
      for (let i = 0; i < 5; i++) {
        const workspace = fixtures.create_workspace(`owner-${i}`);
        await storage.workspaces.create(workspace);
        workspace_ids.push(workspace.owner);
      }

      const { workspaces: first_page, next_cursor } =
        await storage.workspaces.list(0, 2);

      expect(first_page.length).toBeGreaterThan(0);
      const { workspaces: second_page } = await storage.workspaces.list(
        parseInt(next_cursor),
        2,
      );

      expect(second_page.length).toBeGreaterThan(0);

      for (const id of workspace_ids) {
        await storage.workspaces.delete(id);
      }
    });
  });
});
