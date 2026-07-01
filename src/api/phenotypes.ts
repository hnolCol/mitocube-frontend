import hooks from "@mitocube/api-hooks";
import { apiClient } from "./client";

export const phenotypeQueryAPI = hooks.phenotype.createPhenotypesAPI(apiClient);
export const phenotypeassociationQueryAPI = hooks.phenotype.associations.createPhenotypeAssociationsAPI(apiClient);