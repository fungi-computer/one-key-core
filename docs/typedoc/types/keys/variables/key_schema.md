[**one-key-core**](../../../README.md)

***

[one-key-core](../../../README.md) / [types/keys](../README.md) / key\_schema

# Variable: key\_schema

> `const` **key\_schema**: `ZodObject`\<\{ `id`: `ZodString`; `hash`: `ZodString`; `owner`: `ZodString`; `name`: `ZodString`; `createdAt`: `ZodNumber`; `expires`: `ZodOptional`\<`ZodNumber`\>; `meta`: `ZodOptional`\<`ZodRecord`\<`ZodString`, `ZodString`\>\>; `rateLimits`: `ZodOptional`\<`ZodArray`\<`ZodObject`\<\{ `name`: `ZodString`; `limit`: `ZodNumber`; `cost`: `ZodNumber`; `autoVerify`: `ZodOptional`\<`ZodDefault`\<`ZodBoolean`\>\>; `duration`: `ZodNumber`; \}, `$strip`\>\>\>; \}, `$strip`\>

Defined in: [types/keys.ts:11](https://github.com/fungi-computer/Botanical/blob/29fd21f91ab1227a1a521ff1696b0f87f8fb09a0/packages/one-key-core/src/types/keys.ts#L11)
