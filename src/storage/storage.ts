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
    limits: limits(redis, { keys_storage, workspaces_storage }),
  };
  return storage;
};

export default Storage;
