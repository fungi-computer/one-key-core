[**one-key-core**](../../README.md)

***

[one-key-core](../../README.md) / [main](../README.md) / KeysStorage

# Interface: KeysStorage

Defined in: [storage/keys.ts:9](https://github.com/fungi-computer/Botanical/blob/27f75e482c4ef47a93514c70c5a99ee72ad68164/packages/one-key-core/src/storage/keys.ts#L9)

## Methods

### get()

> **get**(`hash`): `Promise`\<[`StoredKey`](../../types/keys/interfaces/StoredKey.md) \| `null`\>

Defined in: [storage/keys.ts:15](https://github.com/fungi-computer/Botanical/blob/27f75e482c4ef47a93514c70c5a99ee72ad68164/packages/one-key-core/src/storage/keys.ts#L15)

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

Defined in: [storage/keys.ts:22](https://github.com/fungi-computer/Botanical/blob/27f75e482c4ef47a93514c70c5a99ee72ad68164/packages/one-key-core/src/storage/keys.ts#L22)

Creates a new key.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `key` | `Omit`\<[`StoredKey`](../../types/keys/interfaces/StoredKey.md), `"createdAt"` \| `"id"`\> |

#### Returns

`Promise`\<`Result`\<[`StoredKey`](../../types/keys/interfaces/StoredKey.md)\>\>

A tuple with an error (if any) and the created key.

***

### update()

> **update**(`hash`, `updates`): `Promise`\<`Result`\<[`StoredKey`](../../types/keys/interfaces/StoredKey.md)\>\>

Defined in: [storage/keys.ts:31](https://github.com/fungi-computer/Botanical/blob/27f75e482c4ef47a93514c70c5a99ee72ad68164/packages/one-key-core/src/storage/keys.ts#L31)

Updates an existing key.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `hash` | `string` | The hash of the key to update. |
| `updates` | `Partial`\<`Omit`\<[`StoredKey`](../../types/keys/interfaces/StoredKey.md), `"hash"` \| `"owner"`\>\> | Partial fields to update (cannot change `hash` or `owner`). |

#### Returns

`Promise`\<`Result`\<[`StoredKey`](../../types/keys/interfaces/StoredKey.md)\>\>

The updated key.

#### Throws

If the key does not exist.

***

### delete()

> **delete**(`hash`): `Promise`\<`any`\>

Defined in: [storage/keys.ts:41](https://github.com/fungi-computer/Botanical/blob/27f75e482c4ef47a93514c70c5a99ee72ad68164/packages/one-key-core/src/storage/keys.ts#L41)

Deletes a key by its hash.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `hash` | `string` | The hash of the key to delete. |

#### Returns

`Promise`\<`any`\>

The Redis multi-exec result, or `undefined` if the key didn't exist.

***

### list()

> **list**(`cursor?`, `count?`): `Promise`\<\{ `keys`: [`StoredKey`](../../types/keys/interfaces/StoredKey.md)[]; `next_cursor`: `string`; \}\>

Defined in: [storage/keys.ts:49](https://github.com/fungi-computer/Botanical/blob/27f75e482c4ef47a93514c70c5a99ee72ad68164/packages/one-key-core/src/storage/keys.ts#L49)

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

Defined in: [storage/keys.ts:61](https://github.com/fungi-computer/Botanical/blob/27f75e482c4ef47a93514c70c5a99ee72ad68164/packages/one-key-core/src/storage/keys.ts#L61)

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
