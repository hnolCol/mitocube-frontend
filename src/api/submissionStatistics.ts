import _ from "lodash";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";

/**
 * Submission statistics endpoints. These are planned backend endpoints
 * (see docs/submission-statistics-endpoints.md) and are not yet served by the
 * API. Each hook fails gracefully until the backend implements the route.
 */

async function getResearchGroupSubmissionCounts_API({ years, state }) {
    const res = await apiClient.get("/submissions/statistics/research-groups/submission-counts", {
        params: { years: years ? _.join(years, ";") : undefined, state }
    })
    return res.data
}

async function getResearchGroupSampleCounts_API({ years, state }) {
    const res = await apiClient.get("/submissions/statistics/research-groups/sample-counts", {
        params: { years: years ? _.join(years, ";") : undefined, state }
    })
    return res.data
}

async function getUserSubmissionCounts_API({ years, state, research_group_tags }) {
    const res = await apiClient.get("/submissions/statistics/users/submission-counts", {
        params: {
            years: years ? _.join(years, ";") : undefined,
            state,
            research_group_tags: research_group_tags ? _.join(research_group_tags, ";") : undefined
        }
    })
    return res.data
}

const useGetResearchGroupSubmissionCounts = ({ years, state } = {}, useQueryOptions = {}) => {
    return useQuery({
        queryKey: ["getResearchGroupSubmissionCounts", years, state],
        queryFn: () => getResearchGroupSubmissionCounts_API({ years, state }),
        ...useQueryOptions
    })
}

const useGetResearchGroupSampleCounts = ({ years, state } = {}, useQueryOptions = {}) => {
    return useQuery({
        queryKey: ["getResearchGroupSampleCounts", years, state],
        queryFn: () => getResearchGroupSampleCounts_API({ years, state }),
        ...useQueryOptions
    })
}

const useGetUserSubmissionCounts = ({ years, state, research_group_tags } = {}, useQueryOptions = {}) => {
    return useQuery({
        queryKey: ["getUserSubmissionCounts", years, state, research_group_tags],
        queryFn: () => getUserSubmissionCounts_API({ years, state, research_group_tags }),
        ...useQueryOptions
    })
}

export const submissionStatisticsAPI = {
    useGetResearchGroupSubmissionCounts,
    useGetResearchGroupSampleCounts,
    useGetUserSubmissionCounts
}
