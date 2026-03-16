import { StoredKey } from '../types/keys';
import { Cluster, Redis } from 'ioredis';
import { Result } from '../types/result';
export interface KeysStorage {
    /**
     * Retrieves a key by its hash.
     * @param hash - The unique hash of the key.
     * @returns The key object or `null` if not found.
     */
    get(hash: string): Promise<StoredKey | null>;
    /**
     * Creates a new key.
     * @param data - Key data (without auto-generated `id` and `createdAt`).
     * @returns A tuple with an error (if any) and the created key.
     */
    create(key: Omit<StoredKey, "createdAt" | "id">): Promise<Result<StoredKey>>;
    /**
     * Updates an existing key.
     * @param hash - The hash of the key to update.
     * @param updates - Partial fields to update (cannot change `hash` or `owner`).
     * @returns The updated key.
     * @throws {Error} If the key does not exist.
     */
    update(hash: string, updates: Partial<Omit<StoredKey, "hash" | "owner">>): Promise<Result<StoredKey>>;
    /**
     * Deletes a key by its hash.
     * @param hash - The hash of the key to delete.
     * @returns The Redis multi-exec result, or `undefined` if the key didn't exist.
     */
    delete(hash: string): Promise<any>;
    /**
     * Lists keys with cursor-based pagination.
     * @param cursor - Scan cursor (default 0).
     * @param count - Number of keys to fetch per page (default 10).
     * @returns An object containing the keys and the next cursor.
     */
    list(cursor?: number, count?: number): Promise<{
        keys: StoredKey[];
        next_cursor: string;
    }>;
    /**
     * Lists keys belonging to a specific owner with cursor-based pagination.
     * @param owner - Owner identifier.
     * @param cursor - Scan cursor (default "0").
     * @param count - Number of keys to fetch per page (default 10).
     * @returns An object containing the keys and the next cursor.
     */
    list_by_owner(owner: string, cursor?: string | number, count?: number): Promise<{
        keys: StoredKey[];
        next_cursor: string;
    }>;
}
declare const keys: (redis: Redis | Cluster) => KeysStorage;
export default keys;
