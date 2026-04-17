import hooks from "@mitocube/api-hooks";
import { apiClient } from "./client";

export const instrumentsCoreAPI = hooks.instruments.createCoreInstrumentsAPI(apiClient);
export const instrumentsCountAPI = hooks.instruments.samples.createGetInstrumentSamplesCountAPI(apiClient);
export const instrumentsPermissionsAPI = hooks.instruments.permissions.createGetInstrumentPermissionsAPI(apiClient);