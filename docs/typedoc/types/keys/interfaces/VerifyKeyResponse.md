[**one-key-core**](../../../README.md)

***

[one-key-core](../../../README.md) / [types/keys](../README.md) / VerifyKeyResponse

# Interface: VerifyKeyResponse

Defined in: [types/keys.ts:64](https://github.com/fungi-computer/Botanical/blob/29fd21f91ab1227a1a521ff1696b0f87f8fb09a0/packages/one-key-core/src/types/keys.ts#L64)

## Extends

- `output`\<*typeof* [`verify_response_schema`](../variables/verify_response_schema.md)\>

## Properties

| Property | Type | Inherited from | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="property-valid"></a> `valid` | `boolean` | `z.infer.valid` | [types/keys.ts:48](https://github.com/fungi-computer/Botanical/blob/29fd21f91ab1227a1a521ff1696b0f87f8fb09a0/packages/one-key-core/src/types/keys.ts#L48) |
| <a id="property-key"></a> `key` | `object` | `z.infer.key` | [types/keys.ts:49](https://github.com/fungi-computer/Botanical/blob/29fd21f91ab1227a1a521ff1696b0f87f8fb09a0/packages/one-key-core/src/types/keys.ts#L49) |
| `key.id` | `string` | - | [types/keys.ts:12](https://github.com/fungi-computer/Botanical/blob/29fd21f91ab1227a1a521ff1696b0f87f8fb09a0/packages/one-key-core/src/types/keys.ts#L12) |
| `key.owner` | `string` | - | [types/keys.ts:14](https://github.com/fungi-computer/Botanical/blob/29fd21f91ab1227a1a521ff1696b0f87f8fb09a0/packages/one-key-core/src/types/keys.ts#L14) |
| `key.name` | `string` | - | [types/keys.ts:15](https://github.com/fungi-computer/Botanical/blob/29fd21f91ab1227a1a521ff1696b0f87f8fb09a0/packages/one-key-core/src/types/keys.ts#L15) |
| `key.createdAt` | `number` | - | [types/keys.ts:16](https://github.com/fungi-computer/Botanical/blob/29fd21f91ab1227a1a521ff1696b0f87f8fb09a0/packages/one-key-core/src/types/keys.ts#L16) |
| `key.expires?` | `number` | - | [types/keys.ts:17](https://github.com/fungi-computer/Botanical/blob/29fd21f91ab1227a1a521ff1696b0f87f8fb09a0/packages/one-key-core/src/types/keys.ts#L17) |
| `key.meta?` | `Record`\<`string`, `string`\> | - | [types/keys.ts:18](https://github.com/fungi-computer/Botanical/blob/29fd21f91ab1227a1a521ff1696b0f87f8fb09a0/packages/one-key-core/src/types/keys.ts#L18) |
| `key.rateLimits?` | `object`[] | - | [types/keys.ts:19](https://github.com/fungi-computer/Botanical/blob/29fd21f91ab1227a1a521ff1696b0f87f8fb09a0/packages/one-key-core/src/types/keys.ts#L19) |
| <a id="property-error"></a> `error?` | `string` | `z.infer.error` | [types/keys.ts:50](https://github.com/fungi-computer/Botanical/blob/29fd21f91ab1227a1a521ff1696b0f87f8fb09a0/packages/one-key-core/src/types/keys.ts#L50) |
