import type { Storage } from "../storage/storage";
import type { WorkspacesStorage } from "../storage/workspaces";
import type { KeyVault } from "./keyvault";

import keys, { type KeysClient, type RateLimitChecker } from "./keys";

export interface Client {
  keys: KeysClient;
  workspaces: Omit<WorkspacesStorage, "list">;
  admin: Storage;
}

/**
 * Adapts KeysStorage to the KeyVault port interface.
 */
const adapt_key_vault = (storage: Storage): KeyVault => {
  const vault: KeyVault = {
    get: storage.keys.get,
    get_by_id: storage.keys.get_by_id,
    create: storage.keys.create,
    update: storage.keys.update,
    delete: storage.keys.delete,
    list: storage.keys.list_keys_for_owner,
    touch: storage.keys.touch,
  };
  return vault;
};

/**
 * Adapts the storage's rate limit checker to the RateLimitChecker interface.
 */
const adapt_rate_limit_checker = (storage: Storage): RateLimitChecker => {
  return async (hash, limits) => storage.limits.check_limits(hash, limits);
};

const Client = (options: { storage: Storage }): Client => {
  const { storage } = options;
  return {
    keys: keys({
      vault: adapt_key_vault(storage),
      check_limits: adapt_rate_limit_checker(storage),
    }),
    admin: storage,
    workspaces: storage.workspaces,
  };
};

export default Client;
