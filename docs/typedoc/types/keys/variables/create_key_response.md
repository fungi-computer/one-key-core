[**one-key-core**](../../../README.md)

***

[one-key-core](../../../modules.md) / [types/keys](../README.md) / create\_key\_response

# Variable: create\_key\_response

> `const` **create\_key\_response**: `ZodObject`\<\{ `id`: `ZodString`; `owner`: `ZodString`; `name`: `ZodString`; `createdAt`: `ZodNumber`; `expires`: `ZodOptional`\<`ZodNumber`\>; `meta`: `ZodOptional`\<`ZodRecord`\<`ZodString`, `ZodString`\>\>; `rateLimits`: `ZodOptional`\<`ZodArray`\<`ZodObject`\<\{ `name`: `ZodString`; `limit`: `ZodNumber`; `cost`: `ZodNumber`; `autoVerify`: `ZodOptional`\<`ZodDefault`\<`ZodBoolean`\>\>; `duration`: `ZodNumber`; \}, `$strip`\>\>\>; `key`: `ZodString`; \}, `$strip`\>

Defined in: [types/keys.ts:37](https://github.com/fungi-computer/Botanical/blob/eb392c5b2c3018f8ad9b53277ef1caedba399ca4/packages/one-key-core/src/types/keys.ts#L37)
