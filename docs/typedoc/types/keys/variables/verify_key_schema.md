[**one-key-core**](../../../README.md)

***

[one-key-core](../../../README.md) / [types/keys](../README.md) / verify\_key\_schema

# Variable: verify\_key\_schema

> `const` **verify\_key\_schema**: `ZodObject`\<\{ `key`: `ZodString`; `rateLimits`: `ZodOptional`\<`ZodArray`\<`ZodObject`\<\{ `name`: `ZodString`; `limit`: `ZodNumber`; `cost`: `ZodNumber`; `autoVerify`: `ZodOptional`\<`ZodDefault`\<`ZodBoolean`\>\>; `duration`: `ZodNumber`; \}, `$strip`\>\>\>; \}, `$strip`\>

Defined in: [types/keys.ts:42](https://github.com/fungi-computer/Botanical/blob/27f75e482c4ef47a93514c70c5a99ee72ad68164/packages/one-key-core/src/types/keys.ts#L42)
