import hooks from "@mitocube/api-hooks";
import { apiClient } from "../client";

export const maintenanceCoreAPI = hooks.maintenance.createCoreMaintenanceEventsAPI(apiClient);
export const maintenanceStatesAPI = hooks.maintenance.states.createGetMaintenanceEventStatesAPI(apiClient);