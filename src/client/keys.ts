import crypto from "crypto";
import { omit } from "ramda";
import { to_result } from "../utils";
import { is_expired } from "../utils/expires.js";
import { ERR_KEY_NOT_FOUND, ERR_KEY_ALREADY_ROTATED, ERR_KEY_EXPIRED } from "../errors";
import { customAlphabet } from "nanoid";

import type { KeyVault } from "./keyvault";
import type { RateLimitWithCheck } from "../storage/limits";
import type { Result } from "../types/result";
import type { CreateKeyRequest, StoredKey } from "../types/keys";
import type { RotateKeyResponse } from "../types/keys";
import type { RateLimit } from "../schemas";

/**
 * Strategy for generating key values.
 */
export type KeyGenerator = (
  bytes?: number,
  prefix?: string,
) => { key: string; hash: string };

/**
 * Strategy for hashing keys.
 */
export type KeyHasher = (key: string) => string;

/**
 * Strategy for rotation policy decisions.
 */
export interface KeyRotationStrategy {
  /**
   * Determines if a key can be rotated.
   */
  can_rotate(stored_key: StoredKey): boolean;
  /**
   * Optional callback after successful rotation.
   */
  after_rotation?(previous_key: StoredKey): void;
}

/**
 * Default key generator using nanoid.
 */
export const default_key_generator: KeyGenerator = (bytes = 32, prefix = "") => {
  const key = generate_key(bytes, prefix);
  const hash = hash_key(key);
  return { key, hash };
};

/**
 * Default hasher using SHA-256.
 */
export const default_key_hasher: KeyHasher = (key: string) => hash_key(key);

/**
 * Default rotation strategy - denies already-rotated keys.
 */
export const default_rotation_strategy: KeyRotationStrategy = {
  can_rotate: (stored_key) => stored_key.rotated !== true,
};

const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz_";
const nanoid = customAlphabet(alphabet, 32);

/**
 * Generates a random key string.
 * @param bytes - Number of random bytes (default 32).
 * @param prefix - Optional prefix to prepend.
 * @returns The generated key string.
 */
export const generate_key = (bytes = 32, prefix = ""): string => {
  const key = nanoid(bytes);
  return prefix ? `${prefix}_${key}` : key;
};

/**
 * Hashes a key using SHA-256.
 * @param key - The plaintext key to hash.
 * @returns The hex-encoded hash.
 */
export const hash_key = (key: string): string =>
  crypto.createHash("sha256").update(key).digest("hex");

/**
 * Generates a new key and its hash.
 * @param bytes - Number of random bytes (default 32).
 * @param prefix - Optional prefix to prepend.
 * @returns The generated key and its hash.
 */
export const generate_key_and_hash = (bytes = 32, prefix = "") => {
  const key = generate_key(bytes, prefix);
  const hash = hash_key(key);
  return { key, hash };
};

type KeyVerification = Omit<StoredKey, "rateLimits"> & {
  valid: boolean;
  rateLimits: RateLimitWithCheck[];
};

export interface KeysClient {
  /**
   * Creates a new API key.
   * @param request - The key creation request (owner, rate limits, etc.)
   * @param options - Optional generation parameters (byte length, prefix)
   * @returns The created key (including the plaintext key) or an error.
   */
  create_key(
    request: CreateKeyRequest,
    options?: { bytes?: number; prefix?: string },
  ): Promise<Result<StoredKey & { key: string }>>;

  /**
   * Verifies an API key is valid (checks and increments usage)
   * @param key - The plaintext API key to verify.
   * @param limits - Rate limits to check.
   * @returns Result indicating whether the key is allowed or an error.
   */
  verify(key: string, limits: RateLimit[]): Promise<Result<KeyVerification>>;

  /**
   * Retrieves a key by its ID (hashes it internally).
   * @param key_id - The key ID.
   * @returns The key data without the hash field, or null if not found.
   */
  get(key_id: string): Promise<Omit<StoredKey, "hash"> | null>;

  /**
   * Updates an existing key by its ID.
   * @param key_id - The key ID to update.
   * @param updates - Fields to update (cannot change `hash` or `owner`).
   * @returns Result with the updated key or error.
   */
  update(
    key_id: string,
    updates: Partial<Omit<StoredKey, "hash" | "owner">>,
  ): Promise<Result<StoredKey>>;

  /**
   * Lists keys belonging to a specific owner.
   * @param owner - Owner identifier.
   * @returns Array of keys belonging to the owner (without hash).
   */
  list_by_owner(owner: string): Promise<Omit<StoredKey, "hash">[]>;

  /**
   * Deletes a key by its ID.
   * @param key_id - The key ID to delete.
   * @returns Result with true on success, or an error if the key doesn't exist.
   */
  delete(key_id: string): Promise<Result<boolean>>;

  /**
   * Rotates an API key by generating a new key value while preserving metadata.
   * @param key_id - The key ID to rotate.
   * @param options - Optional rotation parameters.
   * @param options.grace_period - Seconds the old key remains valid (default: 0 = immediate).
   * @returns The new key value and rotation metadata, or an error.
   */
  rotate_key(
    key_id: string,
    options?: { grace_period?: number },
  ): Promise<Result<RotateKeyResponse>>;

