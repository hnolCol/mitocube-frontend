import hooks from "@mitocube/api-hooks";
import { apiClient } from "../client";

export const sparepartsModifyAPI = hooks.maintenance.spareparts.createModifySparePartsAPI(apiClient);
export const sparepartsQueryAPI = hooks.maintenance.spareparts.createQuerySparePartsAPI(apiClient);