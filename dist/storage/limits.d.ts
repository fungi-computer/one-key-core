import { RateLimit } from '../types/keys';
import { Redis, ChainableCommander, Cluster } from 'ioredis';
import { Result } from '../types/result';
export type RateLimitWithCheck = RateLimit & {
    exceeded: boolean;
    remaining: number;
    reset: number;
    scope: string;
};
export type RateLimitWithCheckResult = Result<RateLimitWithCheck[]>;
type RedisCheck = [number, number, number, string];
type CheckLimit = {
    (redis: Redis | Cluster, redis_key: string, scope: string, rate_limit: RateLimit): Promise<RedisCheck>;
    (redis: ChainableCommander, redis_key: string, scope: string, rate_limit: RateLimit): ChainableCommander;
};
export interface Limits {
    /**
     * Retrieves the current request count for a specific rate limit scope, key, and name.
     * This is useful for inspecting usage without modifying state.
     *
     * @param scope - The scope of the rate limit (e.g., "key" or "workspace").
     * @param key - The identifier of the entity (e.g., key ID or workspace ID).
     * @param name - The name of the rate limit (as defined in the rate limit configuration).
     * @returns A promise that resolves to the number of requests recorded in the current window.
     *
     * @example
     * const usage = await limits.get_usage("key", "key_abc123", "requests_per_minute");
     * console.log(usage); // e.g., 42
     */
    get_usage(scope: string, key: string, name: string): Promise<number>;
    /**
     * Checks a single rate limit against a Redis key, either by immediate execution or by adding to a pipeline.
     *
     * This function is overloaded:
     * - When called with a `Redis` or `Cluster` client, it executes the CHECK_LIMIT Lua script immediately and returns a tuple.
     * - When called with a `ChainableCommander` (pipeline), it appends the command to the pipeline and returns the pipeline for chaining.
     *
     * @param redis - A Redis client, cluster, or pipeline.
     * @param redis_key - The Redis key under which the rate limit data is stored.
     * @param scope - The scope of the check (e.g., "key" or "workspace"), used for error reporting.
     * @param rate_limit - The rate limit configuration (name, limit, duration, cost).
     * @returns Either a `Promise<RedisCheck>` (immediate mode) or a `ChainableCommander` (pipeline mode).
     *
     * @example Immediate mode
     * const [allowed, remaining, reset, scope] = await limits.check_limit(redis, "key:rate:foo", "key", myLimit);
     *
     * @example Pipeline mode
     * const pipeline = redis.pipeline();
     * limits.check_limit(pipeline, "key:rate:foo", "key", myLimit);
     * const results = await pipeline.exec();
     */
    check_limit: CheckLimit;
    /**
     * Converts a raw `RedisCheck` tuple (returned by `check_limit`) into a more readable object.
     *
     * @param check - A tuple of the form `[allowed, remaining, reset, scope]`.
     * @returns An object with `exceeded`, `remaining`, `reset`, and `scope` properties.
     *
     * @example
     * const check = [0, 5, 1609459200000, "key"];
     * const normalized = limits.normalize_limit_check(check);
     * // normalized = { exceeded: true, remaining: 5, reset: 1609459200000, scope: "key" }
     */
    normalize_limit_check(check: RedisCheck): {
        exceeded: boolean;
        remaining: number;
        reset: number;
        scope: string;
    };
    /**
     * Checks multiple rate limits for a given key hash.
     *
     * This method:
     * - Fetches the stored key by its hash.
     * - Merges the key's own rate limits with any workspace‑level limits (inherited from the owner).
     * - Prioritizes explicitly requested limits over automatically verified ones.
     * - Evaluates all applicable limits in a single Redis pipeline.
     * - Returns a `Result` containing an array of `RateLimitWithCheck` objects, each with runtime fields (`exceeded`, `remaining`, `reset`, `scope`).
     *
     * @param hash - The SHA‑256 hash of the API key (as stored in the system).
     * @param limits - An array of rate limits to check. These may partially override or augment the stored limits.
     * @returns A promise that resolves to a `Result` object. On success, `data` is an array of `RateLimitWithCheck`.
     *          On failure, `error` contains details (e.g., if the key does not exist).
     *
     * @example
     * const hash = "a1b2c3...";
     * const requested = [{ name: "api_calls", cost: 1 }];
     * const result = await limits.check_limits(hash, requested);
     * if (result.success) {
     *   result.data.forEach(limit => {
     *     console.log(`${limit.name}: exceeded? ${limit.exceeded}, remaining ${limit.remaining}`);
     *   });
     * }
     */
    check_limits(hash: string, limits: RateLimit[]): Promise<Result<RateLimitWithCheck[]>>;
}
declare const limits: (redis: Redis | Cluster) => {
    get_usage: (scope: string, key: string, name: string) => Promise<number>;
    check_limit: CheckLimit;
    normalize_limit_check: (check: RedisCheck) => {
        exceeded: boolean;
        remaining: number;
        reset: number;
        scope: string;
    };
    check_limits: (hash: string, limits: RateLimit[]) => Promise<Result<RateLimitWithCheck[]>>;
};
export default limits;
