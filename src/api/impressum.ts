import hooks from "@mitocube/api-hooks";
import { apiClient } from "./client";

export const impressumAPI = hooks.impressum.createImpressumAPI(apiClient);
