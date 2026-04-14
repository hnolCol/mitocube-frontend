import hooks from "@mitocube/api-hooks";
import { apiClient } from "./client";
export const submissionAnalysisAPI = hooks.submissions.analysis.createSubmissionAnalysisAPI(apiClient);
export const submissionTitleAPI = hooks.submissions.title.createSubmissionTitleAPI(apiClient);
export const submissionCoreAPI = hooks.submissions.core.createSubmissionCoreAPI(apiClient);
export const submissionMetatextAPI = hooks.submissions.metatexts.createSubmissionMetatextAPI(apiClient);
export const submissionPermissionsAPI = hooks.submissions.permissions.createSubmissionPermissionsAPI(apiClient);