import hooks from "@mitocube/api-hooks";
import { apiClient } from "./client";

export const platesAPI = hooks.plates.createPlatesAPI(apiClient);