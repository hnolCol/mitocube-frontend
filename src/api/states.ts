import hooks from "@mitocube/api-hooks";
import { apiClient } from "./client";
export const stateAPI = hooks.states.createStateAPI(apiClient);