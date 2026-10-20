import hooks from "@mitocube/api-hooks";
import { apiClient } from "./client";

export const yearReportAPI = hooks.reports.createYearReportAPI(apiClient);
