[**one-key-core**](../../../README.md)

***

[one-key-core](../../../README.md) / [storage/storage](../README.md) / WorkspacesStorage

# Interface: WorkspacesStorage

Defined in: [storage/workspaces.ts:15](https://github.com/fungi-computer/Botanical/blob/27f75e482c4ef47a93514c70c5a99ee72ad68164/packages/one-key-core/src/storage/workspaces.ts#L15)

Interface for workspace management operations.
Workspaces represent a collection of API keys owned by a single entity,
with optional rate limits that apply to all keys within the workspace.

## Methods

### create()

> **create**(`workspace`): `Promise`\<`Result`\<\{ `owner`: `string`; `rateLimits?`: `object`[]; `meta?`: `Record`\<`string`, `string`\>; \}\>\>

Defined in: [storage/workspaces.ts:32](https://github.com/fungi-computer/Botanical/blob/27f75e482c4ef47a93514c70c5a99ee72ad68164/packages/one-key-core/src/storage/workspaces.ts#L32)

Creates a new workspace.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `workspace` | \{ `owner`: `string`; `rateLimits?`: `object`[]; `meta?`: `Record`\<`string`, `string`\>; \} | The workspace data. The `id` field will be auto‑generated. |
| `workspace.owner` | `string` | - |
| `workspace.rateLimits?` | `object`[] | - |
| `workspace.meta?` | `Record`\<`string`, `string`\> | - |

#### Returns

`Promise`\<`Result`\<\{ `owner`: `string`; `rateLimits?`: `object`[]; `meta?`: `Record`\<`string`, `string`\>; \}\>\>

A `Result` containing the created workspace on success, or an error if a workspace already exists for the given owner.

#### Example

```ts
const result = await workspaces.create({
  owner: "user_123",
  name: "My Workspace",
  rateLimits: [{ name: "api_calls", limit: 1000, duration: 3600 }]
});
if (result.success) {
  console.log("Workspace created:", result.data);
}
```

***

### get()

> **get**(`owner`): `Promise`\<\{ `owner`: `string`; `rateLimits?`: `object`[]; `meta?`: `Record`\<`string`, `string`\>; \} \| `null`\>

Defined in: [storage/workspaces.ts:46](https://github.com/fungi-computer/Botanical/blob/27f75e482c4ef47a93514c70c5a99ee72ad68164/packages/one-key-core/src/storage/workspaces.ts#L46)

Retrieves a workspace by its owner identifier.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `owner` | `string` | The owner identifier (typically a user ID or organization ID). |

#### Returns

`Promise`\<\{ `owner`: `string`; `rateLimits?`: `object`[]; `meta?`: `Record`\<`string`, `string`\>; \} \| `null`\>

The workspace object if found, otherwise `null`.

#### Example

```ts
const workspace = await workspaces.get("user_123");
if (workspace) {
  console.log(workspace.rateLimits);
}
```

***

### update()

> **update**(`owner`, `updates`): `Promise`\<`Result`\<\{ `owner`: `string`; `rateLimits?`: `object`[]; `meta?`: `Record`\<`string`, `string`\>; \}\>\>

Defined in: [storage/workspaces.ts:61](https://github.com/fungi-computer/Botanical/blob/27f75e482c4ef47a93514c70c5a99ee72ad68164/packages/one-key-core/src/storage/workspaces.ts#L61)

Updates an existing workspace.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `owner` | `string` | The owner identifier of the workspace to update. |
| `updates` | `Partial`\<`Omit`\<[`Workspace`](../../../types/keys/type-aliases/Workspace.md), `"owner"` \| `"id"`\>\> | Partial fields to update. The `owner` and `id` fields cannot be changed. |

#### Returns

`Promise`\<`Result`\<\{ `owner`: `string`; `rateLimits?`: `object`[]; `meta?`: `Record`\<`string`, `string`\>; \}\>\>

A `Result` containing the updated workspace, or an error if the workspace does not exist.

#### Example

```ts
const result = await workspaces.update("user_123", {
  name: "New Workspace Name",
  rateLimits: [{ name: "api_calls", limit: 2000, duration: 3600 }]
});
```

***

### delete()

> **delete**(`owner`): `Promise`\<`Result`\<`"success"`\>\>

Defined in: [storage/workspaces.ts:78](https://github.com/fungi-computer/Botanical/blob/27f75e482c4ef47a93514c70c5a99ee72ad68164/packages/one-key-core/src/storage/workspaces.ts#L78)

Deletes a workspace by its owner identifier.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `owner` | `string` | The owner identifier of the workspace to delete. |

#### Returns

`Promise`\<`Result`\<`"success"`\>\>

A `Result` with `"success"` on successful deletion, or an error if the workspace does not exist.

#### Example

```ts
const result = await workspaces.delete("user_123");
if (result.success) {
  console.log("Workspace deleted");
}
```

***

### list()

> **list**(`cursor?`, `count?`): `Promise`\<\{ `workspaces`: `object`[]; `next_cursor`: `string`; \}\>

Defined in: [storage/workspaces.ts:94](https://github.com/fungi-computer/Botanical/blob/27f75e482c4ef47a93514c70c5a99ee72ad68164/packages/one-key-core/src/storage/workspaces.ts#L94)

Lists all workspaces with cursor‑based pagination.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `cursor?` | `number` | The scan cursor (default: 0). Use the returned `next_cursor` for subsequent pages. |
| `count?` | `number` | Number of workspaces to fetch per page (default: 10). |

#### Returns

`Promise`\<\{ `workspaces`: `object`[]; `next_cursor`: `string`; \}\>

An object containing an array of workspaces and the next cursor for pagination.

#### Example

```ts
const page1 = await workspaces.list(0, 10);
console.log(page1.workspaces);
if (page1.next_cursor !== "0") {
  const page2 = await workspaces.list(page1.next_cursor, 10);
}
```
