[**one-key-core**](../../../README.md)

***

[one-key-core](../../../README.md) / [client/keys](../README.md) / KeysClient

# Interface: KeysClient

Defined in: [client/keys.ts:34](https://github.com/fungi-computer/Botanical/blob/29fd21f91ab1227a1a521ff1696b0f87f8fb09a0/packages/one-key-core/src/client/keys.ts#L34)

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="property-get"></a> `get` | (...`args`) => `Promise`\<`Omit`\<[`StoredKey`](../../../types/keys/interfaces/StoredKey.md), `"hash"`\> \| `null`\> | Retrieves a key by its plaintext value (hashes it internally). | [client/keys.ts:58](https://github.com/fungi-computer/Botanical/blob/29fd21f91ab1227a1a521ff1696b0f87f8fb09a0/packages/one-key-core/src/client/keys.ts#L58) |
| <a id="property-update"></a> `update` | (`hash`, `updates`) => `Promise`\<`Result`\<[`StoredKey`](../../../types/keys/interfaces/StoredKey.md)\>\> | Updates an existing key (by its hash). **Param** The key of the key to update. **Param** Fields to update (cannot change `hash` or `owner`). | [client/keys.ts:68](https://github.com/fungi-computer/Botanical/blob/29fd21f91ab1227a1a521ff1696b0f87f8fb09a0/packages/one-key-core/src/client/keys.ts#L68) |
| <a id="property-list_by_owner"></a> `list_by_owner` | (`owner`, `cursor?`, `count?`) => `Promise`\<\{ `keys`: [`StoredKey`](../../../types/keys/interfaces/StoredKey.md)[]; `next_cursor`: `string`; \}\> | Lists keys belonging to a specific owner with cursor‑based pagination. **Param** Owner identifier. **Param** Scan cursor (default "0"). **Param** Number of keys per page (default 10). | [client/keys.ts:76](https://github.com/fungi-computer/Botanical/blob/29fd21f91ab1227a1a521ff1696b0f87f8fb09a0/packages/one-key-core/src/client/keys.ts#L76) |
| <a id="property-delete"></a> `delete` | (`hash`) => `Promise`\<`any`\> | Deletes a key by its KEY. **Param** The key of the key to delete. | [client/keys.ts:82](https://github.com/fungi-computer/Botanical/blob/29fd21f91ab1227a1a521ff1696b0f87f8fb09a0/packages/one-key-core/src/client/keys.ts#L82) |

## Methods

### create\_key()

> **create\_key**(`request`, `options?`): `Promise`\<`Result`\<[`StoredKey`](../../../types/keys/interfaces/StoredKey.md) & `object`\>\>

Defined in: [client/keys.ts:41](https://github.com/fungi-computer/Botanical/blob/29fd21f91ab1227a1a521ff1696b0f87f8fb09a0/packages/one-key-core/src/client/keys.ts#L41)

Creates a new API key.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `request` | [`CreateKeyRequest`](../../../types/keys/interfaces/CreateKeyRequest.md) | The key creation request (owner, rate limits, etc.) |
| `options?` | \{ `bytes?`: `number`; `prefix?`: `string`; \} | Optional generation parameters (byte length, prefix) |
| `options.bytes?` | `number` | - |
| `options.prefix?` | `string` | - |

#### Returns

`Promise`\<`Result`\<[`StoredKey`](../../../types/keys/interfaces/StoredKey.md) & `object`\>\>

The created key (including the plaintext key) or an error.

***

### verify()

> **verify**(`key`, `limits`): `Promise`\<`Result`\<`KeyVerification`\>\>

Defined in: [client/keys.ts:51](https://github.com/fungi-computer/Botanical/blob/29fd21f91ab1227a1a521ff1696b0f87f8fb09a0/packages/one-key-core/src/client/keys.ts#L51)

Verifys an API key is valid (checks and increments usage)

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `string` | - |
| `limits` | `object`[] | Rate limits to check. |

#### Returns

`Promise`\<`Result`\<`KeyVerification`\>\>

Result indicating whether the key is allowed or an error.
