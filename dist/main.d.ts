import { Cluster, Redis } from 'ioredis';
export type { KeysStorage } from './storage/keys';
/**
 * Creates a OneKey instance bound to a Redis client.
 *
 * @param options - Configuration options.
 * @param options.redis - An instance of a Redis client (either Redis or Cluster) from ioredis.
 * @returns An object containing the Client API (details to be documented later).
 */
declare const OneKey: (options: {
    redis: Redis | Cluster;
}) => import('./client/client').Client;
export default OneKey;
