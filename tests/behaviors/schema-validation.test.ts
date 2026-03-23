import { describe, test, expect, beforeEach } from "vitest";
import Redis from "ioredis";
import OneKey from "../../src/client/client";
import { rate_limit_schema } from "../../src/schemas";
import * as fixtures from "../fixtures";

const HOST = "localhost";
const PORT = 6379;

const create_client = () => {
  const redis = new Redis({ host: HOST, port: PORT });
  const client = OneKey({ redis });
  return { client, redis };
};

describe("schema validation", () => {
  let client: ReturnType<typeof create_client>["client"];

  beforeEach(() => {
    const setup = create_client();
    client = setup.client;
  });

  describe("rate_limit_schema", () => {
    test("should reject rate limit with cost greater than limit", () => {
      const result = rate_limit_schema.safeParse({
        name: "test_limit",
        limit: 10,
        cost: 20,
        duration: 60,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain("cost");
      }
    });

    test("should accept rate limit with cost equal to limit", () => {
      const result = rate_limit_schema.safeParse({
        name: "test_limit",
        limit: 10,
        cost: 10,
        duration: 60,
      });
      expect(result.success).toBe(true);
    });

    test("should accept rate limit with cost less than limit", () => {
      const result = rate_limit_schema.safeParse({
        name: "test_limit",
        limit: 10,
        cost: 5,
        duration: 60,
      });
      expect(result.success).toBe(true);
    });

    test("should accept rate limit with default cost (1)", () => {
      const result = rate_limit_schema.safeParse({
        name: "test_limit",
        limit: 10,
        duration: 60,
      });
      expect(result.success).toBe(true);
    });

    test("should reject rate limit with limit 0 and default cost", () => {
      // When cost is not provided, Zod applies default(1), so validation
      // checks 1 >= 0 which fails. This is a known edge case.
      const result = rate_limit_schema.safeParse({
        name: "test_limit",
        limit: 0,
        duration: 60,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain("cost");
      }
    });
  });

  describe("create_key", () => {
    test("should reject owner with 2 characters", async () => {
      const response = await client.keys.create_key({ owner: "ab", name: "keyname" });
      expect(response.success).toBe(false);
      expect(response.error.message).toContain("owner");
    });

    test("should accept owner with 3 or more characters", async () => {
      const response = await client.keys.create_key({ owner: "abc", name: "keyname" });
      expect(response.success).toBe(true);
    });

    test("should reject missing name via Zod validation", async () => {
      // TypeScript would catch this at compile time, Zod catches it at runtime
      const response = await client.keys.create_key({ owner: "user123" } as any);
      expect(response.success).toBe(false);
      expect(response.error.message).toContain("name");
    });

    test("should reject name with 2 characters", async () => {
      const response = await client.keys.create_key({ owner: "user123", name: "ab" });
      expect(response.success).toBe(false);
      expect(response.error.message).toContain("name");
    });

    test("should accept name with 3 or more characters", async () => {
      const response = await client.keys.create_key({ owner: "user123", name: "abc" });
      expect(response.success).toBe(true);
    });
  });

  describe("create_workspace", () => {
    test("should reject owner with 2 characters", async () => {
      const response = await client.admin.workspaces.create({ owner: "ab", name: "wsname" });
      expect(response.success).toBe(false);
      expect(response.error.message).toContain("owner");
    });

    test("should accept owner with 3 or more characters", async () => {
      const response = await client.admin.workspaces.create({ owner: "abc", name: "wsname" });
      expect(response.success).toBe(true);
    });

    test("should reject missing name via Zod validation", async () => {
      const response = await client.admin.workspaces.create({ owner: "user123" } as any);
      expect(response.success).toBe(false);
      expect(response.error.message).toContain("name");
    });

    test("should reject name with 2 characters", async () => {
      const response = await client.admin.workspaces.create({ owner: "user123", name: "ab" });
      expect(response.success).toBe(false);
      expect(response.error.message).toContain("name");
    });

    test("should accept name with 3 or more characters", async () => {
      const response = await client.admin.workspaces.create({ owner: "user123", name: "abc" });
      expect(response.success).toBe(true);
    });
  });
});
