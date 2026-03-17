[**one-key-core**](../../../README.md)

***

[one-key-core](../../../modules.md) / [types/keys](../README.md) / verify\_key\_schema

# Variable: verify\_key\_schema

> `const` **verify\_key\_schema**: `ZodObject`\<\{ `key`: `ZodString`; `rateLimits`: `ZodOptional`\<`ZodArray`\<`ZodObject`\<\{ `name`: `ZodString`; `limit`: `ZodNumber`; `cost`: `ZodNumber`; `autoVerify`: `ZodOptional`\<`ZodDefault`\<`ZodBoolean`\>\>; `duration`: `ZodNumber`; \}, `$strip`\>\>\>; \}, `$strip`\>

Defined in: [types/keys.ts:43](https://github.com/fungi-computer/Botanical/blob/eb392c5b2c3018f8ad9b53277ef1caedba399ca4/packages/one-key-core/src/types/keys.ts#L43)
