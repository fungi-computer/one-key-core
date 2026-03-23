import { nanoid } from "nanoid";
import type { StoredKey } from "../../src/types/keys";
import type { Result } from "../../src/types/result";
import type { KeyVault, NewKey } from "../../src/client/keyvault";
import { ERR_KEY_NOT_FOUND, ERR_DUPLICATE_KEY } from "../../src/errors";
import { to_result } from "../../src/utils";

/**
 * In-memory implementation of KeyVault for unit testing.
 * Uses a simple Map for storage instead of Redis.
 */
export class InMemoryKeyVault implements KeyVault {
  private readonly keys_by_hash: Map<string, StoredKey>;
  private readonly keys_by_id: Map<string, string>;
  private readonly keys_by_owner: Map<string, Set<string>>;

  constructor() {
    this.keys_by_hash = new Map();
    this.keys_by_id = new Map();
    this.keys_by_owner = new Map();
  }

  async get(hash: string): Promise<StoredKey | null> {
    const key = this.keys_by_hash.get(hash);
    if (!key) return null;

    // Parse rotated field if stored as string or integer
    const rotated =
      key.rotated === true || key.rotated === "true" || key.rotated === 1
        ? true
        : undefined;

    return {
      ...key,
      rotated,
    };
  }

  async get_by_id(key_id: string): Promise<Result<string>> {
    const hash = this.keys_by_id.get(key_id);
    if (!hash) {
      return to_result({ error: Error(ERR_KEY_NOT_FOUND) });
    }
    return to_result({ data: hash });
  }

  async create(key: NewKey): Promise<Result<StoredKey>> {
    const existing = this.keys_by_hash.get(key.hash);
    if (existing) {
      return to_result({ error: Error(ERR_DUPLICATE_KEY) });
    }

    const id = nanoid(16);
    const created_at = Date.now();

    const stored_key: StoredKey = {
      ...key,
      id,
      createdAt: created_at,
    };

    this.keys_by_hash.set(key.hash, stored_key);
    this.keys_by_id.set(id, key.hash);

    const owner_keys = this.keys_by_owner.get(key.owner) ?? new Set();
    owner_keys.add(key.hash);
    this.keys_by_owner.set(key.owner, owner_keys);

    return to_result({ data: stored_key });
  }

  async update(
    hash: string,
    updates: Partial<Omit<StoredKey, "hash" | "owner">>,
  ): Promise<Result<StoredKey>> {
    const key = this.keys_by_hash.get(hash);
    if (!key) {
      return to_result({ error: Error(ERR_KEY_NOT_FOUND) });
    }

    const updated_key: StoredKey = {
      ...key,
      ...updates,
      id: key.id,
      hash: key.hash,
      owner: key.owner,
    };

    this.keys_by_hash.set(hash, updated_key);
    return to_result({ data: updated_key });
  }

  async delete(hash: string): Promise<Result<boolean>> {
    const key = this.keys_by_hash.get(hash);
    if (!key) {
      return to_result({ error: Error(ERR_KEY_NOT_FOUND) });
    }

    this.keys_by_hash.delete(hash);
    this.keys_by_id.delete(key.id);

    const owner_keys = this.keys_by_owner.get(key.owner);
    if (owner_keys) {
      owner_keys.delete(hash);
    }

    return to_result({ data: true });
  }

  async list(
    workspace_id: string,
    _cursor: string | number = "0",
    _count = 10,
  ): Promise<{ keys: StoredKey[]; next_cursor: string }> {
    const owner_keys = this.keys_by_owner.get(workspace_id);
    if (!owner_keys) return { keys: [], next_cursor: "0" };

    const keys: StoredKey[] = [];
    for (const hash of owner_keys) {
      const key = this.keys_by_hash.get(hash);
      if (key) {
        keys.push(key);
      }
    }
    return { keys, next_cursor: "0" };
  }

  async touch(hash: string): Promise<Result<void>> {
    const key = this.keys_by_hash.get(hash);
    if (!key) {
      return to_result({ error: Error(ERR_KEY_NOT_FOUND) });
    }

    const updated_key: StoredKey = {
      ...key,
      rotated: true,
    };

    this.keys_by_hash.set(hash, updated_key);
    return to_result({ data: undefined });
  }

  /**
   * Helper to clear all keys (for test setup).
   */
  clear(): void {
    this.keys_by_hash.clear();
    this.keys_by_id.clear();
    this.keys_by_owner.clear();
  }

  /**
   * Helper to get all keys (for debugging tests).
   */
  get_all_keys(): StoredKey[] {
    return Array.from(this.keys_by_hash.values());
  }
}
