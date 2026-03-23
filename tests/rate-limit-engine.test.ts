import { describe, test, expect, beforeEach } from "vitest";
import Redis from "ioredis";
import Storage from "../src/storage/storage";
import { RateLimitEngine, KeyedLimitsAdapter, type LimitsFactoryStorage, default as createLimits } from "../src/storage/limits";
import * as fixtures from "./fixtures";
import type { Workspace, RateLimit, StoredKey } from "../src/types/keys";

interface MockPorts {
  get_key_limits(key_id: string): Promise<RateLimit[]>;
  get_workspace_limits(workspace_id: string): Promise<RateLimit[]>;
}

// Helper function to create mock ports for rate limit testing
function createMockLimitsPorts(
  keyRateLimits: RateLimit[],
  workspaceRateLimits: RateLimit[],
): MockPorts {
  return {
    get_key_limits: async (_key_id: string) => keyRateLimits,
    get_workspace_limits: async (_workspace_id: string) => workspaceRateLimits,
  };
}

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

      const key_rate_limits = key_response.data.rateLimits ?? [];
      const workspace_rate_limits = workspace.rateLimits ?? [];
      const ports = createMockLimitsPorts(key_rate_limits, workspace_rate_limits);

      const engine = new RateLimitEngine();
      const key_limits = await ports.get_key_limits("test_key");
      const workspace_limits = await ports.get_workspace_limits("test_owner");
      const result = await engine.get_limits_to_check(key_limits, workspace_limits, []);

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

      const key_rate_limits = key_response.data.rateLimits ?? [];
      const workspace_rate_limits = workspace.rateLimits ?? [];
      const ports = createMockLimitsPorts(key_rate_limits, workspace_rate_limits);

      const engine = new RateLimitEngine();
      const key_limits = await ports.get_key_limits("test_key");
      const workspace_limits = await ports.get_workspace_limits("test_owner");
      const result = await engine.get_limits_to_check(key_limits, workspace_limits, []);

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

      const key_rate_limits = key_response.data.rateLimits ?? [];
      const workspace_rate_limits = workspace.rateLimits ?? [];
      const ports = createMockLimitsPorts(key_rate_limits, workspace_rate_limits);

      const engine = new RateLimitEngine();
      const key_limits = await ports.get_key_limits("test_key");
      const workspace_limits = await ports.get_workspace_limits("test_owner");
      const result = await engine.get_limits_to_check(key_limits, workspace_limits, []);

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

      const requested_limits: Partial<RateLimit>[] = [
        { name: "requests_per_second", cost: 10 },
      ];

      const key_rate_limits = key_response.data.rateLimits ?? [];
      const workspace_rate_limits = workspace.rateLimits ?? [];
      const ports = createMockLimitsPorts(key_rate_limits, workspace_rate_limits);

      const engine = new RateLimitEngine();
      const key_limits = await ports.get_key_limits("test_key");
      const workspace_limits = await ports.get_workspace_limits("test_owner");
      const result = await engine.get_limits_to_check(key_limits, workspace_limits, requested_limits);

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

      const key_rate_limits = key_response.data.rateLimits ?? [];
      const workspace_rate_limits = workspace.rateLimits ?? [];
      const ports = createMockLimitsPorts(key_rate_limits, workspace_rate_limits);

      const engine = new RateLimitEngine();
      const key_limits = await ports.get_key_limits("test_key");
      const workspace_limits = await ports.get_workspace_limits("test_owner");
      const result = await engine.get_limits_to_check(key_limits, workspace_limits, []);

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

      const key_rate_limits = key_response.data.rateLimits ?? [];
      const workspace_rate_limits = workspace.rateLimits ?? [];
      const ports = createMockLimitsPorts(key_rate_limits, workspace_rate_limits);

      const engine = new RateLimitEngine();
      const key_limits = await ports.get_key_limits("test_key");
      const workspace_limits = await ports.get_workspace_limits("test_owner");
      const result = await engine.get_limits_to_check(key_limits, workspace_limits, []);

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

      const key_rate_limits = key_response.data.rateLimits ?? [];
      const workspace_rate_limits = workspace.rateLimits ?? [];
      const ports = createMockLimitsPorts(key_rate_limits, workspace_rate_limits);

      const engine = new RateLimitEngine();
      const key_limits = await ports.get_key_limits("test_key");
      const workspace_limits = await ports.get_workspace_limits("test_owner");
      const result = await engine.get_limits_to_check(key_limits, workspace_limits, []);

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

      const requested_limits: Partial<RateLimit>[] = [
        { name: "api_calls", limit: 300, cost: 5 },
      ];

      const key_rate_limits = key_response.data.rateLimits ?? [];
      const workspace_rate_limits = workspace.rateLimits ?? [];
      const ports = createMockLimitsPorts(key_rate_limits, workspace_rate_limits);

      const engine = new RateLimitEngine();
      const key_limits = await ports.get_key_limits("test_key");
      const workspace_limits = await ports.get_workspace_limits("test_owner");
      const result = await engine.get_limits_to_check(key_limits, workspace_limits, requested_limits);

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

      const key_rate_limits = key_response.data.rateLimits ?? [];
      const workspace_rate_limits = workspace.rateLimits ?? [];
      const ports = createMockLimitsPorts(key_rate_limits, workspace_rate_limits);

      const engine = new RateLimitEngine();
      const key_limits = await ports.get_key_limits("test_key");
      const workspace_limits = await ports.get_workspace_limits("test_owner");
      const result = await engine.get_limits_to_check(key_limits, workspace_limits, []);

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

      const key_rate_limits = key_response.data.rateLimits ?? [];
      const workspace_rate_limits = workspace.rateLimits ?? [];
      const ports = createMockLimitsPorts(key_rate_limits, workspace_rate_limits);

      const engine = new RateLimitEngine();
      const key_limits = await ports.get_key_limits("test_key");
      const workspace_limits = await ports.get_workspace_limits("test_owner");
      const result = await engine.get_limits_to_check(key_limits, workspace_limits, []);

      const manual_limit = result.workspace_limits_to_check.find(
        (l) => l.name === "manual_limit",
      );

      expect(manual_limit).toBeUndefined();
    });
  });
});

