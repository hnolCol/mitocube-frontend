import hooks from "@mitocube/api-hooks";
import { apiClient } from "./client";

export const diseasesQueryAPI = hooks.diseases.createDiseasesAPI(apiClient);
export const diseasesClinVarAPI = hooks.diseases.createClinVarAPI(apiClient);