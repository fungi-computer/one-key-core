import { z } from "zod";
import { rate_limit_schema } from "../schemas";

export const key_schema = z.object({
  id: z.string().regex(/^[a-z0-9_-]{16}$/i),
  hash: z.string(),
  owner: z.string(),
  name: z.string(),
  createdAt: z.number(),
  expires: z.number().optional(),
  meta: z.record(z.string(), z.string()).optional(),
  rateLimits: z.array(rate_limit_schema).optional(),
});

export const workspace_schema = z.object({
  owner: z.string(),
  name: z.string(),
  rateLimits: z.array(rate_limit_schema).optional(),
  meta: z.record(z.string(), z.string()).optional(),
});

export const create_key_request = key_schema
  .omit({
    hash: true,
    createdAt: true,
    id: true,
  })
  .extend({ bytes: z.number().optional(), prefix: z.string().optional() });

export const create_key_response = key_schema
  .omit({
    hash: true,
  })
  .extend({ key: z.string() });

export const verify_key_schema = z.object({
  key: z.string().min(1).describe("API key to verify"),
  rateLimits: z.array(rate_limit_schema).optional(),
});

export const verify_response_schema = z.object({
  valid: z.boolean(),
  key: key_schema.omit({ hash: true }),
  error: z.string().optional(),
});

export type Workspace = z.infer<typeof workspace_schema>;
/**
 * Represents a stored API key with its metadata and rate limits.
 */
export interface StoredKey extends z.infer<typeof key_schema> {}
export interface CreateKeyRequest extends z.infer<typeof create_key_request> {}
export interface CreateKeyResponse extends z.infer<
  typeof create_key_response
> {}
export interface VerifyKeyRequest extends z.infer<typeof verify_key_schema> {}
export interface VerifyKeyResponse extends z.infer<
  typeof verify_response_schema
> {}

export const rotate_key_request = z.object({
  grace_period: z.number().optional().describe("Grace period in seconds"),
});

export const rotate_key_response = z.object({
  key: z.string().describe("New key value"),
  expires_at: z.number().describe("Unix timestamp when previous key expires"),
});

export type RotateKeyRequest = z.infer<typeof rotate_key_request>;
export type RotateKeyResponse = z.infer<typeof rotate_key_response>;
