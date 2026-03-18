import type { Result } from "./types/result";
import { ERR_INTERNAL_ERROR } from "./errors";

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
