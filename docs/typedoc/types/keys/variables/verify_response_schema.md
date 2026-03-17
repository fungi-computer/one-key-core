[**one-key-core**](../../../README.md)

***

[one-key-core](../../../modules.md) / [types/keys](../README.md) / verify\_response\_schema

# Variable: verify\_response\_schema

> `const` **verify\_response\_schema**: `ZodObject`\<\{ `valid`: `ZodBoolean`; `key`: `ZodObject`\<\{ `id`: `ZodString`; `owner`: `ZodString`; `name`: `ZodString`; `createdAt`: `ZodNumber`; `expires`: `ZodOptional`\<`ZodNumber`\>; `meta`: `ZodOptional`\<`ZodRecord`\<`ZodString`, `ZodString`\>\>; `rateLimits`: `ZodOptional`\<`ZodArray`\<`ZodObject`\<\{ `name`: `ZodString`; `limit`: `ZodNumber`; `cost`: `ZodNumber`; `autoVerify`: `ZodOptional`\<`ZodDefault`\<`ZodBoolean`\>\>; `duration`: `ZodNumber`; \}, `$strip`\>\>\>; \}, `$strip`\>; `error`: `ZodOptional`\<`ZodString`\>; \}, `$strip`\>

Defined in: [types/keys.ts:48](https://github.com/fungi-computer/Botanical/blob/eb392c5b2c3018f8ad9b53277ef1caedba399ca4/packages/one-key-core/src/types/keys.ts#L48)
