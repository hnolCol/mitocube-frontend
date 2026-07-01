import hooks from "@mitocube/api-hooks";
import { apiClient } from "./client";

export const crosslinksQueryAPI = hooks.crosslink.createQueryCrosslinksAPI(apiClient);
export const externalresourceQueryAPI = hooks.crosslink.createQueryExternalResourcesAPI(apiClient);