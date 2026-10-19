import _ from "lodash"
import { useQuery } from "@tanstack/react-query"
import hooks from "@mitocube/api-hooks"
import { apiClient } from "./client"

/**
 * Submission statistics wiring. Endpoints live under /stats/submissions/counts
 * (backend router src/routers/stats/submissions.py, see
 * docs/submission-statistics-endpoints.md). The @mitocube/api-hooks package
 * provides typed hooks; if the installed package version does not yet export
 * one of them, a direct apiClient fallback is used, so the statistics page
 * works with both older and newer package versions.
 */

const statsAPI = hooks.stats.submissions.createSubmissionDurationsAPI(apiClient)

const joinOrNull = tags => _.isArray(tags) && tags.length > 0 ? _.join(tags, ";") : tags

const directGet = (path, params) => apiClient.get(path, { params }).then(res => res.data)

const useStatsQuery = (packageHook, queryKey, path, params, useQueryOptions = {}) => {
    if (_.isFunction(packageHook)) return packageHook(params, useQueryOptions)
    return useQuery({
        queryKey: [...queryKey, params],
        queryFn: () => directGet(path, {
            ...params,
            user_tags: joinOrNull(params.user_tags),
            genotype_tags: joinOrNull(params.genotype_tags),
            ca_tags: joinOrNull(params.ca_tags),
            research_group_tags: joinOrNull(params.research_group_tags)
        }),
        ...useQueryOptions
    })
}

const useGetResearchGroupSubmissionCounts = (params = {}, useQueryOptions = {}) => {
    return useStatsQuery(
        statsAPI.useGetSubmissionCountsByYear,
        ["getSubmissionCountsByYear"],
        "/stats/submissions/counts/submissions",
        { group_by: "research_group", ...params },
        useQueryOptions
    )
}

const useGetResearchGroupSampleCounts = (params = {}, useQueryOptions = {}) => {
    return useStatsQuery(
        statsAPI.useGetSampleCountsByResearchGroup,
        ["getSampleCountsByResearchGroup"],
        "/stats/submissions/counts/samples",
        { group_by: "research_group", ...params },
        useQueryOptions
    )
}

const useGetUserSubmissionCounts = (params = {}, useQueryOptions = {}) => {
    return useStatsQuery(
        statsAPI.useGetSubmissionCountsByUser,
        ["getSubmissionCountsByUser"],
        "/stats/submissions/counts/users",
        params,
        useQueryOptions
    )
}

const useGetSubmissionStateCounts = (params = {}, useQueryOptions = {}) => {
    return useStatsQuery(
        statsAPI.useGetSubmissionCountsByState,
        ["getSubmissionCountsByState"],
        "/stats/submissions/counts/states",
        params,
        useQueryOptions
    )
}

const useGetProteinGroupCounts = (params = {}, useQueryOptions = {}) => {
    return useStatsQuery(
        statsAPI.useGetProteinGroupCountsByYear,
        ["getProteinGroupCountsByYear"],
        "/stats/submissions/counts/protein-groups",
        params,
        useQueryOptions
    )
}

export const submissionStatisticsAPI = {
    useGetResearchGroupSubmissionCounts,
    useGetResearchGroupSampleCounts,
    useGetUserSubmissionCounts,
    useGetSubmissionStateCounts,
    useGetProteinGroupCounts
}
