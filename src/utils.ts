import type { Result } from "./types/result";
import { ERR_INTERNAL_ERROR, ERR_REDIS } from "./errors";

export const to_result = <T, E = Error>(maybe: {
  error?: E;
  data?: T;
}): Result<T, E> => {
  const { error, data } = maybe;
  if (error) {
    return { success: false, error };
  }
  if (data === undefined) {
    return { success: false, error: Error(ERR_INTERNAL_ERROR) as E };
  }
  return { success: true, data };
};

/**
 * Wraps a Redis error with helpful context for consumers.
 * Masks internal Redis implementation details while providing actionable information.
 */
export const wrap_redis_error = (
  operation: string,
  _originalError: Error,
): Error => {
  const message = `${ERR_REDIS}: ${operation} failed`;
  return new Error(message);
};
