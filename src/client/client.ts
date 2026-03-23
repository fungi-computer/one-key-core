import type { Cluster, Redis } from "ioredis";
import type { PublicKeysClient, KeysClient } from "./keys";

import {
  create_keys_client,
  create_public_keys_client,
  type RateLimiter,
} from "./keys";
import type { KeyVault } from "./keyvault";
import Storage, { type Storage as StorageInterface } from "../storage/storage";

/**
 * Public-facing OneKey interface with limited API surface.
 * Only exposes keys operations - no workspaces, limits, or admin access.
 */
export type PublicOneKey = {
  keys: PublicKeysClient;
};

export type Client = {
  keys: PublicKeysClient;
  admin: AdminOneKey;
};

/**
 * Admin OneKey interface with full storage access.
 * Exposes keys, workspaces, and limits management.
 */
export type AdminOneKey = {
  keys: KeysClient;
  workspaces: StorageInterface["workspaces"];
  limits: StorageInterface["limits"];
};

/**
 * Adapts KeysStorage to the KeyVault port interface.
 */
const adapt_key_vault = (storage: StorageInterface): KeyVault => {
  const vault: KeyVault = {
    get: storage.keys.get,
    get_by_id: storage.keys.get_by_id,
    create: storage.keys.create,
    update: storage.keys.update,
    delete: storage.keys.delete,
    list: storage.keys.list_by_owner,
    touch: storage.keys.touch,
  };
  return vault;
};

/**
 * Adapts the storage's rate limit checker to the RateLimiter interface.
 */
const adapt_rate_limiter = (storage: StorageInterface): RateLimiter => {
  return async (hash, limits) => storage.limits.check_limits(hash, limits);
};

/**
 * Creates a public-facing OneKey instance with only key operations.
 * Use this for untrusted environments or public APIs.
 */
const create_public_one_key = (options: {
  storage: StorageInterface;
}): PublicOneKey => {
  const { storage } = options;
  return {
    keys: create_public_keys_client({
      vault: adapt_key_vault(storage),
      check_limits: adapt_rate_limiter(storage),
    }),
  };
};

/**
 * Creates the full Admin OneKey instance with all storage access.
 */
const create_admin_one_key = (options: {
  storage: StorageInterface;
}): AdminOneKey => {
  const { storage } = options;
  return {
    keys: create_keys_client({
      vault: adapt_key_vault(storage),
      check_limits: adapt_rate_limiter(storage),
    }),
    workspaces: storage.workspaces,
    limits: storage.limits,
  };
};

/**
 * Factory for creating OneKey instances.
 * Returns an object with:
 * - keys: PublicKeysClient (create_key, verify, lookup only)
 * - admin: AdminOneKey (full access to keys, workspaces, limits)
 *
 * @param options - Configuration options
 * @param options.redis - An instance of a Redis client (either Redis or Cluster) from ioredis
 * @returns An object with public keys API and full admin access
 */
const OneKey = (options: {
  redis: Redis | Cluster;
}): { keys: PublicKeysClient; admin: AdminOneKey } => {
  const { redis } = options;
  const storage = Storage({ redis });

  return {
    keys: create_public_one_key({ storage }).keys,
    admin: create_admin_one_key({ storage }),
  };
};

export { OneKey };
export default OneKey;
