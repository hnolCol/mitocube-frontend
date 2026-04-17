import hooks from "@mitocube/api-hooks";
import { apiClient } from "./client";

export const backendInfoAPI = hooks.info.createBackendInfoAPI(apiClient);
export const statisticsInfoAPI = hooks.info.createStatisticInfoAPI(apiClient);
export const termsInfoAPI = hooks.info.createTermsOfUseAPI(apiClient);