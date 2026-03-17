import crypto from "crypto";
import { omit } from "ramda";
import { to_result } from "../utils";
import { customAlphabet } from "nanoid";

import type { KeysStorage } from "../main";
import type { Result } from "../types/result";
import type { Storage } from "../storage/storage";
import type { RateLimitWithCheck } from "../storage/limits";
import type { CreateKeyRequest, RateLimit, StoredKey } from "../types/keys";

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
   * Retrieves a key by its plaintext value (hashes it internally).
   * @param key - The plaintext API key.
   * @returns The key data without the hash field, or null if not found.
   */
  get: (
    ...args: Parameters<KeysStorage["get"]>
  ) => Promise<Omit<StoredKey, "hash"> | null>;

  /**
   * Updates an existing key by its plaintext value.
   * @param key - The plaintext key to update.
   * @param updates - Fields to update (cannot change `hash` or `owner`).
   * @returns Result with the updated key or error.
   */
  update: KeysStorage["update"];

  /**
   * Lists keys belonging to a specific owner with cursor‑based pagination.
   * @param owner - Owner identifier.
   * @param cursor - Scan cursor (default "0").
   * @param count - Number of keys per page (default 10).
   */
  list_by_owner: KeysStorage["list_by_owner"];

  /**
   * Deletes a key by its plaintext value.
   * @param key - The plaintext key to delete.
   * @returns The Redis multi-exec result, or undefined if the key didn't exist.
   */
  delete: KeysStorage["delete"];
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
    if (!key_record) return to_result({ error: Error("KEY NOT FOUND") });

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

  const get = async (key: string): Promise<Omit<StoredKey, "hash"> | null> => {
    const hash = hash_key(key);
    const stored_key = await storage.keys.get(hash);

    if (!stored_key) return null;
    return omit(["hash"], stored_key);
  };

  const update: KeysClient["update"] = (key: string, updates) =>
    storage.keys.update(hash_key(key), updates);
  const delete_key = (key: string) => storage.keys.delete(hash_key(key));
  const list_by_owner: KeysClient["list_by_owner"] = storage.keys.list_by_owner;

  return {
    create_key,
    verify,
    get,
    update,
    list_by_owner,
    delete: delete_key,
  };
};

export default keys;
