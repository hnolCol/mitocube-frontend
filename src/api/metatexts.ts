import hooks from "@mitocube/api-hooks";
import { apiClient } from "./client";
export const metatextAPI = hooks.metatexts.createMetatextAPI(apiClient);