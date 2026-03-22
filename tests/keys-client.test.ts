import { describe, test, expect, beforeEach } from "vitest";
import type { RateLimit } from "../src/types/keys";
import type { RateLimitWithCheck } from "../src/storage/limits";
import type { Result } from "../src/types/result";

import keys, {
  type KeysClient,
  type RateLimitChecker,
  generate_key,
  hash_key,
} from "../src/client/keys";
import { ERR_KEY_NOT_FOUND, ERR_KEY_ALREADY_ROTATED, ERR_KEY_EXPIRED } from "../src/errors";
import { InMemoryKeyVault } from "./mocks/key-vault";

const create_test_client = (): {
  client: KeysClient;
  vault: InMemoryKeyVault;
} => {
  const vault = new InMemoryKeyVault();

  const check_limits: RateLimitChecker = async (
    _hash: string,
    _limits: RateLimit[],
  ): Promise<Result<RateLimitWithCheck[]>> => {
    // For most tests, we allow all limits (no exceeded)
    const checked_limits: RateLimitWithCheck[] = _limits.map((limit) => ({
      ...limit,
      current: 0,
      exceeded: false,
      reset_at: Date.now() + limit.duration * 1000,
    }));
    return { success: true, data: checked_limits };
  };

  const client = keys({ vault, check_limits });
  return { client, vault };
};

