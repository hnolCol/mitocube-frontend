import hooks from "@mitocube/api-hooks";
import { apiClient } from "./client";

export const researchGroupsQueryAPI = hooks.researchgroups(apiClient)