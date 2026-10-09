import hooks from "@mitocube/api-hooks";
import { apiClient } from "./client";

export const consortiumsAPI = hooks.consortiums.createConsortiumsAPI(apiClient);
