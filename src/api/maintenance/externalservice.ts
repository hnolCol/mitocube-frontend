import hooks from "@mitocube/api-hooks";
import { apiClient } from "../client";

export const externalserviceModifyAPI = hooks.maintenance.externalservice.createModifyExternalServiceAPI(apiClient);
export const externalserviceQueryAPI = hooks.maintenance.externalservice.createQueryExternalServiceAPI(apiClient);