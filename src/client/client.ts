import type { Storage } from "../storage/storage";
import type { WorkspacesStorage } from "../storage/workspaces";

import keys, { type KeysClient } from "./keys";

export interface Client {
  keys: KeysClient;
  workspaces: Omit<WorkspacesStorage, "list">;
  admin: Storage;
}

const Client = (options: { storage: Storage }): Client => {
  const { storage } = options;
  return {
    keys: keys(storage),
    admin: storage,
    workspaces: storage.workspaces,
  };
};

export default Client;
