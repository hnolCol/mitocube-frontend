import hooks from "@mitocube/api-hooks";
import { apiClient } from "./client";

export const ticketsAPI = hooks.tickets.createTicketsAPI(apiClient);

