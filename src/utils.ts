import type { Result } from "./types/result";

export const to_result = <T, E = Error>(maybe: {
  error?: E;
  data?: T;
}): Result<T, E> => {
  const { error, data } = maybe;
  if (error) {
    return { success: false, error };
  }
  return { success: true, data: data! };
};
