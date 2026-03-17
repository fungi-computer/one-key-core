[**one-key-core**](../../README.md)

***

[one-key-core](../../README.md) / [main](../README.md) / OneKey

# Function: OneKey()

> **OneKey**(`options`): [`Client`](../../client/client/interfaces/Client.md)

Defined in: [main.ts:14](https://github.com/fungi-computer/Botanical/blob/27f75e482c4ef47a93514c70c5a99ee72ad68164/packages/one-key-core/src/main.ts#L14)

Creates a OneKey instance bound to a Redis client.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | \{ `redis`: `Redis` \| `Cluster`; \} | Configuration options. |
| `options.redis` | `Redis` \| `Cluster` | An instance of a Redis client (either Redis or Cluster) from ioredis. |

## Returns

[`Client`](../../client/client/interfaces/Client.md)

An object containing the Client API (details to be documented later).
