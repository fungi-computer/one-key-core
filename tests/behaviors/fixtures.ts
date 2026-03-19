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

export const rate_limits = {
  workspace_requests,
  workspace_requests_fail,
  requests_per_second,
  tokens,
  failing_rate_limit,
};

export const create_owner = () => nanoid(16);

export const create_key = (owner?: string) => ({
  id: nanoid(16),
  hash: nanoid(64),
  owner: owner ?? create_owner(),
  name: "Test Key",
  createdAt: Date.now(),
  rateLimits: [rate_limits.requests_per_second, rate_limits.tokens],
});

export const create_workspace = (owner?: string) => ({
  owner: owner ?? create_owner(),
  name: "Test Workspace",
  rateLimits: [rate_limits.workspace_requests],
});

export const create_workspace_with_exceeded_limits = (owner?: string) => ({
  owner: owner ?? create_owner(),
  name: "Failing Workspace",
  rateLimits: [rate_limits.workspace_requests_fail],
});

export const create_failing_workspace = create_workspace_with_exceeded_limits;