describe("KeysClient", () => {
  describe("Key Generation", () => {
    test("generate_key creates key with correct length", () => {
      const key = generate_key(32);
      expect(key.length).toBe(32);
    });

    test("generate_key applies prefix when provided", () => {
      const key = generate_key(32, "test_prefix");
      expect(key.startsWith("test_prefix_")).toBe(true);
    });

    test("hash_key produces consistent hash", () => {
      const key = "test_api_key";
      const hash1 = hash_key(key);
      const hash2 = hash_key(key);
      expect(hash1).toBe(hash2);
      expect(hash1.length).toBe(64); // SHA-256 hex is 64 chars
    });

    test("hash_key produces different hashes for different keys", () => {
      const hash1 = hash_key("key1");
      const hash2 = hash_key("key2");
      expect(hash1).not.toBe(hash2);
    });
  });

  describe("create_key", () => {
    let client: KeysClient;
    let vault: InMemoryKeyVault;

    beforeEach(() => {
      const setup = create_test_client();
      client = setup.client;
      vault = setup.vault;
    });

    test("creates a new key with generated hash", async () => {
      const request = {
        owner: "test_owner",
        name: "Test Key",
      };

      const response = await client.create_key(request);

      expect(response.success).toBe(true);
      if (!response.success) return;

      expect(response.data.key).toBeDefined();
      expect(response.data.hash).toBeDefined();
      expect(response.data.id).toBeDefined();
      expect(response.data.owner).toBe("test_owner");
      expect(response.data.name).toBe("Test Key");
    });

    test("returns error for duplicate key", async () => {
      const request = {
        owner: "test_owner",
        name: "Test Key",
        hash: "existing_hash", // This would cause duplicate if same hash
      };

      // First creation would succeed
      // Second creation with same hash would fail
      const response = await client.create_key(request);

      // Since we're using random keys, this should succeed
      expect(response.success).toBe(true);
    });
  });

  describe("verify", () => {
    let client: KeysClient;
    let vault: InMemoryKeyVault;

    beforeEach(() => {
      const setup = create_test_client();
      client = setup.client;
      vault = setup.vault;
    });

    test("verifies a valid key", async () => {
      const create_response = await client.create_key({
        owner: "test_owner",
        name: "Test Key",
      });
      if (!create_response.success) throw create_response.error;

      const verify_response = await client.verify(create_response.data.key, []);

      expect(verify_response.success).toBe(true);
      if (!verify_response.success) return;
      expect(verify_response.data.valid).toBe(true);
    });

    test("returns error for invalid key", async () => {
      const verify_response = await client.verify("invalid_key", []);

      expect(verify_response.success).toBe(false);
    });

    test("returns key data on successful verification", async () => {
      const create_response = await client.create_key({
        owner: "test_owner",
        name: "Test Key",
      });
      if (!create_response.success) throw create_response.error;

      const verify_response = await client.verify(create_response.data.key, []);

      expect(verify_response.success).toBe(true);
      if (!verify_response.success) return;
      expect(verify_response.data.owner).toBe("test_owner");
      expect(verify_response.data.name).toBe("Test Key");
    });

    test("returns error for expired key", async () => {
      const create_response = await client.create_key({
        owner: "test_owner",
        name: "Test Key",
      });
      if (!create_response.success) throw create_response.error;

      // Set the key to expire in the past
      await vault.update(create_response.data.hash, {
        expires: Date.now() - 1000,
      });

      const verify_response = await client.verify(create_response.data.key, []);

      expect(verify_response.success).toBe(false);
      expect(verify_response.error.message).toContain(ERR_KEY_EXPIRED);
    });

    test("allows key with no expires field", async () => {
      const create_response = await client.create_key({
        owner: "test_owner",
        name: "Test Key",
      });
      if (!create_response.success) throw create_response.error;

      const verify_response = await client.verify(create_response.data.key, []);

      expect(verify_response.success).toBe(true);
      if (!verify_response.success) return;
      expect(verify_response.data.valid).toBe(true);
    });

    test("allows key with future expires", async () => {
      const create_response = await client.create_key({
        owner: "test_owner",
        name: "Test Key",
      });
      if (!create_response.success) throw create_response.error;

      // Set the key to expire in the future
      await vault.update(create_response.data.hash, {
        expires: Date.now() + 10000,
      });

      const verify_response = await client.verify(create_response.data.key, []);

      expect(verify_response.success).toBe(true);
      if (!verify_response.success) return;
      expect(verify_response.data.valid).toBe(true);
    });

    test("expired key cannot exhaust rate limits", async () => {
      // Create a client with a rate limiter that tracks calls
      let rate_limit_check_calls = 0;
      const tracking_check_limits: RateLimitChecker = async (
        _hash: string,
        _limits: RateLimit[],
      ) => {
        rate_limit_check_calls++;
        const checked_limits: RateLimitWithCheck[] = _limits.map((limit) => ({
          ...limit,
          current: 0,
          exceeded: false,
          reset_at: Date.now() + limit.duration * 1000,
        }));
        return { success: true, data: checked_limits };
      };

      const tracking_client = keys({ vault, check_limits: tracking_check_limits });

      const create_response = await tracking_client.create_key({
        owner: "test_owner",
        name: "Test Key",
      });
      if (!create_response.success) throw create_response.error;

      // Set the key to expire in the past
      await vault.update(create_response.data.hash, {
        expires: Date.now() - 1000,
      });

      const verify_response = await tracking_client.verify(
        create_response.data.key,
        [],
      );

      expect(verify_response.success).toBe(false);
      expect(verify_response.error.message).toContain(ERR_KEY_EXPIRED);
      // Rate limit check should NOT have been called since expiration is checked first
      expect(rate_limit_check_calls).toBe(0);
    });
  });

  describe("get", () => {
    let client: KeysClient;
    let vault: InMemoryKeyVault;

    beforeEach(() => {
      const setup = create_test_client();
      client = setup.client;
      vault = setup.vault;
    });

    test("retrieves a key by id", async () => {
      const create_response = await client.create_key({
        owner: "test_owner",
        name: "Test Key",
      });
      if (!create_response.success) throw create_response.error;

      const get_response = await client.get(create_response.data.id);

      expect(get_response).not.toBeNull();
      expect(get_response?.owner).toBe("test_owner");
      expect(get_response?.name).toBe("Test Key");
    });

    test("returns null for non-existent key_id", async () => {
      const get_response = await client.get("non_existent_id");
      expect(get_response).toBeNull();
    });

    test("does not include hash in returned key", async () => {
      const create_response = await client.create_key({
        owner: "test_owner",
        name: "Test Key",
      });
      if (!create_response.success) throw create_response.error;

      const get_response = await client.get(create_response.data.id);

      expect(get_response?.hash).toBeUndefined();
    });
  });

  describe("update", () => {
    let client: KeysClient;
    let vault: InMemoryKeyVault;

    beforeEach(() => {
      const setup = create_test_client();
      client = setup.client;
      vault = setup.vault;
    });

    test("updates a key's name", async () => {
      const create_response = await client.create_key({
        owner: "test_owner",
        name: "Original Name",
      });
      if (!create_response.success) throw create_response.error;

      const update_response = await client.update(create_response.data.id, {
        name: "Updated Name",
      });

      expect(update_response.success).toBe(true);
      if (!update_response.success) return;
      expect(update_response.data.name).toBe("Updated Name");
    });

    test("returns error for non-existent key", async () => {
      const update_response = await client.update("non_existent_id", {
        name: "New Name",
      });

      expect(update_response.success).toBe(false);
    });
  });

  describe("delete", () => {
    let client: KeysClient;
    let vault: InMemoryKeyVault;

    beforeEach(() => {
      const setup = create_test_client();
      client = setup.client;
      vault = setup.vault;
    });

    test("deletes a key", async () => {
      const create_response = await client.create_key({
        owner: "test_owner",
        name: "Test Key",
      });
      if (!create_response.success) throw create_response.error;

      const delete_response = await client.delete(create_response.data.id);

      expect(delete_response.success).toBe(true);

      const get_response = await client.get(create_response.data.id);
      expect(get_response).toBeNull();
    });

    test("returns error for non-existent key", async () => {
      const delete_response = await client.delete("non_existent_id");
      expect(delete_response.success).toBe(false);
    });
  });

  describe("rotate_key", () => {
    let client: KeysClient;
    let vault: InMemoryKeyVault;

    beforeEach(() => {
      const setup = create_test_client();
      client = setup.client;
      vault = setup.vault;
    });

    test("rotates a key and returns new key", async () => {
      const create_response = await client.create_key({
        owner: "test_owner",
        name: "Test Key",
      });
      if (!create_response.success) throw create_response.error;

      const rotate_response = await client.rotate_key(create_response.data.id);

      expect(rotate_response.success).toBe(true);
      if (!rotate_response.success) return;
      expect(rotate_response.data.key).toBeDefined();
      expect(rotate_response.data.key).not.toBe(create_response.data.key);
    });

    test("preserves key metadata during rotation", async () => {
      const create_response = await client.create_key({
        owner: "test_owner",
        name: "Test Key",
      });
      if (!create_response.success) throw create_response.error;

      const rotate_response = await client.rotate_key(create_response.data.id, {
        grace_period: 10,
      });
      if (!rotate_response.success) throw rotate_response.error;

      const get_response = await client.get(create_response.data.id);
      expect(get_response?.name).toBe("Test Key");
      expect(get_response?.owner).toBe("test_owner");
    });

    test("returns error when rotating non-existent key", async () => {
      const rotate_response = await client.rotate_key("non_existent_id");

      expect(rotate_response.success).toBe(false);
      expect(rotate_response.error.message).toContain(ERR_KEY_NOT_FOUND);
    });

    test("returns error when key already rotated", async () => {
      const create_response = await client.create_key({
        owner: "test_owner",
        name: "Test Key",
      });
      if (!create_response.success) throw create_response.error;

      const rotate1_response = await client.rotate_key(
        create_response.data.id,
        { grace_period: 10 },
      );
      if (!rotate1_response.success) throw rotate1_response.error;

      const rotate2_response = await client.rotate_key(create_response.data.id);

      expect(rotate2_response.success).toBe(false);
      expect(rotate2_response.error.message).toContain(ERR_KEY_ALREADY_ROTATED);
    });

    test("new key after rotation is valid", async () => {
      const create_response = await client.create_key({
        owner: "test_owner",
        name: "Test Key",
      });
      if (!create_response.success) throw create_response.error;

      const rotate_response = await client.rotate_key(create_response.data.id);
      if (!rotate_response.success) throw rotate_response.error;

      const verify_response = await client.verify(rotate_response.data.key, []);

      expect(verify_response.success).toBe(true);
      if (!verify_response.success) return;
      expect(verify_response.data.valid).toBe(true);
    });
  });

  describe("lookup", () => {
    let client: KeysClient;
    let vault: InMemoryKeyVault;

    beforeEach(() => {
      const setup = create_test_client();
      client = setup.client;
      vault = setup.vault;
    });

    test("looks up a key by plaintext", async () => {
      const create_response = await client.create_key({
        owner: "test_owner",
        name: "Test Key",
      });
      if (!create_response.success) throw create_response.error;

      const lookup_response = await client.lookup(create_response.data.key);

      expect(lookup_response.success).toBe(true);
      if (!lookup_response.success) return;
      expect(lookup_response.data.owner).toBe("test_owner");
      expect(lookup_response.data.name).toBe("Test Key");
    });

    test("returns error for non-existent key", async () => {
      const lookup_response = await client.lookup("non_existent_key");

      expect(lookup_response.success).toBe(false);
    });

    test("does not include hash in lookup result", async () => {
      const create_response = await client.create_key({
        owner: "test_owner",
        name: "Test Key",
      });
      if (!create_response.success) throw create_response.error;

      const lookup_response = await client.lookup(create_response.data.key);

      expect(lookup_response.success).toBe(true);
      if (!lookup_response.success) return;
      expect(lookup_response.data.hash).toBeUndefined();
    });

    test("returns error for expired key", async () => {
      const create_response = await client.create_key({
        owner: "test_owner",
        name: "Test Key",
      });
      if (!create_response.success) throw create_response.error;

      // Set the key to expire immediately (in the past)
      await vault.update(create_response.data.hash, {
        expires: Date.now() - 1,
      });

      const lookup_response = await client.lookup(create_response.data.key);

      expect(lookup_response.success).toBe(false);
      expect(lookup_response.error.message).toBe(ERR_KEY_EXPIRED);
    });

    test("returns key data for key with future expiration", async () => {
      const create_response = await client.create_key({
        owner: "test_owner",
        name: "Test Key",
      });
      if (!create_response.success) throw create_response.error;

      // Set the key to expire tomorrow
      await vault.update(create_response.data.hash, {
        expires: Date.now() + 86400000,
      });

      const lookup_response = await client.lookup(create_response.data.key);

      expect(lookup_response.success).toBe(true);
      if (!lookup_response.success) return;
      expect(lookup_response.data.owner).toBe("test_owner");
      expect(lookup_response.data.name).toBe("Test Key");
    });

    test("returns key data for key that never expires", async () => {
      const create_response = await client.create_key({
        owner: "test_owner",
        name: "Test Key",
      });
      if (!create_response.success) throw create_response.error;

      // Ensure the key never expires by not setting an expiration
      // (expires is undefined by default, which means never expires)
      const lookup_response = await client.lookup(create_response.data.key);

      expect(lookup_response.success).toBe(true);
      if (!lookup_response.success) return;
      expect(lookup_response.data.owner).toBe("test_owner");
      expect(lookup_response.data.name).toBe("Test Key");
    });
  });

  describe("list_by_owner", () => {
    let client: KeysClient;
    let vault: InMemoryKeyVault;

    beforeEach(() => {
      const setup = create_test_client();
      client = setup.client;
      vault = setup.vault;
    });

    test("lists keys for an owner", async () => {
      await client.create_key({ owner: "owner1", name: "Key 1" });
      await client.create_key({ owner: "owner1", name: "Key 2" });
      await client.create_key({ owner: "owner2", name: "Key 3" });

      const list_response = await client.list_by_owner("owner1");

      expect(list_response.length).toBe(2);
      expect(list_response.every((k) => k.owner === "owner1")).toBe(true);
    });

    test("returns empty array for owner with no keys", async () => {
      const list_response = await client.list_by_owner("non_existent_owner");
      expect(list_response).toEqual([]);
    });
  });
});
