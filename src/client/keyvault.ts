import type { StoredKey } from "../types/keys";
import type { Result } from "../types/result";

export type NewKey = Omit<StoredKey, "createdAt" | "id">;

/**
 * Policy for key rotation state machine.
 * Determines when a key can be rotated and what happens to the old key.
 */
export interface RotationPolicy {
  /**
   * Whether the key has already been rotated.
   */
  readonly rotated: boolean;

  /**
   * Grace period in seconds before the old key stops working.
   * 0 means immediate revocation.
   */
  readonly grace_period: number;

  /**
   * Unix timestamp when the old key expires.
   */
  readonly expires_at: number;
}

export interface KeyVault {
  /**
   * Retrieves a key by its hash.
   * @param hash - The unique hash of the key.
   * @returns The key object or `null` if not found.
   */
  get(hash: string): Promise<StoredKey | null>;

  /**
   * Retrieves a hash by its key ID.
   * @param key_id - The unique ID of the key.
   * @returns A `Result` containing the hash string, or an error if not found.
   */
  get_by_id(key_id: string): Promise<Result<string>>;

  /**
   * Creates a new key.
   * @param key - Key data (without auto-generated `id` and `createdAt`).
   * @returns A `Result` containing the created key on success, or an error if the key already exists.
   */
  create(key: NewKey): Promise<Result<StoredKey>>;

  /**
   * Updates an existing key.
   * @param key_id - The hash of the key to update.
   * @param updates - Partial fields to update (cannot change `hash` or `owner`).
   * @returns A `Result` containing the updated key, or an error if the key does not exist.
   */
  update(
    hash: string,
    updates: Partial<Omit<StoredKey, "hash" | "owner">>,
  ): Promise<Result<StoredKey>>;

  /**
   * Deletes a key by its hash.
   * @param hash - The hash of the key to delete.
   * @returns A `Result` containing true on success, or an error if the key doesn't exist.
   */
  delete(hash: string): Promise<Result<boolean>>;

  /**
   * Lists keys belonging to a specific owner with cursor-based pagination.
   * @param workspace_id - Owner/workspace identifier.
   * @param cursor - Scan cursor (default "0").
   * @param count - Number of keys to fetch per page (default 10).
   * @returns An object containing the keys and the next cursor.
   */
  list(
    workspace_id: string,
    cursor?: string | number,
    count?: number,
  ): Promise<{ keys: StoredKey[]; next_cursor: string }>;

  /**
   * Touches a key to mark it as rotated (prevents re-rotation).
   * @param key_id - The hash of the key to touch.
   * @returns A `Result` containing void on success, or an error if the key doesn't exist.
   */
  touch(hash: string): Promise<Result<void>>;
}
