import { isEmpty, values } from "ramda";
import { nanoid } from "nanoid";
import { key_schema } from "../types/keys";
import type { StoredKey } from "../types/keys";
import type { Cluster, Redis } from "ioredis";
import type { Result } from "../types/result";
import { to_result } from "../utils";
import {
  ERR_KEY_NOT_FOUND,
  ERR_DUPLICATE_KEY,
  ERR_KEY_CREATE_FAILED,
  ERR_KEY_VALIDATION,
  ERR_KEY_ALREADY_ROTATED,
} from "../errors";

export interface KeysStorage {
  /**
   * Retrieves a key by its hash.
   * @param hash - The unique hash of the key.
   * @returns The key object or `null` if not found.
   */
  get(hash: string): Promise<StoredKey | null>;

  /**
   * Creates a new key.
   * @param key - Key data (without auto-generated `id` and `createdAt`).
   * @returns A `Result` containing the created key on success, or an error if the key already exists.
   */
  create(key: Omit<StoredKey, "createdAt" | "id">): Promise<Result<StoredKey>>;

  /**
   * Updates an existing key.
   * @param hash - The hash of the key to update.
   * @param updates - Partial fields to update (cannot change `hash` or `owner`).
   * @returns A `Result` containing the updated key, or an error if the key does not exist.
   */
  update(
    hash: string,
    updates: Partial<Omit<StoredKey, "hash" | "owner">>,
  ): Promise<Result<StoredKey>>;

  /**
   * Rotates a key by creating a new key record with a new hash.
   * @param hash - The current hash of the key to rotate.
   * @param new_hash - The new hash to set.
   * @param grace_period - Optional grace period in seconds before the old key stops working.
   * @returns A `Result` containing the rotation metadata, or an error if the key does not exist.
   */
  rotate(
    hash: string,
    new_hash: string,
    grace_period?: number,
  ): Promise<Result<{
    expires_at: number;
  }>>;

  /**
   * Deletes a key by its hash.
   * @param hash - The hash of the key to delete.
   * @returns A `Result` containing true on success, or an error if the key doesn't exist.
   */
  delete(hash: string): Promise<Result<boolean>>;

  /**
   * Lists keys with cursor-based pagination.
   * @param cursor - Scan cursor (default 0).
   * @param count - Number of keys to fetch per page (default 10).
   * @returns An object containing the keys and the next cursor.
   */
  list(
    cursor?: number,
    count?: number,
  ): Promise<{ keys: StoredKey[]; next_cursor: string }>;

  /**
   * Lists keys belonging to a specific owner with cursor-based pagination.
   * @param owner - Owner identifier.
   * @param cursor - Scan cursor (default "0").
   * @param count - Number of keys to fetch per page (default 10).
   * @returns An object containing the keys and the next cursor.
   */
  list_by_owner(
    owner: string,
    cursor?: string | number,
    count?: number,
  ): Promise<{ keys: StoredKey[]; next_cursor: string }>;
}

