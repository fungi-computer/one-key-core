import crypto from "crypto";
import { omit } from "ramda";
import { to_result } from "../utils";
import { ERR_KEY_NOT_FOUND } from "../errors";
import { customAlphabet } from "nanoid";

import type { KeysStorage } from "../main";
import type { Result } from "../types/result";
import type { Storage } from "../storage/storage";
import type { RateLimitWithCheck } from "../storage/limits";
import type { CreateKeyRequest, RateLimit, StoredKey } from "../types/keys";
import type { RotateKeyResponse } from "../types/keys";

const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz_";
const nanoid = customAlphabet(alphabet, 32);

const generate_key = (bytes = 32, prefix = ""): string => {
  const key = nanoid(bytes);
  return prefix ? `${prefix}_${key}` : key;
};

const hash_key = (key: string) =>
  crypto.createHash("sha256").update(key).digest("hex");

const generate_key_and_hash = (bytes = 32, prefix = "") => {
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
  update(key_id: string, updates: Partial<Omit<StoredKey, "hash" | "owner">>): Promise<Result<StoredKey>>;

  /**
   * Lists keys belonging to a specific owner with cursor‑based pagination.
   * @param owner - Owner identifier.
   * @param cursor - Scan cursor (default "0").
   * @param count - Number of keys per page (default 10).
   */
  list_by_owner: KeysStorage["list_by_owner"];

  /**
   * Deletes a key by its ID.
   * @param key_id - The key ID to delete.
   * @returns Result with true on success, or an error if the key doesn't exist.
   */
  delete(key_id: string): Promise<Result<boolean>>;

  /**
   * Rotates an API key by generating a new key value while preserving metadata.
   * @param key - The current plaintext key to rotate.
   * @param options - Optional rotation parameters.
   * @param options.grace_period - Seconds the old key remains valid (default: 0 = immediate).
   * @returns The new key value and rotation metadata, or an error.
   */
  rotate_key(
    key: string,
    options?: { grace_period?: number },
  ): Promise<Result<RotateKeyResponse>>;

  /**
   * Looks up a key's full record from a plaintext key.
   * @param key - The plaintext API key.
   * @returns Result containing the full key record (without hash) or an error if the key doesn't exist.
   */
  lookup(key: string): Promise<Result<Omit<StoredKey, "hash">>>;
}

const keys = (storage: Storage): KeysClient => {
  const create_key: KeysClient["create_key"] = async (
    request: CreateKeyRequest,
    options?: { bytes: number; prefix: string },
  ) => {
    const { key, hash } = generate_key_and_hash(
      options?.bytes,
      options?.prefix,
    );

    const response = await storage.keys.create({
      ...request,
      hash,
    });

    const { success } = response;
    if (!success) return to_result({ error: response.error });
    const { data } = response;
    return to_result({ data: { ...data, key } });
  };

  const verify: KeysClient["verify"] = async (
    key: string,
    limits: RateLimit[],
  ) => {
    const hash = hash_key(key);
    const response = await storage.limits.check_limits(hash, limits);
    if (!response.success) return response;

    const key_record = await storage.keys.get(hash);
    if (!key_record) return to_result({ error: Error(ERR_KEY_NOT_FOUND) });

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

  const get = async (key_id: string): Promise<Omit<StoredKey, "hash"> | null> => {
    const hash_response = await storage.keys.get_by_id(key_id);
    if (!hash_response.success) return null;
    const stored_key = await storage.keys.get(hash_response.data);
    if (!stored_key) return null;
    return omit(["hash"], stored_key);
  };

  const update = async (
    key_id: string,
    updates: Partial<Omit<StoredKey, "hash" | "owner">>,
  ): Promise<Result<StoredKey>> => {
    const hash_response = await storage.keys.get_by_id(key_id);
    if (!hash_response.success) return to_result({ error: Error(ERR_KEY_NOT_FOUND) });
    return storage.keys.update(hash_response.data, updates);
  };
  const delete_key = async (key_id: string): Promise<Result<boolean>> => {
    const hash_response = await storage.keys.get_by_id(key_id);
    if (!hash_response.success) return to_result({ error: Error(ERR_KEY_NOT_FOUND) });
    return storage.keys.delete(hash_response.data);
  };
  const list_by_owner: KeysClient["list_by_owner"] = storage.keys.list_by_owner;

  const rotate_key: KeysClient["rotate_key"] = async (key, options) => {
    const old_hash = hash_key(key);
    const { key: new_key, hash: new_hash } = generate_key_and_hash();

    const response = await storage.keys.rotate(
      old_hash,
      new_hash,
      options?.grace_period,
    );
    if (!response.success) return to_result({ error: response.error });

    return to_result({
      data: {
        key: new_key,
        expires_at: response.data.expires_at,
      },
    });
  };

  const lookup: KeysClient["lookup"] = async (key: string) => {
    const hash = hash_key(key);
    const stored_key = await storage.keys.get(hash);
    if (!stored_key) return to_result({ error: Error(ERR_KEY_NOT_FOUND) });
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
