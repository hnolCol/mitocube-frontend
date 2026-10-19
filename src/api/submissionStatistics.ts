import hooks from "@mitocube/api-hooks";
import { apiClient } from "./client";

/**
 * Submission statistics wiring. All endpoints live under
 * /stats/submissions/counts (backend router src/routers/stats/submissions.py,
 * see docs/submission-statistics-endpoints.md) and are provided by the
 * @mitocube/api-hooks stats submissions API, which accepts the statistics
 * filter params (state, user_tags, genotype_tags, ca_tags, include_sample_ca)
 * either as semicolon-joined strings or arrays.
 */

const statsAPI = hooks.stats.submissions.createSubmissionDurationsAPI(apiClient)

const useGetResearchGroupSubmissionCounts = ({ years, state, user_tags, genotype_tags, ca_tags, include_sample_ca } = {}, useQueryOptions = {}) => {
    return statsAPI.useGetSubmissionCountsByYear({
        group_by: "research_group",
        years, state, user_tags, genotype_tags, ca_tags, include_sample_ca
    }, useQueryOptions)
}

const useGetResearchGroupSampleCounts = ({ years, state, user_tags, genotype_tags, ca_tags, include_sample_ca } = {}, useQueryOptions = {}) => {
    return statsAPI.useGetSampleCountsByResearchGroup({
        group_by: "research_group",
        years, state, user_tags, genotype_tags, ca_tags, include_sample_ca
    }, useQueryOptions)
}

const useGetUserSubmissionCounts = ({ years, state, research_group_tags, user_tags, genotype_tags, ca_tags, include_sample_ca } = {}, useQueryOptions = {}) => {
    return statsAPI.useGetSubmissionCountsByUser({
        years, state, research_group_tags, user_tags, genotype_tags, ca_tags, include_sample_ca
    }, useQueryOptions)
}

const useGetSubmissionStateCounts = ({ user_tags, genotype_tags, ca_tags, include_sample_ca } = {}, useQueryOptions = {}) => {
    return statsAPI.useGetSubmissionCountsByState({
        user_tags, genotype_tags, ca_tags, include_sample_ca
    }, useQueryOptions)
}

const useGetProteinGroupCounts = ({ years, state, user_tags, genotype_tags, ca_tags, include_sample_ca } = {}, useQueryOptions = {}) => {
    return statsAPI.useGetProteinGroupCountsByYear({
        years, state, user_tags, genotype_tags, ca_tags, include_sample_ca
    }, useQueryOptions)
}

export const submissionStatisticsAPI = {
    useGetResearchGroupSubmissionCounts,
    useGetResearchGroupSampleCounts,
    useGetUserSubmissionCounts,
    useGetSubmissionStateCounts,
    useGetProteinGroupCounts
}
