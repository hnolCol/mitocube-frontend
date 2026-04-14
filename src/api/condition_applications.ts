

import hooks from "@mitocube/api-hooks";
import { apiClient } from "./client";
export const conditionApplicationAPI = hooks.condition_applications.createConditionApplicationAPI(apiClient);

