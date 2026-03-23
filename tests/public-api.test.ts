import { describe, test, expect, beforeAll, afterAll } from "vitest";
import Redis from "ioredis";
import OneKey from "../src/client/client";

const HOST = "localhost";
const PORT = 6379;

const redis = new Redis({ host: HOST, port: PORT });

describe("Public API Surface", () => {
  beforeAll(async () => {
    await redis.flushdb();
  });

  afterAll(async () => {
    await redis.quit();
  });

  test("Public API only exposes 3 keys methods", () => {
    const one_key = OneKey({ redis });
    const public_keys = one_key.keys;

    // Should have exactly these 3 methods
    expect(typeof public_keys.create_key).toBe("function");
    expect(typeof public_keys.verify).toBe("function");
    expect(typeof public_keys.lookup).toBe("function");

    // Should NOT have admin methods
    expect((public_keys as Record<string, unknown>).get).toBeUndefined();
    expect((public_keys as Record<string, unknown>).update).toBeUndefined();
    expect((public_keys as Record<string, unknown>).list_by_owner).toBeUndefined();
    expect((public_keys as Record<string, unknown>).delete).toBeUndefined();
    expect((public_keys as Record<string, unknown>).rotate_key).toBeUndefined();
  });

  test("Public API does not expose workspaces", () => {
    const one_key = OneKey({ redis });

    // workspaces should not exist on the public keys object
    expect((one_key.keys as Record<string, unknown>).workspaces).toBeUndefined();

    // admin should have workspaces
    expect(one_key.admin.workspaces).toBeDefined();
    expect(typeof one_key.admin.workspaces.create).toBe("function");
    expect(typeof one_key.admin.workspaces.get).toBe("function");
    expect(typeof one_key.admin.workspaces.update).toBe("function");
    expect(typeof one_key.admin.workspaces.delete).toBe("function");
    expect(typeof one_key.admin.workspaces.list).toBe("function");
  });

  test("Public API does not expose limits", () => {
    const one_key = OneKey({ redis });

    // limits should not exist on the public keys object
    expect((one_key.keys as Record<string, unknown>).limits).toBeUndefined();

    // admin should have limits
    expect(one_key.admin.limits).toBeDefined();
    expect(typeof one_key.admin.limits.check_limits).toBe("function");
  });

  test("Admin API exposes full keys client with all methods", () => {
    const one_key = OneKey({ redis });
    const admin_keys = one_key.admin.keys;

    // Should have all 8 methods
    expect(typeof admin_keys.create_key).toBe("function");
    expect(typeof admin_keys.verify).toBe("function");
    expect(typeof admin_keys.get).toBe("function");
    expect(typeof admin_keys.update).toBe("function");
    expect(typeof admin_keys.list_by_owner).toBe("function");
    expect(typeof admin_keys.delete).toBe("function");
    expect(typeof admin_keys.rotate_key).toBe("function");
    expect(typeof admin_keys.lookup).toBe("function");
  });

  test("Admin API exposes keys, workspaces, and limits", () => {
    const one_key = OneKey({ redis });

    expect(one_key.admin.keys).toBeDefined();
    expect(one_key.admin.workspaces).toBeDefined();
    expect(one_key.admin.limits).toBeDefined();
  });
});
