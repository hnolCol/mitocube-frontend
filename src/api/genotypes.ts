import hooks from "@mitocube/api-hooks";
import { apiClient } from "./client";

export const genotypesModifyAPI = hooks.genotypes.createModifyGenotypesAPI(apiClient);
export const genotypesQueryAPI = hooks.genotypes.createQueryGenotypesAPI(apiClient);
export const genotypesCAQueryAPI = hooks.genotypes.condition_applications.createQueryGenotypeConditionApplicationsAPI(apiClient);