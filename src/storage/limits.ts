import type { StoredKey, Workspace } from "../types/keys";
import type { RateLimit } from "../schemas";
import { rate_limit_schema } from "../schemas";
import { z } from "zod";
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
import { ERR_RATE_LIMIT_INVALID, ERR_KEY_NOT_FOUND } from "../errors";
import type { Result } from "../types/result";

/**
 * Port interface for RateLimitEngine dependency injection.
 * Abstracts the storage operations needed for rate-limit inheritance.
 */
export interface RateLimitEnginePorts {
  get_key(key_id: string): Promise<StoredKey | null>;
  get_workspace(workspace_id: string): Promise<Workspace | null>;
}

export type RateLimitWithCheck = RateLimit & {
  exceeded: boolean;
  remaining: number;
  reset: number;
  scope: string;
};

export type RateLimitWithCheckResult = Result<RateLimitWithCheck[]>;

export const check_limit_schema = z.object({
  identifier: z.string().min(1).max(256),
  limit: z.number().int().min(1),
  duration: z.number().min(1).max(86400),
});

export type CheckLimitInput = z.infer<typeof check_limit_schema>;

export type CheckLimitResult = {
  allowed: boolean;
  remaining: number;
  reset: number;
};

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

/**
 * RateLimitEngine handles rate-limit inheritance and merging.
 * Merge priority (highest to lowest): explicit key limit → workspace limit → global default
 *
 * This class is purely computational - it takes injectable ports for storage access.
 */
export class RateLimitEngine {
  private get_workspace: RateLimitEnginePorts["get_workspace"];

  constructor(ports: RateLimitEnginePorts) {
    this.get_workspace = ports.get_workspace;
  }

