import hooks from "@mitocube/api-hooks";
import { apiClient } from "./client";

export const policyAPI = hooks.policy.createPolicyAPI(apiClient);
