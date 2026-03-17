import { isEmpty, values } from "ramda";
import { nanoid } from "nanoid";
import { workspace_schema } from "../types/keys";

import type { Cluster, Redis } from "ioredis";
import type { Workspace } from "../types/keys";
import { to_result } from "../utils";
import type { Result } from "../types/result";

/**
 * Interface for workspace management operations.
 * Workspaces represent a collection of API keys owned by a single entity,
 * with optional rate limits that apply to all keys within the workspace.
 */
export interface WorkspacesStorage {
  /**
   * Creates a new workspace.
   *
   * @param workspace - The workspace data. The `id` field will be auto‑generated.
   * @returns A `Result` containing the created workspace on success, or an error if a workspace already exists for the given owner.
   *
   * @example
   * const result = await workspaces.create({
   *   owner: "user_123",
   *   name: "My Workspace",
   *   rateLimits: [{ name: "api_calls", limit: 1000, duration: 3600 }]
   * });
   * if (result.success) {
   *   console.log("Workspace created:", result.data);
   * }
   */
  create(workspace: Workspace): Promise<Result<Workspace>>;

  /**
   * Retrieves a workspace by its owner identifier.
   *
   * @param owner - The owner identifier (typically a user ID or organization ID).
   * @returns The workspace object if found, otherwise `null`.
   *
   * @example
   * const workspace = await workspaces.get("user_123");
   * if (workspace) {
   *   console.log(workspace.rateLimits);
   * }
   */
  get(owner: string): Promise<Workspace | null>;

  /**
   * Updates an existing workspace.
   *
   * @param owner - The owner identifier of the workspace to update.
   * @param updates - Partial fields to update. The `owner` and `id` fields cannot be changed.
   * @returns A `Result` containing the updated workspace, or an error if the workspace does not exist.
   *
   * @example
   * const result = await workspaces.update("user_123", {
   *   name: "New Workspace Name",
   *   rateLimits: [{ name: "api_calls", limit: 2000, duration: 3600 }]
   * });
   */
  update(
    owner: string,
    updates: Partial<Omit<Workspace, "owner" | "id">>,
  ): Promise<Result<Workspace>>;

  /**
   * Deletes a workspace by its owner identifier.
   *
   * @param owner - The owner identifier of the workspace to delete.
   * @returns A `Result` with `"success"` on successful deletion, or an error if the workspace does not exist.
   *
   * @example
   * const result = await workspaces.delete("user_123");
   * if (result.success) {
   *   console.log("Workspace deleted");
   * }
   */
  delete(owner: string): Promise<Result<"success">>;

  /**
   * Lists all workspaces with cursor‑based pagination.
   *
   * @param cursor - The scan cursor (default: 0). Use the returned `next_cursor` for subsequent pages.
   * @param count - Number of workspaces to fetch per page (default: 10).
   * @returns An object containing an array of workspaces and the next cursor for pagination.
   *
   * @example
   * const page1 = await workspaces.list(0, 10);
   * console.log(page1.workspaces);
   * if (page1.next_cursor !== "0") {
   *   const page2 = await workspaces.list(page1.next_cursor, 10);
   * }
   */
  list(
    cursor?: number,
    count?: number,
  ): Promise<{ workspaces: Workspace[]; next_cursor: string }>;
}

const workspaces = (redis: Redis | Cluster): WorkspacesStorage => {
  const get = async (owner: string): Promise<Workspace | null> => {
    const response = await redis.hgetall(`workspaces:${owner}`).then((key) => {
      if (values(key).length === 0) return {};
      return {
        ...key,
        rateLimits: key.rateLimits ? JSON.parse(key.rateLimits) : [],
      };
    });

    if (isEmpty(response)) return null;
    return response as Workspace;
  };

  const create = async (workspace: Workspace): Promise<Result<Workspace>> => {
    const safe_workspace = workspace_schema.parse({
      ...workspace,
      id: nanoid(16),
    });

    const exists = await redis.exists(`workspaces:${safe_workspace.owner}`);
    if (exists) {
      return to_result({
        error: Error("Workspace already exists for this owner"),
      });
    }

    await redis
      .multi()
      .hset(`workspaces:${safe_workspace.owner}`, {
        ...safe_workspace,
        rateLimits: JSON.stringify(safe_workspace.rateLimits ?? []),
      })
      .sadd("workspaces:all", safe_workspace.owner)
      .exec();

    const data = await get(safe_workspace.owner);
    if (!data) return to_result({ error: Error("Could not create workspace") });

    return to_result({ data: data });
  };

  const update = async (
    owner: string,
    updates: Partial<Omit<Workspace, "owner" | "id">>,
  ): Promise<Result<Workspace>> => {
    const safe_updates = workspace_schema.partial().parse(updates);

    const exists = await redis.exists(`workspaces:${owner}`);
    if (!exists) {
      return to_result({ error: Error("Workspace not found") });
    }

    if (Object.keys(safe_updates).length > 0) {
      await redis.hset(`workspaces:${owner}`, {
        ...safe_updates,
        rateLimits: JSON.stringify(safe_updates.rateLimits),
      });
    }

    const data = await get(owner);
    return to_result({ data: data! });
  };

  const delete_workspace = async (
    owner: string,
  ): Promise<Result<"success">> => {
    const workspace = await get(owner);
    if (workspace === null)
      return to_result({ error: Error("Workspace does not exist") });

    await redis
      .multi()
      .del(`workspaces:${owner}`)
      .srem("workspaces:all", owner)
      .exec();

    return to_result({ data: "success" });
  };

  const list = async (cursor: number, count: number) => {
    const [nextCursor, owners] = await redis.sscan(
      "workspaces:all",
      cursor,
      "COUNT",
      count,
    );

    if (owners.length === 0) return { workspaces: [], next_cursor: nextCursor };
    const pipeline = redis.pipeline();
    owners.forEach((owner) => pipeline.hgetall(`workspaces:${owner}`));
    const results = ((await pipeline.exec()) as [Error, Workspace][]) ?? [];

    const workspaces = results
      .map(([, data]) => data)
      .filter((workspace) => !isEmpty(workspace))
      .map((workspace: Workspace) => ({
        ...workspace,
        rateLimits: JSON.parse(
          (workspace.rateLimits as unknown as string) ?? "",
        ),
      }));

    return { workspaces: workspaces, next_cursor: nextCursor };
  };

  return {
    create,
    get,
    update,
    delete: delete_workspace,
    list,
  };
};

export default workspaces;
