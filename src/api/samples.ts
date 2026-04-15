import hooks from "@mitocube/api-hooks";
import { apiClient } from "./client";

export const sampleCountAPI = hooks.samples.createSampleCountAPI(apiClient);
export const sampleCoreAPI = hooks.samples.createSampleCoreAPI(apiClient);