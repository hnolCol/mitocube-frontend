import hooks from "@mitocube/api-hooks";
import { apiClient } from "../client";

export const symptomsModifyAPI = hooks.maintenance.symptoms.createModifySymptomsAPI(apiClient);
export const symptomsQueryAPI = hooks.maintenance.symptoms.createQuerySymptomsAPI(apiClient);