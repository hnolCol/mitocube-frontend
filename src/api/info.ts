import hooks from "@mitocube/api-hooks";
import { apiClient } from "./client";
export const backendInfoAPI = hooks.info.createBackendInfoAPI(apiClient);