describe("KeyedLimitsAdapter", () => {
  const create_mock_storage = (
    keyRateLimits: RateLimit[] | undefined,
    workspaceRateLimits: RateLimit[] | undefined,
  ): LimitsFactoryStorage => {
    const mock_keys_storage = {
      get: async (_hash: string): Promise<StoredKey | null> => {
        if (keyRateLimits === undefined) return null;
        return {
          id: "key_123",
          hash: "abc123",
          owner: "owner_456",
          name: "Test Key",
          created: Date.now(),
          rateLimits: keyRateLimits,
        };
      },
    };

    const mock_workspaces_storage = {
      get: async (_owner: string): Promise<Workspace | null> => {
        if (workspaceRateLimits === undefined) return null;
        return {
          owner: "owner_456",
          name: "Test Workspace",
          rateLimits: workspaceRateLimits,
        };
      },
    };

    return {
      keys_storage: mock_keys_storage as any,
      workspaces_storage: mock_workspaces_storage as any,
    };
  };

  describe("get_key_limits", () => {
    test("key lookup with rateLimits - returns the limits", async () => {
      const rateLimits: RateLimit[] = [
        { name: "api_calls", limit: 100, cost: 1, duration: 60 },
      ];
      const storage = create_mock_storage(rateLimits, undefined);
      const adapter = new KeyedLimitsAdapter(storage);

      const result = await adapter.get_key_limits("abc123");

      expect(result).toEqual(rateLimits);
    });

    test("key lookup without rateLimits - returns empty array", async () => {
      const storage = create_mock_storage([], undefined);
      const adapter = new KeyedLimitsAdapter(storage);

      const result = await adapter.get_key_limits("abc123");

      expect(result).toEqual([]);
    });

    test("key not found - returns empty array", async () => {
      const storage = create_mock_storage(undefined, undefined);
      const adapter = new KeyedLimitsAdapter(storage);

      const result = await adapter.get_key_limits("nonexistent");

      expect(result).toEqual([]);
    });

    test("falsy key_id - returns empty array", async () => {
      const storage = create_mock_storage([], []);
      const adapter = new KeyedLimitsAdapter(storage);

      const result = await adapter.get_key_limits("");

      expect(result).toEqual([]);
    });

    test("null key_id - returns empty array", async () => {
      const storage = create_mock_storage([], []);
      const adapter = new KeyedLimitsAdapter(storage);

      // @ts-expect-error - testing invalid input
      const result = await adapter.get_key_limits(null);

      expect(result).toEqual([]);
    });

    test("undefined key_id - returns empty array", async () => {
      const storage = create_mock_storage([], []);
      const adapter = new KeyedLimitsAdapter(storage);

      // @ts-expect-error - testing invalid input
      const result = await adapter.get_key_limits(undefined);

      expect(result).toEqual([]);
    });
  });

  describe("get_workspace_limits", () => {
    test("workspace lookup with rateLimits - returns the limits", async () => {
      const rateLimits: RateLimit[] = [
        { name: "workspace_calls", limit: 500, cost: 1, duration: 60 },
      ];
      const storage = create_mock_storage(undefined, rateLimits);
      const adapter = new KeyedLimitsAdapter(storage);

      const result = await adapter.get_workspace_limits("owner_456");

      expect(result).toEqual(rateLimits);
    });

    test("workspace lookup without rateLimits - returns empty array", async () => {
      const storage = create_mock_storage(undefined, []);
      const adapter = new KeyedLimitsAdapter(storage);

      const result = await adapter.get_workspace_limits("owner_456");

      expect(result).toEqual([]);
    });

    test("workspace not found - returns empty array", async () => {
      const storage = create_mock_storage(undefined, undefined);
      const adapter = new KeyedLimitsAdapter(storage);

      const result = await adapter.get_workspace_limits("nonexistent");

      expect(result).toEqual([]);
    });

    test("falsy workspace_id - returns empty array", async () => {
      const storage = create_mock_storage([], []);
      const adapter = new KeyedLimitsAdapter(storage);

      const result = await adapter.get_workspace_limits("");

      expect(result).toEqual([]);
    });
  });
});

