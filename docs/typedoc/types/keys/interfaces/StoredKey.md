[**one-key-core**](../../../README.md)

***

[one-key-core](../../../modules.md) / [types/keys](../README.md) / StoredKey

# Interface: StoredKey

Defined in: [types/keys.ts:59](https://github.com/fungi-computer/Botanical/blob/eb392c5b2c3018f8ad9b53277ef1caedba399ca4/packages/one-key-core/src/types/keys.ts#L59)

Represents a stored API key with its metadata and rate limits.

## Extends

- `output`\<*typeof* [`key_schema`](../variables/key_schema.md)\>

## Properties

| Property | Type | Inherited from | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="property-id"></a> `id` | `string` | `z.infer.id` | [types/keys.ts:12](https://github.com/fungi-computer/Botanical/blob/eb392c5b2c3018f8ad9b53277ef1caedba399ca4/packages/one-key-core/src/types/keys.ts#L12) |
| <a id="property-hash"></a> `hash` | `string` | `z.infer.hash` | [types/keys.ts:13](https://github.com/fungi-computer/Botanical/blob/eb392c5b2c3018f8ad9b53277ef1caedba399ca4/packages/one-key-core/src/types/keys.ts#L13) |
| <a id="property-owner"></a> `owner` | `string` | `z.infer.owner` | [types/keys.ts:14](https://github.com/fungi-computer/Botanical/blob/eb392c5b2c3018f8ad9b53277ef1caedba399ca4/packages/one-key-core/src/types/keys.ts#L14) |
| <a id="property-name"></a> `name` | `string` | `z.infer.name` | [types/keys.ts:15](https://github.com/fungi-computer/Botanical/blob/eb392c5b2c3018f8ad9b53277ef1caedba399ca4/packages/one-key-core/src/types/keys.ts#L15) |
| <a id="property-createdat"></a> `createdAt` | `number` | `z.infer.createdAt` | [types/keys.ts:16](https://github.com/fungi-computer/Botanical/blob/eb392c5b2c3018f8ad9b53277ef1caedba399ca4/packages/one-key-core/src/types/keys.ts#L16) |
| <a id="property-expires"></a> `expires?` | `number` | `z.infer.expires` | [types/keys.ts:17](https://github.com/fungi-computer/Botanical/blob/eb392c5b2c3018f8ad9b53277ef1caedba399ca4/packages/one-key-core/src/types/keys.ts#L17) |
| <a id="property-meta"></a> `meta?` | `Record`\<`string`, `string`\> | `z.infer.meta` | [types/keys.ts:18](https://github.com/fungi-computer/Botanical/blob/eb392c5b2c3018f8ad9b53277ef1caedba399ca4/packages/one-key-core/src/types/keys.ts#L18) |
| <a id="property-ratelimits"></a> `rateLimits?` | `object`[] | `z.infer.rateLimits` | [types/keys.ts:19](https://github.com/fungi-computer/Botanical/blob/eb392c5b2c3018f8ad9b53277ef1caedba399ca4/packages/one-key-core/src/types/keys.ts#L19) |