  /**
   * Retrieves limits to check for a given key, applying inheritance rules.
   * Merge priority: explicit key limit → workspace limit → autoVerify defaults
   */
  async get_limits_to_check(
    key: StoredKey,
    request_limits: Partial<RateLimit>[],
  ): Promise<{ key_limits_to_check: RateLimit[]; workspace_limits_to_check: RateLimit[] }> {
    const all_key_limits: Record<string, RateLimit> = object_from_list_with_name(key.rateLimits ?? []);

    const auto_key_limits = filter(
      (limit: RateLimit) => limit.autoVerify ?? false,
      all_key_limits,
    );

    const all_workspace_limits: Record<string, RateLimit> = object_from_list_with_name(
      (await this.get_workspace(key.owner))?.rateLimits ?? [],
    );

    const auto_workspace_limits = filter(
      (limit: RateLimit) => limit.autoVerify ?? false,
      all_workspace_limits,
    );

    const all_requested_key_limits = request_limits.reduce(
      (acc, limit) => {
        const limit_name = limit.name ?? "";
        const stored_key_limit = all_key_limits[limit_name];
        const stored_workspace_limit = all_workspace_limits[limit_name];

        return {
          workspaces: stored_workspace_limit
            ? {
                ...acc.workspaces,
                [limit_name]: mergeRight(stored_workspace_limit, limit),
              }
            : acc.workspaces,
          keys: {
            ...acc.keys,
            [limit_name]: mergeRight(stored_key_limit ?? {}, limit),
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
  }
}

const check_limit_internal: CheckLimit = (redis, redis_key, scope, rate_limit) => {
  const cost = rate_limit.cost ?? 1;
  const now = Date.now();

  // @ts-expect-error - Lua command added via defineCommand
  const response = redis.check_limit(
    redis_key,
    rate_limit.limit.toString(),
    ((rate_limit.duration ?? 60) * 1000).toString(),
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
   * Checks rate limit - overloaded to support both standalone and pipeline usage.
   *
   * Standalone (3 args): Check limit without key/workspace dependency
   * @param identifier - Arbitrary string (IP, user ID, etc.), max 256 chars
   * @param limit - Max requests allowed, min 1
   * @param duration - Window in seconds, min 1, max 86400
   *
   * Pipeline (4 args): Internal check for key/workspace rate limits
   * @param redis - A Redis client, cluster, or pipeline.
   * @param redis_key - The Redis key under which the rate limit data is stored.
   * @param scope - The scope of the check (e.g., "key" or "workspace").
   * @param rate_limit - The rate limit configuration.
   */
  check_limit(
    identifier: string,
    limit: number,
    duration: number,
  ): Promise<Result<CheckLimitResult>>;

  /**
   * Internal: Checks a single rate limit against a Redis key for pipeline operations.
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
   */
  check_limit_internal: CheckLimit;

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

const limits = (redis: Redis | Cluster, ports: RateLimitEnginePorts) => {
  redis.defineCommand("check_limit", {
    numberOfKeys: 1,
    lua: rate_limit_script,
  });

  const rate_limit_engine = new RateLimitEngine(ports);

  const get_usage = async (scope: string, key: string, name: string) => {
    const redis_key = `${scope}_rate_limit:${key}:${name}`;
    const usage = await redis.zcard(redis_key);
    return usage;
  };

  const check_limit: Limits["check_limit"] = async (
    identifier,
    limit,
    duration,
  ): Promise<Result<CheckLimitResult>> => {
    // Parse and validate inputs at boundary - Parse Don't Validate pattern
    const parse_result = check_limit_schema.safeParse({ identifier, limit, duration });
    if (!parse_result.success) {
      const error_messages = parse_result.error.issues
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("; ");
      return to_result({ error: Error(`INVALID_CHECK_LIMIT: ${error_messages}`) });
    }

    const { identifier: valid_identifier, limit: valid_limit, duration: valid_duration } =
      parse_result.data;

    // Convert duration from seconds to milliseconds for Lua script
    const duration_ms = valid_duration * 1000;

    // Build Redis key with hardcoded prefix
    const redis_key = `ratelimit:${valid_identifier}`;

    // Call the existing Lua script
    const now = Date.now();
    // @ts-expect-error - Lua command added via defineCommand
    const result = await redis.check_limit(
      redis_key,
      valid_limit.toString(),
      duration_ms.toString(),
      "1", // cost
      now,
      "global",
    );

    // Return standardized response - Atomic Predictability
    return to_result({
      data: {
        allowed: result[0] === 1,
        remaining: result[1],
        reset: result[2],
      },
    });
  };

  return {
    get_usage,
    check_limit,
    check_limit_internal,
    normalize_limit_check,
    check_limits: async (
      hash: string,
      limits: RateLimit[],
    ): Promise<Result<RateLimitWithCheck[]>> => {
      const validated_limits: RateLimit[] = [];
      for (const limit of limits) {
        const result = rate_limit_schema.safeParse(limit);
        if (!result.success) {
          return to_result({
            error: Error(`${ERR_RATE_LIMIT_INVALID}: ${result.error.message}`),
          });
        }
        validated_limits.push(result.data);
      }

      const key = await ports.get_key(hash);

      if (key === null) {
        return to_result({ error: Error(ERR_KEY_NOT_FOUND) });
      }

      const pipeline = redis.pipeline();
      const { key_limits_to_check, workspace_limits_to_check } =
        await rate_limit_engine.get_limits_to_check(key, validated_limits);

      key_limits_to_check.forEach((rate_limit) => {
        const redis_key = `key_rate_limit:${key.id}:${rate_limit.name}`;
        const scope = "key";
        check_limit_internal(pipeline, redis_key, scope, rate_limit);
      });

      workspace_limits_to_check.forEach((rate_limit) => {
        const redis_key = `workspace_rate_limit:${key.owner}:${rate_limit.name}`;
        const scope = "workspace";
        check_limit_internal(pipeline, redis_key, scope, rate_limit);
      });

      type PipelineResult = [Error | null, RedisCheck];
      const results: [Error | null, RedisCheck][] =
        ((await pipeline.exec()) as PipelineResult[]) ?? [];

      const combined_limits = key_limits_to_check.concat(
        workspace_limits_to_check,
      );

      const key_results = results.map(([err, res], idx) => {
        if (err) {
          const [, , reset, scope] = res;
          return {
            exceeded: true,
            name: combined_limits[idx].name,
            limit: combined_limits[idx].limit,
            duration: combined_limits[idx].duration,
            cost: combined_limits[idx].cost,
            reset: Math.max(0, reset),
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
