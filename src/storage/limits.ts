import type { RateLimit, StoredKey } from "../types/keys";
import Keys from "./keys";
import Workspaces from "./workspaces";
import type { Redis, ChainableCommander, Cluster } from "ioredis";

import {
  curry,
  chain,
  map,
  zipObj,
  prop,
  values,
  filter,
  mergeRight,
} from "ramda";
import { mergeDeepRight } from "ramda";
import rate_limit_script from "./rate-limit-script";
import { to_result } from "../utils";
import type { Result } from "../types/result";

export type RateLimitWithCheck = RateLimit & {
  exceeded: boolean;
  remaining: number;
  reset: number;
  scope: string;
};

export type RateLimitWithCheckResult = Result<RateLimitWithCheck[]>;

const object_from_list_with = curry((fn: (item: any) => string, list: any[]) =>
  chain(zipObj, map(fn))(list),
);

const object_from_list_with_name = object_from_list_with(prop("name"));

type RedisCheck = [number, number, number, string];
type CheckLimit = {
  (
    redis: Redis | Cluster,
    redis_key: string,
    scope: string,
    rate_limit: RateLimit,
  ): Promise<RedisCheck>;
  (
    redis: ChainableCommander,
    redis_key: string,
    scope: string,
    rate_limit: RateLimit,
  ): ChainableCommander;
};

const normalize_limit_check = (check: RedisCheck) => {
  const [allowed, remaining, reset, scope] = check;
  return { exceeded: allowed === 0, remaining, reset, scope };
};

const check_limit: CheckLimit = (redis, redis_key, scope, rate_limit) => {
  const cost = rate_limit.cost;
  const now = Date.now();

  // @ts-expect-error this is added in the limit constructor
  const response = redis.check_limit(
    redis_key,
    rate_limit.limit.toString(),
    rate_limit.duration.toString(),
    cost.toString(),
    now,
    scope,
  );

  return response;
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
  check_limits(
    hash: string,
    limits: RateLimit[],
  ): Promise<Result<RateLimitWithCheck[]>>;
}

const limits = (redis: Redis | Cluster) => {
  redis.defineCommand("check_limit", {
    numberOfKeys: 1,
    lua: rate_limit_script,
  });
  const keys = Keys(redis);
  const workspaces = Workspaces(redis);

  const get_limits_to_check = async (
    key: StoredKey,
    request_limits: Partial<RateLimit>[],
  ) => {
    const all_key_limits = object_from_list_with_name(key.rateLimits ?? []);

    // @ts-expect-error Ramdas filter is typed weird.
    const auto_key_limits = filter(
      (limit: RateLimit) => limit.autoVerify ?? false,
      all_key_limits,
    );

    const all_workspace_limits = object_from_list_with_name(
      (await workspaces.get(key.owner))?.rateLimits ?? [],
    );

    // @ts-expect-error Ramdas filter is typed weird.
    const auto_workspace_limits = filter(
      (limit: RateLimit) => limit.autoVerify ?? false,
      all_workspace_limits,
    );

    const all_requested_key_limits = request_limits.reduce(
      (acc, limit) => {
        const stored_key_limit = all_key_limits[limit.name ?? ""];
        const stored_workspace_limit = all_workspace_limits[limit.name ?? ""];

        return {
          workspaces: stored_workspace_limit
            ? {
                ...acc.workspaces,
                [limit.name!]: mergeRight(stored_workspace_limit, limit),
              }
            : acc.workspaces,
          keys: {
            ...acc.keys,
            [limit.name!]: mergeRight(stored_key_limit ?? {}, limit),
          },
        };
      },
      { keys: {}, workspaces: {} },
    );

    const prioritized_key_limits = mergeDeepRight(
      auto_key_limits,
      all_requested_key_limits.keys,
    );

    const prioritized_workspace_limits = mergeDeepRight(
      auto_workspace_limits,
      all_requested_key_limits.workspaces,
    );

    const key_limits_to_check = values(prioritized_key_limits) as RateLimit[];

    const workspace_limits_to_check = values(
      prioritized_workspace_limits,
    ) as RateLimit[];

    return { key_limits_to_check, workspace_limits_to_check };
  };

  const get_usage = async (scope: string, key: string, name: string) => {
    const redis_key = `${scope}_rate_limit:${key}:${name}`;
    const usage = await redis.zcard(redis_key);
    return usage;
  };

  return {
    get_usage,
    check_limit,
    normalize_limit_check,
    check_limits: async (
      hash: string,
      limits: RateLimit[],
    ): Promise<Result<RateLimitWithCheck[]>> => {
      const key = await keys.get(hash);

      if (key === null) {
        return to_result({ error: Error("NO KEY FOUND") });
      }

      const pipeline = redis.pipeline();
      const { key_limits_to_check, workspace_limits_to_check } =
        await get_limits_to_check(key!, limits);

      key_limits_to_check.forEach((rate_limit) => {
        const redis_key = `key_rate_limit:${key!.id}:${rate_limit.name}`;
        const scope = "key";
        check_limit(pipeline, redis_key, scope, rate_limit);
      });

      workspace_limits_to_check.forEach((rate_limit) => {
        const redis_key = `workspace_rate_limit:${key.owner}:${rate_limit.name}`;
        const scope = "workspace";
        check_limit(pipeline, redis_key, scope, rate_limit);
      });

      type PipelineResult = [Error | null, RedisCheck];
      const results: [Error | null, RedisCheck][] =
        ((await pipeline.exec()) as PipelineResult[]) ?? [];

      const combined_limits = key_limits_to_check.concat(
        workspace_limits_to_check,
      );

      const key_results = results.map(([err, res], idx) => {
        if (err) {
          const scope = res[3];
          return {
            exceeded: true,
            name: combined_limits[idx].name,
            limit: combined_limits[idx].limit,
            duration: combined_limits[idx].duration,
            reset: combined_limits[idx].duration,
            cost: combined_limits[idx].cost,
            remaining: 0,
            scope: scope,
          } as RateLimitWithCheck;
        }

        const [allowed, remaining, reset, scope] = res;
        return {
          exceeded: allowed === 0,
          name: combined_limits[idx].name,
          limit: combined_limits[idx].limit,
          duration: combined_limits[idx].duration,
          cost: combined_limits[idx].cost,
          reset: Math.max(0, reset),
          remaining: Math.max(0, remaining),
          scope: scope,
        } as RateLimitWithCheck;
      });

      return to_result({ data: key_results });
    },
  };
};

export default limits;
