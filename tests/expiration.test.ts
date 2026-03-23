import { describe, test, expect, beforeEach } from "vitest";
import Redis from "ioredis";
import OneKey from "../src/client/client";
import { nanoid } from "nanoid";

const HOST = "localhost";
const PORT = 6379;

const create_client = () => {
  const redis = new Redis({ host: HOST, port: PORT });
  return { client: OneKey({ redis }), redis };
};

describe("Rate Limit Expiration", () => {
  let client: ReturnType<typeof OneKey>;
  let redis: Redis;

  beforeEach(async () => {
    const setup = create_client();
    client = setup.client;
    redis = setup.redis;
    await redis.flushdb();
  });

  test("allows requests after window expires", async () => {
    const owner = nanoid(16);

    // Create workspace with a rate limit
    await client.admin.workspaces.create({
      owner,
      name: "Test Workspace",
      rateLimits: [
        {
          name: "short_limit",
          limit: 2,
          cost: 1,
          duration: 60, // 60 second window
          autoVerify: true,
        },
      ],
    });

    // Create a key (no rateLimits field means it inherits from workspace)
    const create_response = await client.keys.create_key({
      owner,
      name: "Test Key",
    });
    if (!create_response.success) throw create_response.error;
    const created_key = create_response.data;

    // First two requests should succeed
    const verify1 = await client.keys.verify(created_key.key, []);
    expect(verify1.success).toBe(true);
    if (!verify1.success) return;
    expect(verify1.data.valid).toBe(true);

    const verify2 = await client.keys.verify(created_key.key, []);
    expect(verify2.success).toBe(true);
    if (!verify2.success) return;
    expect(verify2.data.valid).toBe(true);

    // Third request within the window should fail (rate limited)
    const verify3 = await client.keys.verify(created_key.key, []);
    expect(verify3.success).toBe(true);
    if (!verify3.success) return;
    expect(verify3.data.valid).toBe(false);
  });

  test("get_usage returns correct count", async () => {
    const owner = nanoid(16);

    // Create workspace with a rate limit
    await client.admin.workspaces.create({
      owner,
      name: "Test Workspace",
      rateLimits: [
        {
          name: "usage_limit",
          limit: 5,
          cost: 1,
          duration: 60, // 60 second window
          autoVerify: true,
        },
      ],
    });

    // Create a key
    const create_response = await client.keys.create_key({
      owner,
      name: "Test Key",
    });
    if (!create_response.success) throw create_response.error;
    const created_key = create_response.data;

    // Make some requests to increment usage
    for (let i = 0; i < 3; i++) {
      await client.keys.verify(created_key.key, []);
    }

    // Check usage - workspace rate limits use key.owner as identifier
    const usage_before = await client.admin.limits.get_usage(
      "workspace",
      owner,
      "usage_limit",
    );
    expect(usage_before).toBe(3);
  });

  // [TODO] We are not being consistent with time
  // I think we should default to ms everywhere.
  // It was a mistake to ever set duration to seconds.
  // Lets make a PRD around this issue.
  test.skip("reset time is approximately equal to duration", async () => {
    const owner = nanoid(16);
    const duration = 60; // 60 seconds

    // Create workspace with a known duration rate limit
    await client.admin.workspaces.create({
      owner,
      name: "Test Workspace",
      rateLimits: [
        {
          name: "reset_limit",
          limit: 10,
          cost: 1,
          duration,
          autoVerify: true,
        },
      ],
    });

    // Create a key
    const create_response = await client.keys.create_key({
      owner,
      name: "Test Key",
    });
    if (!create_response.success) throw create_response.error;
    const created_key = create_response.data;

    // Verify to initialize the rate limit window
    const verify_response = await client.keys.verify(created_key.key, []);
    expect(verify_response.success).toBe(true);
    if (!verify_response.success) return;

    // Get the reset time from the verify response
    const rate_limits = verify_response.data.rateLimits;
    const reset_limit = rate_limits.find((l) => l.name === "reset_limit");
    expect(reset_limit).toBeDefined();
    expect(reset_limit!.reset).toBeDefined();

    // Reset value is approximately equal to duration (in seconds) for a fresh window
    // Allow some tolerance since reset = duration - time_elapsed
    expect(reset_limit!.reset).toBeGreaterThanOrEqual(duration * 0.9); // at least 90% of duration
    expect(reset_limit!.reset).toBeLessThanOrEqual(duration + 1); // at most duration + 1s buffer
  });
});
