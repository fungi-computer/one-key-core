import { KeysStorage } from '../main';
import { Result } from '../types/result';
import { Storage } from '../storage/storage';
import { RateLimitWithCheck } from '../storage/limits';
import { CreateKeyRequest, RateLimit, StoredKey } from '../types/keys';
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
    create_key(request: CreateKeyRequest, options?: {
        bytes?: number;
        prefix?: string;
    }): Promise<Result<StoredKey & {
        key: string;
    }>>;
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
    get: (...args: Parameters<KeysStorage["get"]>) => Promise<Omit<StoredKey, "hash"> | null>;
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
declare const keys: (storage: Storage) => KeysClient;
export default keys;
