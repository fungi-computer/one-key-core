[**one-key-core**](../../README.md)

***

[one-key-core](../../modules.md) / [main](../README.md) / KeysStorage

# Interface: KeysStorage

Defined in: [storage/keys.ts:9](https://github.com/fungi-computer/Botanical/blob/eb392c5b2c3018f8ad9b53277ef1caedba399ca4/packages/one-key-core/src/storage/keys.ts#L9)

## Methods

### get()

> **get**(`hash`): `Promise`\<[`StoredKey`](../../types/keys/interfaces/StoredKey.md) \| `null`\>

Defined in: [storage/keys.ts:15](https://github.com/fungi-computer/Botanical/blob/eb392c5b2c3018f8ad9b53277ef1caedba399ca4/packages/one-key-core/src/storage/keys.ts#L15)

Retrieves a key by its hash.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `hash` | `string` | The unique hash of the key. |

#### Returns

`Promise`\<[`StoredKey`](../../types/keys/interfaces/StoredKey.md) \| `null`\>

The key object or `null` if not found.

***

### create()

> **create**(`key`): `Promise`\<`Result`\<[`StoredKey`](../../types/keys/interfaces/StoredKey.md)\>\>

Defined in: [storage/keys.ts:22](https://github.com/fungi-computer/Botanical/blob/eb392c5b2c3018f8ad9b53277ef1caedba399ca4/packages/one-key-core/src/storage/keys.ts#L22)

Creates a new key.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `Omit`\<[`StoredKey`](../../types/keys/interfaces/StoredKey.md), `"createdAt"` \| `"id"`\> | Key data (without auto-generated `id` and `createdAt`). |

#### Returns

`Promise`\<`Result`\<[`StoredKey`](../../types/keys/interfaces/StoredKey.md)\>\>

A `Result` containing the created key on success, or an error if the key already exists.

***

### update()

> **update**(`hash`, `updates`): `Promise`\<`Result`\<[`StoredKey`](../../types/keys/interfaces/StoredKey.md)\>\>

Defined in: [storage/keys.ts:30](https://github.com/fungi-computer/Botanical/blob/eb392c5b2c3018f8ad9b53277ef1caedba399ca4/packages/one-key-core/src/storage/keys.ts#L30)

Updates an existing key.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `hash` | `string` | The hash of the key to update. |
| `updates` | `Partial`\<`Omit`\<[`StoredKey`](../../types/keys/interfaces/StoredKey.md), `"hash"` \| `"owner"`\>\> | Partial fields to update (cannot change `hash` or `owner`). |

#### Returns

`Promise`\<`Result`\<[`StoredKey`](../../types/keys/interfaces/StoredKey.md)\>\>

A `Result` containing the updated key, or an error if the key does not exist.

***

### delete()

> **delete**(`hash`): `Promise`\<`Result`\<`boolean`\>\>

Defined in: [storage/keys.ts:40](https://github.com/fungi-computer/Botanical/blob/eb392c5b2c3018f8ad9b53277ef1caedba399ca4/packages/one-key-core/src/storage/keys.ts#L40)

Deletes a key by its hash.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `hash` | `string` | The hash of the key to delete. |

#### Returns

`Promise`\<`Result`\<`boolean`\>\>

A `Result` containing true on success, or an error if the key doesn't exist.

***

### list()

> **list**(`cursor?`, `count?`): `Promise`\<\{ `keys`: [`StoredKey`](../../types/keys/interfaces/StoredKey.md)[]; `next_cursor`: `string`; \}\>

Defined in: [storage/keys.ts:48](https://github.com/fungi-computer/Botanical/blob/eb392c5b2c3018f8ad9b53277ef1caedba399ca4/packages/one-key-core/src/storage/keys.ts#L48)

Lists keys with cursor-based pagination.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `cursor?` | `number` | Scan cursor (default 0). |
| `count?` | `number` | Number of keys to fetch per page (default 10). |

#### Returns

`Promise`\<\{ `keys`: [`StoredKey`](../../types/keys/interfaces/StoredKey.md)[]; `next_cursor`: `string`; \}\>

An object containing the keys and the next cursor.

***

### list\_by\_owner()

> **list\_by\_owner**(`owner`, `cursor?`, `count?`): `Promise`\<\{ `keys`: [`StoredKey`](../../types/keys/interfaces/StoredKey.md)[]; `next_cursor`: `string`; \}\>

Defined in: [storage/keys.ts:60](https://github.com/fungi-computer/Botanical/blob/eb392c5b2c3018f8ad9b53277ef1caedba399ca4/packages/one-key-core/src/storage/keys.ts#L60)

Lists keys belonging to a specific owner with cursor-based pagination.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `owner` | `string` | Owner identifier. |
| `cursor?` | `string` \| `number` | Scan cursor (default "0"). |
| `count?` | `number` | Number of keys to fetch per page (default 10). |

#### Returns

`Promise`\<\{ `keys`: [`StoredKey`](../../types/keys/interfaces/StoredKey.md)[]; `next_cursor`: `string`; \}\>

An object containing the keys and the next cursor.
