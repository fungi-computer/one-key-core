import { KeysStorage } from './keys';
import { Redis, Cluster } from 'ioredis';
import { WorkspacesStorage } from './workspaces';
import { Limits } from './limits';
export type { WorkspacesStorage } from './workspaces';
export interface Storage {
    keys: KeysStorage;
    limits: Limits;
    workspaces: WorkspacesStorage;
}
declare const Storage: ({ redis }: {
    redis: Redis | Cluster;
}) => {
    keys: KeysStorage;
    workspaces: WorkspacesStorage;
    limits: {
        get_usage: (scope: string, key: string, name: string) => Promise<number>;
        check_limit: {
            (redis: Redis | Cluster, redis_key: string, scope: string, rate_limit: import('../types/keys').RateLimit): Promise<[number, number, number, string]>;
            (redis: import('ioredis').ChainableCommander, redis_key: string, scope: string, rate_limit: import('../types/keys').RateLimit): import('ioredis').ChainableCommander;
        };
        normalize_limit_check: (check: [number, number, number, string]) => {
            exceeded: boolean;
            remaining: number;
            reset: number;
            scope: string;
        };
        check_limits: (hash: string, limits: import('../types/keys').RateLimit[]) => Promise<import('../types/result').Result<import('./limits').RateLimitWithCheck[]>>;
    };
};
export default Storage;
