import keys, { type KeysStorage } from "./keys";
import type { Redis, Cluster } from "ioredis";
import workspaces, { type WorkspacesStorage } from "./workspaces";
import limits, { type Limits } from "./limits";

export type { WorkspacesStorage } from "./workspaces";

export interface Storage {
  keys: KeysStorage;
  limits: Limits;
  workspaces: WorkspacesStorage;
}

const Storage = ({ redis }: { redis: Redis | Cluster }) => {
  const keys_storage = keys(redis);
  const workspaces_storage = workspaces(redis);

  const storage = {
    keys: keys_storage,
    workspaces: workspaces_storage,
    limits: limits(redis, {
      get_key: (key_id: string) => keys_storage.get(key_id),
      get_workspace: (workspace_id: string) => workspaces_storage.get(workspace_id),
    }),
  };
  return storage;
};

export default Storage;
