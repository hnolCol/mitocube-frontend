import hooks from "@mitocube/api-hooks";
import { apiClient } from "./client";

export const annotationsModifyAPI = hooks.annotations.createModifyAnnotationsAPI(apiClient);
export const annotationsQueryAPI = hooks.annotations.createQueryAnnotationsAPI(apiClient);