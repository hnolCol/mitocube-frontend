import _ from "lodash";
import { useQuery, useMutation } from "@tanstack/react-query";
import hooks from "@mitocube/api-hooks";
import { apiClient } from "./client";

export const sampleCountAPI = hooks.samples.createSampleCountAPI(apiClient);

const packageSampleCoreAPI = hooks.samples.createSampleCoreAPI(apiClient);

/**
 * Sample core wiring. The lost flag and sample comment hooks are provided by
 * @mitocube/api-hooks (mitocube-api-hooks PR #61, backend PR #143). If the
 * installed package version does not yet export them, a direct apiClient
 * fallback is used, so the UI works with both older and newer package versions.
 */

const useSetSampleLost = (useMutationOptions = {}) => {
    if (_.isFunction(packageSampleCoreAPI.useSetSampleLost)) {
        return packageSampleCoreAPI.useSetSampleLost(useMutationOptions);
    }
    return useMutation({
        mutationFn: ({ tag, lost }) =>
            apiClient.patch(`/samples/${tag}/lost`, null, { params: { lost } }).then(res => res.data),
        ...useMutationOptions
    });
};

const useGetSampleComments = (APIParams = { tag }, useQueryOptions = { staleTime: 0 }) => {
    if (_.isFunction(packageSampleCoreAPI.useGetSampleComments)) {
        return packageSampleCoreAPI.useGetSampleComments(APIParams, useQueryOptions);
    }
    return useQuery({
        queryKey: ["getSampleComments", APIParams.tag],
        queryFn: () => apiClient.get(`/samples/${APIParams.tag}/comments`).then(res => res.data),
        ...useQueryOptions
    });
};

const usePostSampleComment = (useMutationOptions = {}) => {
    if (_.isFunction(packageSampleCoreAPI.usePostSampleComment)) {
        return packageSampleCoreAPI.usePostSampleComment(useMutationOptions);
    }
    return useMutation({
        mutationFn: ({ tag, content, response_to = null }) =>
            apiClient.post(`/samples/${tag}/comments`, { content, response_to }).then(res => res.data),
        ...useMutationOptions
    });
};

export const sampleCoreAPI = {
    ...packageSampleCoreAPI,
    useSetSampleLost,
    useGetSampleComments,
    usePostSampleComment
};
