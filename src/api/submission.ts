import hooks from "@mitocube/api-hooks";
import { apiClient } from "./client";
export const submissionAnalysisAPI = hooks.submissions.analysis.createSubmissionAnalysisAPI(apiClient);
