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
  const storage = {
    keys: keys(redis),
    workspaces: workspaces(redis),
    limits: limits(redis),
  };
  return storage;
};

export default Storage;
