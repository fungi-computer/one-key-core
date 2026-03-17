[**one-key-core**](../../../README.md)

***

[one-key-core](../../../modules.md) / [client/keys](../README.md) / KeysClient

# Interface: KeysClient

Defined in: [client/keys.ts:34](https://github.com/fungi-computer/Botanical/blob/eb392c5b2c3018f8ad9b53277ef1caedba399ca4/packages/one-key-core/src/client/keys.ts#L34)

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="property-get"></a> `get` | (...`args`) => `Promise`\<`Omit`\<[`StoredKey`](../../../types/keys/interfaces/StoredKey.md), `"hash"`\> \| `null`\> | Retrieves a key by its plaintext value (hashes it internally). | [client/keys.ts:59](https://github.com/fungi-computer/Botanical/blob/eb392c5b2c3018f8ad9b53277ef1caedba399ca4/packages/one-key-core/src/client/keys.ts#L59) |
| <a id="property-update"></a> `update` | (`hash`, `updates`) => `Promise`\<`Result`\<[`StoredKey`](../../../types/keys/interfaces/StoredKey.md)\>\> | Updates an existing key by its plaintext value. **Param** The plaintext key to update. **Param** Fields to update (cannot change `hash` or `owner`). | [client/keys.ts:69](https://github.com/fungi-computer/Botanical/blob/eb392c5b2c3018f8ad9b53277ef1caedba399ca4/packages/one-key-core/src/client/keys.ts#L69) |
| <a id="property-list_by_owner"></a> `list_by_owner` | (`owner`, `cursor?`, `count?`) => `Promise`\<\{ `keys`: [`StoredKey`](../../../types/keys/interfaces/StoredKey.md)[]; `next_cursor`: `string`; \}\> | Lists keys belonging to a specific owner with cursor‑based pagination. **Param** Owner identifier. **Param** Scan cursor (default "0"). **Param** Number of keys per page (default 10). | [client/keys.ts:77](https://github.com/fungi-computer/Botanical/blob/eb392c5b2c3018f8ad9b53277ef1caedba399ca4/packages/one-key-core/src/client/keys.ts#L77) |
| <a id="property-delete"></a> `delete` | (`hash`) => `Promise`\<`Result`\<`boolean`\>\> | Deletes a key by its plaintext value. **Param** The plaintext key to delete. | [client/keys.ts:84](https://github.com/fungi-computer/Botanical/blob/eb392c5b2c3018f8ad9b53277ef1caedba399ca4/packages/one-key-core/src/client/keys.ts#L84) |

## Methods

### create\_key()

> **create\_key**(`request`, `options?`): `Promise`\<`Result`\<[`StoredKey`](../../../types/keys/interfaces/StoredKey.md) & `object`\>\>

Defined in: [client/keys.ts:41](https://github.com/fungi-computer/Botanical/blob/eb392c5b2c3018f8ad9b53277ef1caedba399ca4/packages/one-key-core/src/client/keys.ts#L41)

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

Defined in: [client/keys.ts:52](https://github.com/fungi-computer/Botanical/blob/eb392c5b2c3018f8ad9b53277ef1caedba399ca4/packages/one-key-core/src/client/keys.ts#L52)

Verifies an API key is valid (checks and increments usage)

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `string` | The plaintext API key to verify. |
| `limits` | `object`[] | Rate limits to check. |

#### Returns

`Promise`\<`Result`\<`KeyVerification`\>\>

Result indicating whether the key is allowed or an error.
