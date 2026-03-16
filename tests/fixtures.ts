// import KeyService from "@/src/KeyService";
import { nanoid } from "nanoid";

const requests_per_second = {
  name: "requests_per_second",
  cost: 1,
  limit: 100,
  duration: 100000,
  autoVerify: true,
};

const failing_rate_limit = {
  name: "failing",
  cost: 100,
  limit: 10,
  duration: 100,
  autoVerify: true,
};

const tokens = {
  name: "tokens",
  cost: 1,
  limit: 10,
  duration: 10,
  autoVerify: true,
};

const workspace_requests = {
  name: "workspace_requests",
  limit: 100,
  cost: 1,
  autoVerify: true,
  duration: 10,
};

const workspace_requests_fail = {
  name: "workspace_requests_fail",
  limit: 100,
  cost: 500,
  autoVerify: true,
  duration: 10,
};

const owner_passing_limit_checks = "123";
const owner_failing_limit_checks = "321";

export const BAD_KEY = "123";
export const GOOD_KEY = "555";
// const bad_hash = KeyService.hash_key(BAD_KEY);
// const good_hash = KeyService.hash_key(GOOD_KEY);

const bad_hash = "666";
const good_hash = "999";

export const rate_limits = {
  workspace_requests,
  workspace_requests_fail,
  requests_per_second,
  tokens,
  failing_rate_limit,
};

export const owners = {
  owner_passing_limit_checks,
  owner_failing_limit_checks,
};

const failing_owner_key = {
  id: nanoid(16),
  hash: bad_hash!,
  owner: owners.owner_failing_limit_checks,
  name: "TEST",
  createdAt: Date.now(),
  rateLimits: [rate_limits.requests_per_second, rate_limits.tokens],
};

const passing_key = {
  id: nanoid(16),
  hash: good_hash!,
  owner: owners.owner_passing_limit_checks,
  name: "TEST",
  createdAt: Date.now(),
  rateLimits: [rate_limits.requests_per_second, rate_limits.tokens],
};

const failing_workspace = {
  owner: owners.owner_failing_limit_checks,
  rateLimits: [rate_limits.workspace_requests_fail],
};

const passing_workspace = {
  owner: owners.owner_passing_limit_checks,
  rateLimits: [rate_limits.workspace_requests],
};

export const workspaces = { failing_workspace, passing_workspace };
export const keys = { failing_owner_key, passing_key };
