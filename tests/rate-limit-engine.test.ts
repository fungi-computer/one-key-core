import { describe, test, expect, beforeEach } from "vitest";
import Redis from "ioredis";
import Storage from "../src/storage/storage";
import { RateLimitEngine, type RateLimitEnginePorts } from "../src/storage/limits";
import * as fixtures from "./fixtures";
import type { StoredKey, Workspace, RateLimit } from "../src/types/keys";

const HOST = "localhost";
const PORT = 6379;

// Integration tests using real Redis.
// Per AGENTS.md testing philosophy: "Tests verify behavior through public interfaces,
// not implementation details." These tests use real storage to verify the complete
// RateLimitEngine integration with Redis-backed storage adapters.
const create_storage_adapter = () => {
  const redis = new Redis({ host: HOST, port: PORT });
  const storage = Storage({ redis });
  return { storage, redis };
};

describe("RateLimitEngine", () => {
  const { storage, redis } = create_storage_adapter();

  beforeEach(async () => {
    await redis.flushdb();
  });

  describe("get_limits_to_check", () => {
    test("returns key limits and workspace limits merged correctly", async () => {
      const owner = fixtures.create_owner();
      const workspace = fixtures.create_workspace(owner);
      await storage.workspaces.create(workspace);

      const key_data = fixtures.create_key(owner);
      const key_response = await storage.keys.create(key_data);
      if (!key_response.success) throw key_response.error;
      const created_key = key_response.data;

      const ports: RateLimitEnginePorts = {
        get_key: (key_id: string) => storage.keys.get(key_id),
        get_workspace: (workspace_id: string) => storage.workspaces.get(workspace_id),
      };

      const engine = new RateLimitEngine(ports);
      const result = await engine.get_limits_to_check(created_key, []);

      expect(result.key_limits_to_check.length).toBeGreaterThan(0);
      expect(result.workspace_limits_to_check.length).toBe(1);
    });

    test("explicit key limits override workspace limits with same name", async () => {
      const owner = fixtures.create_owner();

      const workspace: Workspace = {
        owner,
        name: "Test Workspace",
        rateLimits: [
          {
            name: "api_calls",
            limit: 100,
            cost: 1,
            duration: 60,
            autoVerify: true,
          },
        ],
      };
      await storage.workspaces.create(workspace);

      const key_data = fixtures.create_key(owner);
      key_data.rateLimits = [
        {
          name: "api_calls",
          limit: 200,
          cost: 5,
          duration: 60,
          autoVerify: true,
        },
      ];
      const key_response = await storage.keys.create(key_data);
      if (!key_response.success) throw key_response.error;
      const created_key = key_response.data;

      const ports: RateLimitEnginePorts = {
        get_key: (key_id: string) => storage.keys.get(key_id),
        get_workspace: (workspace_id: string) => storage.workspaces.get(workspace_id),
      };

      const engine = new RateLimitEngine(ports);
      const result = await engine.get_limits_to_check(created_key, []);

      const key_limit = result.key_limits_to_check.find(
        (l) => l.name === "api_calls",
      );

      expect(key_limit?.limit).toBe(200);
      expect(key_limit?.cost).toBe(5);
    });

    test("autoVerify limits are included when no explicit limits provided", async () => {
      const owner = fixtures.create_owner();
      const workspace = fixtures.create_workspace(owner);
      await storage.workspaces.create(workspace);

      const key_data = fixtures.create_key(owner);
      key_data.rateLimits = [];
      const key_response = await storage.keys.create(key_data);
      if (!key_response.success) throw key_response.error;
      const created_key = key_response.data;

      const ports: RateLimitEnginePorts = {
        get_key: (key_id: string) => storage.keys.get(key_id),
        get_workspace: (workspace_id: string) => storage.workspaces.get(workspace_id),
      };

      const engine = new RateLimitEngine(ports);
      const result = await engine.get_limits_to_check(created_key, []);

      expect(result.key_limits_to_check.length).toBe(0);
      expect(result.workspace_limits_to_check.length).toBe(1);
    });

    test("requested limits merge with stored limits", async () => {
      const owner = fixtures.create_owner();
      const workspace = fixtures.create_workspace(owner);
      await storage.workspaces.create(workspace);

      const key_data = fixtures.create_key(owner);
      const key_response = await storage.keys.create(key_data);
      if (!key_response.success) throw key_response.error;
      const created_key = key_response.data;

      const requested_limits: Partial<RateLimit>[] = [
        { name: "requests_per_second", cost: 10 },
      ];

      const ports: RateLimitEnginePorts = {
        get_key: (key_id: string) => storage.keys.get(key_id),
        get_workspace: (workspace_id: string) => storage.workspaces.get(workspace_id),
      };

      const engine = new RateLimitEngine(ports);
      const result = await engine.get_limits_to_check(
        created_key,
        requested_limits,
      );

      const key_limit = result.key_limits_to_check.find(
        (l) => l.name === "requests_per_second",
      );

      expect(key_limit?.cost).toBe(10);
    });

    test("returns empty arrays when key and workspace have no limits", async () => {
      const owner = fixtures.create_owner();
      const workspace: Workspace = {
        owner,
        name: "Empty Workspace",
        rateLimits: [],
      };
      await storage.workspaces.create(workspace);

      const key_data = fixtures.create_key(owner);
      key_data.rateLimits = [];
      const key_response = await storage.keys.create(key_data);
      if (!key_response.success) throw key_response.error;
      const created_key = key_response.data;

      const ports: RateLimitEnginePorts = {
        get_key: (key_id: string) => storage.keys.get(key_id),
        get_workspace: (workspace_id: string) => storage.workspaces.get(workspace_id),
      };

      const engine = new RateLimitEngine(ports);
      const result = await engine.get_limits_to_check(created_key, []);

      expect(result.key_limits_to_check.length).toBe(0);
      expect(result.workspace_limits_to_check.length).toBe(0);
    });

    test("inheritance: workspace limits are inherited when key has no matching limit", async () => {
      const owner = fixtures.create_owner();
      const workspace = fixtures.create_workspace(owner);
      await storage.workspaces.create(workspace);

      const key_data = fixtures.create_key(owner);
      key_data.rateLimits = [
        {
          name: "key_only_limit",
          limit: 500,
          cost: 1,
          duration: 60,
          autoVerify: true,
        },
      ];
      const key_response = await storage.keys.create(key_data);
      if (!key_response.success) throw key_response.error;
      const created_key = key_response.data;

      const ports: RateLimitEnginePorts = {
        get_key: (key_id: string) => storage.keys.get(key_id),
        get_workspace: (workspace_id: string) => storage.workspaces.get(workspace_id),
      };

      const engine = new RateLimitEngine(ports);
      const result = await engine.get_limits_to_check(created_key, []);

      expect(result.key_limits_to_check.some((l) => l.name === "key_only_limit")).toBe(
        true,
      );
      expect(
        result.workspace_limits_to_check.some(
          (l) => l.name === fixtures.rate_limits.workspace_requests.name,
        ),
      ).toBe(true);
    });
  });

  describe("limit merging priority", () => {
    test("key explicit limit takes priority over workspace autoVerify limit", async () => {
      const owner = fixtures.create_owner();

      const workspace: Workspace = {
        owner,
        name: "Test Workspace",
        rateLimits: [
          {
            name: "shared_limit",
            limit: 50,
            cost: 1,
            duration: 60,
            autoVerify: true,
          },
        ],
      };
      await storage.workspaces.create(workspace);

      const key_data = fixtures.create_key(owner);
      key_data.rateLimits = [
        {
          name: "shared_limit",
          limit: 100,
          cost: 1,
          duration: 60,
          autoVerify: true,
        },
      ];
      const key_response = await storage.keys.create(key_data);
      if (!key_response.success) throw key_response.error;
      const created_key = key_response.data;

      const ports: RateLimitEnginePorts = {
        get_key: (key_id: string) => storage.keys.get(key_id),
        get_workspace: (workspace_id: string) => storage.workspaces.get(workspace_id),
      };

      const engine = new RateLimitEngine(ports);
      const result = await engine.get_limits_to_check(created_key, []);

      const key_limit = result.key_limits_to_check.find(
        (l) => l.name === "shared_limit",
      );

      expect(key_limit?.limit).toBe(100);
    });

    test("requested limit takes highest priority", async () => {
      const owner = fixtures.create_owner();

      const workspace: Workspace = {
        owner,
        name: "Test Workspace",
        rateLimits: [
          {
            name: "api_calls",
            limit: 100,
            cost: 1,
            duration: 60,
            autoVerify: true,
          },
        ],
      };
      await storage.workspaces.create(workspace);

      const key_data = fixtures.create_key(owner);
      key_data.rateLimits = [
        {
          name: "api_calls",
          limit: 200,
          cost: 2,
          duration: 60,
          autoVerify: true,
        },
      ];
      const key_response = await storage.keys.create(key_data);
      if (!key_response.success) throw key_response.error;
      const created_key = key_response.data;

      const requested_limits: Partial<RateLimit>[] = [
        { name: "api_calls", limit: 300, cost: 5 },
      ];

      const ports: RateLimitEnginePorts = {
        get_key: (key_id: string) => storage.keys.get(key_id),
        get_workspace: (workspace_id: string) => storage.workspaces.get(workspace_id),
      };

      const engine = new RateLimitEngine(ports);
      const result = await engine.get_limits_to_check(
        created_key,
        requested_limits,
      );

      const key_limit = result.key_limits_to_check.find(
        (l) => l.name === "api_calls",
      );

      expect(key_limit?.limit).toBe(300);
      expect(key_limit?.cost).toBe(5);
    });
  });

  describe("autoVerify behavior", () => {
    test("autoVerify limits are included even without explicit request", async () => {
      const owner = fixtures.create_owner();
      const workspace = fixtures.create_workspace(owner);
      await storage.workspaces.create(workspace);

      const key_data = fixtures.create_key(owner);
      const key_response = await storage.keys.create(key_data);
      if (!key_response.success) throw key_response.error;
      const created_key = key_response.data;

      const ports: RateLimitEnginePorts = {
        get_key: (key_id: string) => storage.keys.get(key_id),
        get_workspace: (workspace_id: string) => storage.workspaces.get(workspace_id),
      };

      const engine = new RateLimitEngine(ports);
      const result = await engine.get_limits_to_check(created_key, []);

      const all_limits = [
        ...result.key_limits_to_check,
        ...result.workspace_limits_to_check,
      ];

      const autoVerify_limits = all_limits.filter((l) => l.autoVerify === true);
      expect(autoVerify_limits.length).toBeGreaterThan(0);
    });

    test("non-autoVerify limits require explicit request", async () => {
      const owner = fixtures.create_owner();

      const workspace: Workspace = {
        owner,
        name: "Test Workspace",
        rateLimits: [
          {
            name: "manual_limit",
            limit: 100,
            cost: 1,
            duration: 60,
            autoVerify: false,
          },
        ],
      };
      await storage.workspaces.create(workspace);

      const key_data = fixtures.create_key(owner);
      key_data.rateLimits = [];
      const key_response = await storage.keys.create(key_data);
      if (!key_response.success) throw key_response.error;
      const created_key = key_response.data;

      const ports: RateLimitEnginePorts = {
        get_key: (key_id: string) => storage.keys.get(key_id),
        get_workspace: (workspace_id: string) => storage.workspaces.get(workspace_id),
      };

      const engine = new RateLimitEngine(ports);
      const result = await engine.get_limits_to_check(created_key, []);

      const manual_limit = result.workspace_limits_to_check.find(
        (l) => l.name === "manual_limit",
      );

      expect(manual_limit).toBeUndefined();
    });
  });
});
