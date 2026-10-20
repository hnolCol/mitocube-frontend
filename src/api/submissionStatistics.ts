import hooks from "@mitocube/api-hooks"
import { apiClient } from "./client"

const statsAPI = hooks.stats.submissions.createSubmissionDurationsAPI(apiClient)

const {
    useGetSubmissionCountsByYear,
    useGetSampleCountsByResearchGroup,
    useGetSubmissionCountsByUser,
    useGetSubmissionCountsByState,
    useGetProteinGroupCountsByYear
} = statsAPI

const useGetResearchGroupSubmissionCounts = (params = {}, useQueryOptions = {}) => {
    return useGetSubmissionCountsByYear({ group_by: "research_group", ...params }, useQueryOptions)
}

const useGetResearchGroupSampleCounts = (params = {}, useQueryOptions = {}) => {
    return useGetSampleCountsByResearchGroup({ group_by: "research_group", ...params }, useQueryOptions)
}

const useGetUserSubmissionCounts = (params = {}, useQueryOptions = {}) => {
    return useGetSubmissionCountsByUser(params, useQueryOptions)
}

const useGetSubmissionStateCounts = (params = {}, useQueryOptions = {}) => {
    return useGetSubmissionCountsByState(params, useQueryOptions)
}

const useGetProteinGroupCounts = (params = {}, useQueryOptions = {}) => {
    return useGetProteinGroupCountsByYear(params, useQueryOptions)
}

export const submissionStatisticsAPI = {
    useGetResearchGroupSubmissionCounts,
    useGetResearchGroupSampleCounts,
    useGetUserSubmissionCounts,
    useGetSubmissionStateCounts,
    useGetProteinGroupCounts
}
