import hooks from "@mitocube/api-hooks";
import { apiClient } from "../client";

export const proceduresModifyAPI = hooks.maintenance.procedures.createModifyMaintenanceProceduresAPI(apiClient);
export const proceduresQueryAPI = hooks.maintenance.procedures.createQueryMaintenanceProceduresAPI(apiClient);