  /**
   * Looks up a key's full record from a plaintext key.
   * @param key - The plaintext API key.
   * @returns Result containing the full key record (without hash) or an error if the key doesn't exist.
   */
  lookup(key: string): Promise<Result<Omit<StoredKey, "hash">>>;
}

export type RateLimitChecker = (
  hash: string,
  limits: RateLimit[],
) => Promise<Result<RateLimitWithCheck[]>>;

export interface KeysClientOptions {
  vault: KeyVault;
  check_limits: RateLimitChecker;
  generate_key?: KeyGenerator;
  hash_key?: KeyHasher;
  rotation_strategy?: KeyRotationStrategy;
}

const keys = (options: KeysClientOptions): KeysClient => {
  const {
    vault,
    check_limits,
    generate_key = default_key_generator,
    hash_key = default_key_hasher,
    rotation_strategy = default_rotation_strategy,
  } = options;

  const create_key: KeysClient["create_key"] = async (
    request: CreateKeyRequest,
    request_options?: { bytes: number; prefix: string },
  ) => {
    const { key, hash } = generate_key(
      request_options?.bytes,
      request_options?.prefix,
    );

    const response = await vault.create({
      ...request,
      hash,
    });

    if (!response.success) return to_result({ error: response.error });
    const { data } = response;
    return to_result({ data: { ...data, key } });
  };

  const verify: KeysClient["verify"] = async (
    key: string,
    limits: RateLimit[],
  ) => {
    const hash = hash_key(key);

    const key_record = await vault.get(hash);
    if (!key_record) return to_result({ error: Error(ERR_KEY_NOT_FOUND) });

    if (is_expired(key_record)) {
      return to_result({ error: Error(ERR_KEY_EXPIRED) });
    }

    const response = await check_limits(hash, limits);
    if (!response.success) return response;

    const exceeded_record = response.data.find((limit) => limit.exceeded);
    const valid = exceeded_record === undefined;
    return to_result({
      data: {
        valid,
        ...key_record,
        rateLimits: response.data!,
      },
    });
  };

  const get = async (
    key_id: string,
  ): Promise<Omit<StoredKey, "hash"> | null> => {
    const hash_response = await vault.get_by_id(key_id);
    if (!hash_response.success) return null;
    const stored_key = await vault.get(hash_response.data);
    if (!stored_key) return null;
    return omit(["hash"], stored_key);
  };

  const update = async (
    key_id: string,
    updates: Partial<Omit<StoredKey, "hash" | "owner">>,
  ): Promise<Result<StoredKey>> => {
    const hash_response = await vault.get_by_id(key_id);
    if (!hash_response.success)
      return to_result({ error: Error(ERR_KEY_NOT_FOUND) });
    return vault.update(hash_response.data, updates);
  };

  const delete_key = async (key_id: string): Promise<Result<boolean>> => {
    const hash_response = await vault.get_by_id(key_id);
    if (!hash_response.success)
      return to_result({ error: Error(ERR_KEY_NOT_FOUND) });
    return vault.delete(hash_response.data);
  };

  const list_by_owner = async (
    owner: string,
  ): Promise<Omit<StoredKey, "hash">[]> => {
    const keys = await vault.list(owner);
    return keys.map((key) => omit(["hash"], key));
  };

  const rotate_key: KeysClient["rotate_key"] = async (key_id, options) => {
    const hash_response = await vault.get_by_id(key_id);
    if (!hash_response.success)
      return to_result({ error: Error(ERR_KEY_NOT_FOUND) });
    const current_hash = hash_response.data;

    const stored_key = await vault.get(current_hash);
    if (!stored_key) return to_result({ error: Error(ERR_KEY_NOT_FOUND) });

    // Delegate rotation eligibility check to configured strategy
    if (!rotation_strategy.can_rotate(stored_key)) {
      return to_result({ error: Error(ERR_KEY_ALREADY_ROTATED) });
    }

    const { key: new_key, hash: new_hash } = generate_key();

    // Create new key with rotated metadata
    const { hash: _, rotated: __, ...key_data } = stored_key;
    const create_response = await vault.create({
      ...key_data,
      hash: new_hash,
      rotated: undefined,
    });

    if (!create_response.success)
      return to_result({ error: create_response.error });

    const grace_period = options?.grace_period ?? 0;

    if (grace_period === 0) {
      await vault.delete(current_hash);
    } else {
      await vault.touch(current_hash);
    }

    void rotation_strategy.after_rotation?.(stored_key);

    const expires_at =
      grace_period > 0 ? Date.now() + grace_period * 1000 : 0;

    return to_result({
      data: {
        key: new_key,
        expires_at,
      },
    });
  };

  const lookup: KeysClient["lookup"] = async (key: string) => {
    const hash = hash_key(key);
    const stored_key = await vault.get(hash);
    if (!stored_key) return to_result({ error: Error(ERR_KEY_NOT_FOUND) });
    if (is_expired(stored_key)) {
      return to_result({ error: Error(ERR_KEY_EXPIRED) });
    }
    return to_result({ data: omit(["hash"], stored_key) });
  };

  return {
    create_key,
    verify,
    get,
    update,
    list_by_owner,
    delete: delete_key,
    rotate_key,
    lookup,
  };
};

export default keys;
