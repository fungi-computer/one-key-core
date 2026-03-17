# one-key-core

API key management with rate limiting for serverless apps.

## Install

```bash
pnpm add one-key-core ioredis
```

## Quick Start

```typescript
import Redis from "ioredis";
import OneKey from "one-key-core";
import { Hono } from "hono";

const redis = new Redis(process.env.REDIS_URL);
const onekey = OneKey({ redis });

const app = new Hono();

// Middleware to verify API keys
app.use("/api/*", async (c, next) => {
  const api_key = c.req.header("x-api-key");
  if (!api_key) return c.text("Missing API key", 401);

  const result = await onekey.keys.verify(api_key, [
    { name: "default", limit: 100, cost: 1, duration: 60 },
  ]);

  if (!result.success || !result.data.valid) {
    return c.text("Invalid or rate-limited", 401);
  }

  c.set("key", result.data);
  await next();
});

app.get("/api/protected", (c) => {
  const key = c.get("key");
  return c.json({ message: "Hello!", keyOwner: key.owner });
});
```

## Create a Key

```typescript
const result = await onekey.keys.create_key({
  owner: "my-app",
  name: "Test Key",
  rateLimits: [
    { name: "default", limit: 100, cost: 1, duration: 60 },
  ],
});

if (result.success) {
  console.log("API Key:", result.data.key); // plaintext key to share
  console.log("Expires:", result.data.expires);
}
```

## Rate Limits

Rate limits are checked on every `verify` call.

```typescript
await onekey.keys.verify(api_key, [
  { name: "default", limit: 100, cost: 1, duration: 60 },
  { name: "burst", limit: 10, cost: 1, duration: 1 },
]);
```

### Rate Limit Fields

| Field | Description |
|-------|-------------|
| `name` | Identifier for this limit |
| `limit` | Max requests allowed |
| `cost` | How much each request counts (default 1) |
| `duration` | Window in seconds |

### Workspace Rate Limits

Create a workspace with rate limits so all keys share the same pool:

```typescript
const result = await onekey.workspaces.create({
  owner: "my-app",
  name: "My App Workspace",
  rateLimits: [
    { name: "default", limit: 1000, cost: 1, duration: 60 },
  ],
});

if (result.success) {
  console.log("Workspace:", result.data.name);
}
```

Update workspace rate limits later:

```typescript
await onekey.workspaces.update("my-app", {
  rateLimits: [{ name: "default", limit: 2000, cost: 1, duration: 60 }],
});
```

Workspace limits are checked alongside per-key limits.
