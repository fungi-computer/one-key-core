[**one-key-core**](../../../README.md)

***

[one-key-core](../../../README.md) / [types/keys](../README.md) / verify\_response\_schema

# Variable: verify\_response\_schema

> `const` **verify\_response\_schema**: `ZodObject`\<\{ `valid`: `ZodBoolean`; `key`: `ZodObject`\<\{ `id`: `ZodString`; `owner`: `ZodString`; `name`: `ZodString`; `createdAt`: `ZodNumber`; `expires`: `ZodOptional`\<`ZodNumber`\>; `meta`: `ZodOptional`\<`ZodRecord`\<`ZodString`, `ZodString`\>\>; `rateLimits`: `ZodOptional`\<`ZodArray`\<`ZodObject`\<\{ `name`: `ZodString`; `limit`: `ZodNumber`; `cost`: `ZodNumber`; `autoVerify`: `ZodOptional`\<`ZodDefault`\<`ZodBoolean`\>\>; `duration`: `ZodNumber`; \}, `$strip`\>\>\>; \}, `$strip`\>; `error`: `ZodOptional`\<`ZodString`\>; \}, `$strip`\>

Defined in: [types/keys.ts:47](https://github.com/fungi-computer/Botanical/blob/29fd21f91ab1227a1a521ff1696b0f87f8fb09a0/packages/one-key-core/src/types/keys.ts#L47)
