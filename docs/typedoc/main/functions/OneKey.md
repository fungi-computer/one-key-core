[**one-key-core**](../../README.md)

***

[one-key-core](../../modules.md) / [main](../README.md) / OneKey

# Function: OneKey()

> **OneKey**(`options`): [`Client`](../../client/client/interfaces/Client.md)

Defined in: [main.ts:14](https://github.com/fungi-computer/Botanical/blob/eb392c5b2c3018f8ad9b53277ef1caedba399ca4/packages/one-key-core/src/main.ts#L14)

Creates a OneKey instance bound to a Redis client.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | \{ `redis`: `Redis` \| `Cluster`; \} | Configuration options. |
| `options.redis` | `Redis` \| `Cluster` | An instance of a Redis client (either Redis or Cluster) from ioredis. |

## Returns

[`Client`](../../client/client/interfaces/Client.md)

An object containing the Client API (details to be documented later).
