import type { Cluster, Redis } from "ioredis";
import Storage from "./storage/storage";
import Client from "./client/client";
export type { KeysStorage } from "./storage/keys";
export type { Client } from "./client/client";
export {
  rate_limit_schema,
  rate_limit_schema_partial,
} from "./schemas";
export type { RateLimit } from "./schemas";
export type {
  StoredKey,
  Workspace,
  CreateKeyRequest,
  CreateKeyResponse,
  VerifyKeyRequest,
  VerifyKeyResponse,
  RotateKeyRequest,
  RotateKeyResponse,
} from "./types/keys";

/**
 * Creates a OneKey instance bound to a Redis client.
 *
 * @param options - Configuration options.
 * @param options.redis - An instance of a Redis client (either Redis or Cluster) from ioredis.
 * @returns An object containing the Client API (details to be documented later).
 */

const OneKey = (options: { redis: Redis | Cluster }) => {
  const { redis } = options;
  const storage = Storage({ redis: redis });
  const client = Client({ storage: storage });

  return client;
};

export default OneKey;
