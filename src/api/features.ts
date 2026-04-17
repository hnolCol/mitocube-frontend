import hooks from "@mitocube/api-hooks";
import { apiClient } from "./client";

export const featuresProteinsQueryAPI = hooks.features.proteins.createProteinFeatureQueryAPI(apiClient);
export const featuresCorelationsAPI = hooks.features.correlations.createFeatureCorrelationAPI(apiClient);
export const featuresDataAPI = hooks.features.data.createFeatureDataAPI(apiClient);
export const featuresTagAPI = hooks.features.createFeatureAPI(apiClient);
export const featuresInfoAPI = hooks.features.createFeatureInfoAPI(apiClient);
export const featuresPairwiseQuantAPI = hooks.features.data.createFeaturePairwiseQuantAPI(apiClient);
export const featuresSequenceAPI = hooks.features.createFeatureSequenceAPI(apiClient);
export const featuresRankingAPI = hooks.features.protein_groups.createFeaturesProteinsRankingAPI(apiClient);
export const featuresQuantificationsAPI = hooks.features.quantification.createFeatureQuantificationAPI(apiClient);