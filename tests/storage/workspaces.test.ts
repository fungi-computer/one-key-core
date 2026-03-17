import { describe, test, expect, beforeEach } from "vitest";
import Redis from "ioredis";
import Storage from "../../src/storage/storage";
import * as fixtures from "../fixtures";

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
  });

  describe("workspaces.delete", () => {
    test("Deletes a workspace", async () => {
      const workspace = fixtures.create_workspace();
      await storage.workspaces.create(workspace);

      const record = await storage.workspaces.get(workspace.owner);
      expect(workspace.owner).not.toBeUndefined;
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

      expect(list[0].owner).not.toBeUndefined;
    });
  });
});
