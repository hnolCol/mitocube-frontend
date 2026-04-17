import hooks from "@mitocube/api-hooks";
import { apiClient } from "./client";

export const statsAPI = hooks.stats.submissions.createSubmissionDurationsAPI(apiClient);