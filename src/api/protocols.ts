import hooks from "@mitocube/api-hooks";
import { apiClient } from "./client";

export const protocolsQueryAPI = hooks.protocols.createQueryProtocolsAPI(apiClient);
export const protocolsModifyAPI = hooks.protocols.createModifyProtocolAPI(apiClient);