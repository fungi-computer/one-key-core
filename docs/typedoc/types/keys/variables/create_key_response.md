[**one-key-core**](../../../README.md)

***

[one-key-core](../../../README.md) / [types/keys](../README.md) / create\_key\_response

# Variable: create\_key\_response

> `const` **create\_key\_response**: `ZodObject`\<\{ `id`: `ZodString`; `owner`: `ZodString`; `name`: `ZodString`; `createdAt`: `ZodNumber`; `expires`: `ZodOptional`\<`ZodNumber`\>; `meta`: `ZodOptional`\<`ZodRecord`\<`ZodString`, `ZodString`\>\>; `rateLimits`: `ZodOptional`\<`ZodArray`\<`ZodObject`\<\{ `name`: `ZodString`; `limit`: `ZodNumber`; `cost`: `ZodNumber`; `autoVerify`: `ZodOptional`\<`ZodDefault`\<`ZodBoolean`\>\>; `duration`: `ZodNumber`; \}, `$strip`\>\>\>; `key`: `ZodString`; \}, `$strip`\>

Defined in: [types/keys.ts:36](https://github.com/fungi-computer/Botanical/blob/29fd21f91ab1227a1a521ff1696b0f87f8fb09a0/packages/one-key-core/src/types/keys.ts#L36)
