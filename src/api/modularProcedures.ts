import hooks from "@mitocube/api-hooks";
import { apiClient } from "./client";

export const modularProceduresQueryAPI = hooks.modular_procedures.createQueryModularProceduresAPI(apiClient);
export const modularProceduresModifyAPI = hooks.modular_procedures.createModifyModularProceduresAPI(apiClient);
