import hooks from "@mitocube/api-hooks";
import { apiClient } from "./client";

export const variantsQueryAPI = hooks.variants.createVariantsAPI(apiClient);