const keys = (redis: Redis | Cluster): KeysStorage => {
  const get = async (hash: string): Promise<StoredKey | null> => {
    const result = await redis.hgetall(`key:${hash}`).then((key) => {
      if (values(key).length === 0) return {};

      return {
        ...key,
        rateLimits: key.rateLimits ? JSON.parse(key.rateLimits) : [],
      };
    });
    return isEmpty(result) ? null : (result as StoredKey);
  };
  /**
   * Creates a new key
   * @param data - The key data to create
   * @returns The created key with generated ID
   */
  const create = async (
    key: Omit<StoredKey, "createdAt" | "id">,
  ): Promise<Result<StoredKey>> => {
    const parsed = key_schema
      .omit({ createdAt: true })
      .safeParse({ ...key, id: nanoid(16) });
    if (!parsed.success) {
      return to_result({
        error: Error(`${ERR_KEY_VALIDATION}: ${parsed.error.message}`),
      });
    }
    const safe_key = parsed.data;

    const exists = await redis.exists(`key:${safe_key.hash}`);
    if (exists)
      return to_result({
        error: Error(ERR_DUPLICATE_KEY),
      });

    await redis
      .multi()
      .hset(`key:${safe_key.hash}`, {
        ...safe_key,
        createdAt: Date.now(),
        rateLimits: JSON.stringify(safe_key.rateLimits ?? []),
      })
      .sadd(`owner:${safe_key.owner}:keys`, safe_key.hash)
      .sadd("keys:all", safe_key.hash)
      .exec();

    const result = await get(safe_key.hash);
    if (!result)
      return to_result({
        error: Error(ERR_KEY_CREATE_FAILED),
      });
    return to_result({ data: result! });
  };

  const update: KeysStorage["update"] = async (
    hash: string,
    updates: Partial<Omit<StoredKey, "hash" | "owner">>,
  ) => {
    const parsed = key_schema
      .omit({ hash: true, owner: true })
      .partial()
      .safeParse(updates);
    if (!parsed.success) {
      return to_result({
        error: Error(`${ERR_KEY_VALIDATION}: ${parsed.error.message}`),
      });
    }
    const safe_updates = parsed.data;

    const exists = await redis.exists(`key:${hash}`);
    if (!exists) {
      return to_result({ error: Error(ERR_KEY_NOT_FOUND) });
    }

    if (Object.keys(safe_updates).length > 0) {
      await redis.hset(`key:${hash}`, {
        ...safe_updates,
        rateLimits: JSON.stringify(safe_updates.rateLimits ?? []),
      });
    }

    const data = await get(hash)
    return to_result({ data: data! });
  };

  const delete_key: KeysStorage["delete"] = async (hash: string) => {
    const key = await get(hash);
    if (key === null) {
      return to_result({ error: Error(ERR_KEY_NOT_FOUND) });
    }
    try {
      await redis
        .multi()
        .del(`key:${hash}`)
        .srem(`owner:${key.owner}:keys`, hash)
        .srem("keys:all", hash)
        .exec();
      return to_result({ data: true });
    } catch (error) {
      return to_result({ error: error as Error });
    }
  };

  const list = async (
    cursor: number = 0,
    count = 10,
  ): Promise<{ keys: StoredKey[]; next_cursor: string }> => {
    const [nextCursor, hashes] = await redis.sscan(
      "keys:all",
      cursor,
      "COUNT",
      count,
    );

    if (hashes.length === 0) return { keys: [], next_cursor: nextCursor };

    const pipeline = redis.pipeline();
    hashes.forEach((hash) => pipeline.hgetall(`key:${hash}`));
    const results = (await pipeline.exec()) ?? [];

    const keys = results.map(([err, data]) => {
      if (err) throw err;
      return {
        ...(data as any),
        rateLimits: (data as any).rateLimits
          ? JSON.parse((data as any).rateLimits)
          : [],
      } as StoredKey;
    });

    return { keys, next_cursor: nextCursor };
  };

  const list_by_owner = async (
    owner: string,
    cursor: string | number = "0",
    count = 10,
  ): Promise<{ keys: StoredKey[]; next_cursor: string }> => {
    const [nextCursor, hashes] = await redis.sscan(
      `owner:${owner}:keys`,
      cursor,
      "COUNT",
      count,
    );

    if (hashes.length === 0) return { keys: [], next_cursor: nextCursor };

    const pipeline = redis.pipeline();
    hashes.forEach((hash) => pipeline.hgetall(`key:${hash}`));
    const results = (await pipeline.exec()) ?? [];

    const keys = results.map(([err, data]) => {
      if (err) throw err;
      return {
        ...(data as any),
        rateLimits: (data as any).rateLimits
          ? JSON.parse((data as any).rateLimits)
          : [],
      } as StoredKey;
    });

    return { keys, next_cursor: nextCursor };
  };

  const rotate: KeysStorage["rotate"] = async (
    hash: string,
    new_hash: string,
    grace_period?: number,
  ) => {
    const old_key = await get(hash);
    if (old_key === null) {
      return to_result({ error: Error(ERR_KEY_NOT_FOUND) });
    }

    if ((old_key as Record<string, unknown>)["rotated"] === "true") {
      return to_result({ error: Error(ERR_KEY_ALREADY_ROTATED) });
    }

    const has_grace_period = grace_period !== undefined && grace_period > 0;
    const expires_at = has_grace_period
      ? Date.now() + grace_period * 1000
      : 0;

    const multi = redis.multi();

    if (has_grace_period) {
      multi.expire(`key:${hash}`, grace_period);
      multi.hset(`key:${hash}`, "rotated", "true");
    } else {
      multi.del(`key:${hash}`);
    }

    const { hash: _, owner, ...rest } = old_key;
    multi.hset(`key:${new_hash}`, {
      ...rest,
      hash: new_hash,
      owner,
      rateLimits: JSON.stringify(rest.rateLimits ?? []),
    });
    multi.sadd(`owner:${owner}:keys`, new_hash);
    multi.sadd("keys:all", new_hash);

    await multi.exec();

    return to_result({
      data: {
        expires_at,
      },
    });
  };

  return {
    create,
    get,
    update,
    rotate,
    delete: delete_key,
    list,
    list_by_owner,
  };
};

export default keys;
