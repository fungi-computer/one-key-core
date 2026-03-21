import type { StoredKey } from "../types/keys.js";

export const is_expired = (key: StoredKey): boolean => {
  if (key.expires === undefined) return false;
  return Date.now() > key.expires;
};
