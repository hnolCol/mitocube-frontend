import _ from "lodash";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";

/**
 * Submission statistics endpoints under /stats/submissions/counts (backend
 * router src/routers/stats/submissions.py, see docs/submission-statistics-endpoints.md).
 * All endpoints return flat rows: [{ group, year, value }].
 */

async function getResearchGroupSubmissionCounts_API({ years, state }) {
    const res = await apiClient.get("/stats/submissions/counts/submissions", {
        params: { group_by: "research_group", years: years ? _.join(years, ";") : undefined, state }
    })
    return res.data
}

async function getResearchGroupSampleCounts_API({ years, state }) {
    const res = await apiClient.get("/stats/submissions/counts/samples", {
        params: { group_by: "research_group", years: years ? _.join(years, ";") : undefined, state }
    })
    return res.data
}

async function getUserSubmissionCounts_API({ years, state, research_group_tags }) {
    const res = await apiClient.get("/stats/submissions/counts/users", {
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
