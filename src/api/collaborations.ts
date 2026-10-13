import hooks from "@mitocube/api-hooks";
import { apiClient } from "./client";

export const collaborationsAPI = hooks.collaborations.createCollaborationsAPI(apiClient);
export const messagesAPI = hooks.messages.createMessagesAPI(apiClient);
