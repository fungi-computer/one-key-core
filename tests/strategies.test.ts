import { describe, test, expect } from "vitest";
import type { StoredKey } from "../src/types/keys";
import type { Result } from "../src/types/result";
import type { RateLimitWithCheck } from "../src/storage/limits";
import type { RateLimit } from "../src/schemas";
import keys, {
  default_key_generator,
  default_rotation_strategy,
  type KeysClient,
  type RateLimitChecker,
} from "../src/client/keys";
import {
  fake_key_generator,
  allow_all_rotation_policy,
  deny_all_rotation_policy,
  create_tracking_rotation_policy,
} from "./strategies";
import { InMemoryKeyVault } from "./mocks/key-vault";

const create_test_client = (
  rotation_strategy = default_rotation_strategy,
  key_generator = fake_key_generator,
): {
  client: KeysClient;
  vault: InMemoryKeyVault;
} => {
  const vault = new InMemoryKeyVault();

  const check_limits: RateLimitChecker = async (
    _hash: string,
    _limits: RateLimit[],
  ): Promise<Result<RateLimitWithCheck[]>> => {
    const checked_limits: RateLimitWithCheck[] = _limits.map((limit) => ({
      ...limit,
      current: 0,
      exceeded: false,
      reset_at: Date.now() + limit.duration * 1000,
    }));
    return { success: true, data: checked_limits };
  };

  const client = keys({
    vault,
    check_limits,
    generate_key: key_generator,
    rotation_strategy,
  });
  return { client, vault };
};

describe("Strategy Implementations", () => {
  describe("Default Rotation Policy", () => {
    test("denies already-rotated keys", () => {
      const rotated_key = { rotated: true } as StoredKey;
      expect(default_rotation_strategy.can_rotate(rotated_key)).toBe(false);
    });

    test("allows non-rotated keys", () => {
      const nonRotatedKey = { rotated: false } as StoredKey;
      expect(default_rotation_strategy.can_rotate(nonRotatedKey)).toBe(true);
    });

    test("allows keys without rotated field", () => {
      const keyWithoutRotated = {} as StoredKey;
      expect(default_rotation_strategy.can_rotate(keyWithoutRotated)).toBe(true);
    });
  });

  describe("Strategy Injection", () => {
    test("fake_key_generator produces deterministic keys", () => {
      // Calling the generator multiple times produces the same result
      const result1 = fake_key_generator();
      const result2 = fake_key_generator();

      expect(result1.key).toBe(result2.key);
      expect(result1.hash).toBe(result2.hash);
      expect(result1.key).toBe("fake_key_123456789012345678901234");
      expect(result1.hash).toBe("fake_hash_12345678901234567890123456789012345678901234567890123456");
    });

    test("allow_all_rotation_policy allows rotation even for already-rotated keys", async () => {
      // Use default_key_generator to avoid duplicate hash issues during rotation
      // Use grace_period > 0 to preserve old key for second rotation
      const { client } = create_test_client(allow_all_rotation_policy, default_key_generator);

      const create_response = await client.create_key({
        owner: "test_owner",
        name: "Test Key",
      });
      expect(create_response.success).toBe(true);
      if (!create_response.success) return;

      // Rotate once - should succeed with allow_all_rotation_policy
      const rotate1_response = await client.rotate_key(create_response.data.id, {
        grace_period: 10,
      });
      expect(rotate1_response.success).toBe(true);

      // Even though the key is now rotated, allow_all_policy still allows rotation
      // because it always returns true from can_rotate
      const rotate2_response = await client.rotate_key(create_response.data.id);
      expect(rotate2_response.success).toBe(true);
    });

    test("deny_all_rotation_policy denies rotation for all keys", async () => {
      // Use default_key_generator to avoid duplicate hash issues during rotation
      const { client } = create_test_client(deny_all_rotation_policy, default_key_generator);

      const create_response = await client.create_key({
        owner: "test_owner",
        name: "Test Key",
      });
      expect(create_response.success).toBe(true);
      if (!create_response.success) return;

      // Rotation should be denied by the policy
      const rotate_response = await client.rotate_key(create_response.data.id);
      expect(rotate_response.success).toBe(false);
    });

    test("create_tracking_rotation_policy().after_rotation callback is called after rotation", async () => {
      const tracking_policy = create_tracking_rotation_policy();
      // Use default_key_generator to avoid duplicate hash issues during rotation
      const { client } = create_test_client(tracking_policy, default_key_generator);

      const create_response = await client.create_key({
        owner: "test_owner",
        name: "Test Key",
      });
      expect(create_response.success).toBe(true);
      if (!create_response.success) return;

      // Callback should not have been called yet
      expect(tracking_policy.after_rotation_called).toBe(false);

      // Rotate the key
      const rotate_response = await client.rotate_key(create_response.data.id, {
        grace_period: 10,
      });
      expect(rotate_response.success).toBe(true);
      if (!rotate_response.success) return;

      // Callback should have been called
      expect(tracking_policy.after_rotation_called).toBe(true);
      expect(tracking_policy.after_rotation_calls.length).toBe(1);
    });
  });
});
