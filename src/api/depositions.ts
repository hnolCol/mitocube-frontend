import hooks from "@mitocube/api-hooks";
import { apiClient } from "./client";

export const depositionsAPI = hooks.requests.createDepositionRequestsAPI(apiClient);
