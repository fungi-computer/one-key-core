[**one-key-core**](../../../README.md)

***

[one-key-core](../../../README.md) / [types/keys](../README.md) / verify\_response\_schema

# Variable: verify\_response\_schema

> `const` **verify\_response\_schema**: `ZodObject`\<\{ `valid`: `ZodBoolean`; `key`: `ZodObject`\<\{ `id`: `ZodString`; `owner`: `ZodString`; `name`: `ZodString`; `createdAt`: `ZodNumber`; `expires`: `ZodOptional`\<`ZodNumber`\>; `meta`: `ZodOptional`\<`ZodRecord`\<`ZodString`, `ZodString`\>\>; `rateLimits`: `ZodOptional`\<`ZodArray`\<`ZodObject`\<\{ `name`: `ZodString`; `limit`: `ZodNumber`; `cost`: `ZodNumber`; `autoVerify`: `ZodOptional`\<`ZodDefault`\<`ZodBoolean`\>\>; `duration`: `ZodNumber`; \}, `$strip`\>\>\>; \}, `$strip`\>; `error`: `ZodOptional`\<`ZodString`\>; \}, `$strip`\>

Defined in: [types/keys.ts:47](https://github.com/fungi-computer/Botanical/blob/27f75e482c4ef47a93514c70c5a99ee72ad68164/packages/one-key-core/src/types/keys.ts#L47)
