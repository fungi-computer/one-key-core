import { describe, test, expect, beforeAll } from "vitest";
import Redis from "ioredis";
import OneKey from "../src/main";

const HOST = "localhost";
const PORT = 6379;

const redis = new Redis({ host: HOST, port: PORT });

describe("Client Factory", () => {
  beforeAll(async () => {
    await redis.flushdb();
  });

  test("Creates a OneKey client instance", () => {
    const one_key = OneKey({ redis: redis });
    expect(one_key.keys).toBeDefined();
    expect(one_key.admin).toBeDefined();
  });
});
