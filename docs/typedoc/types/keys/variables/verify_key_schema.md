[**one-key-core**](../../../README.md)

***

[one-key-core](../../../README.md) / [types/keys](../README.md) / verify\_key\_schema

# Variable: verify\_key\_schema

> `const` **verify\_key\_schema**: `ZodObject`\<\{ `key`: `ZodString`; `rateLimits`: `ZodOptional`\<`ZodArray`\<`ZodObject`\<\{ `name`: `ZodString`; `limit`: `ZodNumber`; `cost`: `ZodNumber`; `autoVerify`: `ZodOptional`\<`ZodDefault`\<`ZodBoolean`\>\>; `duration`: `ZodNumber`; \}, `$strip`\>\>\>; \}, `$strip`\>

Defined in: [types/keys.ts:42](https://github.com/fungi-computer/Botanical/blob/29fd21f91ab1227a1a521ff1696b0f87f8fb09a0/packages/one-key-core/src/types/keys.ts#L42)
