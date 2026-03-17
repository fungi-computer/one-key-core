import { z } from 'zod';
export declare const rate_limit_schema: z.ZodObject<{
    name: z.ZodString;
    limit: z.ZodNumber;
    cost: z.ZodNumber;
    autoVerify: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    duration: z.ZodNumber;
}, z.core.$strip>;
export declare const key_schema: z.ZodObject<{
    id: z.ZodString;
    hash: z.ZodString;
    owner: z.ZodString;
    name: z.ZodString;
    createdAt: z.ZodNumber;
    expires: z.ZodOptional<z.ZodNumber>;
    meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    rateLimits: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        limit: z.ZodNumber;
        cost: z.ZodNumber;
        autoVerify: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        duration: z.ZodNumber;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const workspace_schema: z.ZodObject<{
    owner: z.ZodString;
    rateLimits: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        limit: z.ZodNumber;
        cost: z.ZodNumber;
        autoVerify: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        duration: z.ZodNumber;
    }, z.core.$strip>>>;
    meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, z.core.$strip>;
export declare const create_key_request: z.ZodObject<{
    name: z.ZodString;
    owner: z.ZodString;
    expires: z.ZodOptional<z.ZodNumber>;
    meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    rateLimits: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        limit: z.ZodNumber;
        cost: z.ZodNumber;
        autoVerify: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        duration: z.ZodNumber;
    }, z.core.$strip>>>;
    bytes: z.ZodOptional<z.ZodNumber>;
    prefix: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const create_key_response: z.ZodObject<{
    name: z.ZodString;
    id: z.ZodString;
    owner: z.ZodString;
    createdAt: z.ZodNumber;
    expires: z.ZodOptional<z.ZodNumber>;
    meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    rateLimits: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        limit: z.ZodNumber;
        cost: z.ZodNumber;
        autoVerify: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        duration: z.ZodNumber;
    }, z.core.$strip>>>;
    key: z.ZodString;
}, z.core.$strip>;
export declare const verify_key_schema: z.ZodObject<{
    key: z.ZodString;
    rateLimits: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        limit: z.ZodNumber;
        cost: z.ZodNumber;
        autoVerify: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        duration: z.ZodNumber;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const verify_response_schema: z.ZodObject<{
    valid: z.ZodBoolean;
    key: z.ZodObject<{
        name: z.ZodString;
        id: z.ZodString;
        owner: z.ZodString;
        createdAt: z.ZodNumber;
        expires: z.ZodOptional<z.ZodNumber>;
        meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        rateLimits: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            limit: z.ZodNumber;
            cost: z.ZodNumber;
            autoVerify: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
            duration: z.ZodNumber;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
    error: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type RateLimit = z.infer<typeof rate_limit_schema>;
export type Workspace = z.infer<typeof workspace_schema>;
/**
 * Represents a stored API key with its metadata and rate limits.
 */
export interface StoredKey extends z.infer<typeof key_schema> {
}
export interface CreateKeyRequest extends z.infer<typeof create_key_request> {
}
export interface CreateKeyResponse extends z.infer<typeof create_key_response> {
}
export interface VerifyKeyRequest extends z.infer<typeof verify_key_schema> {
}
export interface VerifyKeyResponse extends z.infer<typeof verify_response_schema> {
}