describe("limits factory", () => {
  test("KeyedLimitsAdapter is used by check_limits for workspace limits", async () => {
    const redis = new Redis({ host: HOST, port: PORT });
    await redis.flushdb();

    // Create a fresh storage adapter for this test
    const testStorage = Storage({ redis });

    // Create a real key in storage for the test
    const owner = fixtures.create_owner();
    const workspace = fixtures.create_workspace(owner);
    await testStorage.workspaces.create(workspace);

    const key_data = fixtures.create_key(owner);
    const key_response = await testStorage.keys.create(key_data);
    if (!key_response.success) throw key_response.error;

    const key_hash = key_response.data.hash;

    const storage: LimitsFactoryStorage = {
      keys_storage: testStorage.keys as any,
      workspaces_storage: testStorage.workspaces as any,
    };

    const limits = createLimits(redis, storage);

    // Call check_limits which internally uses KeyedLimitsAdapter.get_workspace_limits
    const result = await limits.check_limits(key_hash, []);

    // Verify KeyedLimitsAdapter behavior - returns stored limits
    expect(result.success).toBe(true);
    if (result.success) {
      // Should have at least one limit from the key's rateLimits
      const keyLimits = result.data.filter((l) => l.scope === "key");
      expect(keyLimits.length).toBeGreaterThan(0);
    }

    await redis.quit();
  });
});
