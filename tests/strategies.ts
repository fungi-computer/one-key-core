import type { StoredKey } from "../src/types/keys";
import type { KeyGenerator, KeyHasher, KeyRotationStrategy } from "../src/client/keys";

/**
 * Fake key generator for deterministic tests.
 */
export const fake_key_generator: KeyGenerator = () => ({
  key: "fake_key_123456789012345678901234",
  hash: "fake_hash_12345678901234567890123456789012345678901234567890123456",
});

/**
 * Fake hasher that returns a deterministic hash.
 */
export const fake_hasher: KeyHasher = () => "fake_hash_output";

/**
 * Fake hasher that returns the input unchanged (for testing key matching).
 */
export const noop_hasher: KeyHasher = (key: string) => key;

/**
 * Rotation policy that always allows rotation.
 */
export const allow_all_rotation_policy: KeyRotationStrategy = {
  can_rotate: () => true,
};

/**
 * Rotation policy that always denies rotation.
 */
export const deny_all_rotation_policy: KeyRotationStrategy = {
  can_rotate: () => false,
};

/**
 * Tracks whether after_rotation was called.
 */
export const create_tracking_rotation_policy = (): KeyRotationStrategy & {
  after_rotation_called: boolean;
  after_rotation_calls: StoredKey[];
} => {
  const after_rotation_calls: StoredKey[] = [];
  return {
    can_rotate: () => true,
    after_rotation: (key) => {
      after_rotation_calls.push(key);
    },
    get after_rotation_called() {
      return after_rotation_calls.length > 0;
    },
    after_rotation_calls,
  };
};
