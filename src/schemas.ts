import { z } from "zod";

export const rate_limit_schema = z.object({
  name: z.string().min(3),
  limit: z.number(),
  cost: z.number().default(1).optional(),
  autoVerify: z.boolean().default(false).optional(),
  duration: z.number().default(60).optional(),
});

export type RateLimit = z.infer<typeof rate_limit_schema>;

export const rate_limit_schema_partial = rate_limit_schema.partial();

export const create_key_schema = z.object({
  owner: z.string().min(1),
  name: z.string().min(1),
  expires: z.number().optional(),
  meta: z.record(z.string(), z.string()).optional(),
  rateLimits: z.array(rate_limit_schema).optional(),
});

export const update_key_schema = z.object({
  name: z.string().min(1).optional(),
  expires: z.number().optional(),
  meta: z.record(z.string(), z.string()).optional(),
  rateLimits: z.array(rate_limit_schema).optional(),
});
