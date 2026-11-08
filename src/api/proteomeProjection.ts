import _ from "lodash";
import { useQuery } from "@tanstack/react-query";
import hooks from "@mitocube/api-hooks";
import { apiClient } from "./client";

/**
 * Proteome projection wiring. The hooks are provided by @mitocube/api-hooks
 * (mitocube-api-hooks PR #65, backend PR #155). If the installed package
 * version does not yet export them, a direct apiClient fallback is used, so
 * the UI works with both older and newer package versions.
 */

const packageProjectionAPI = _.isFunction(hooks?.stats?.proteomes?.createProteomeProjectionAPI)
    ? hooks.stats.proteomes.createProteomeProjectionAPI(apiClient)
    : null;

const useGetProteomeProjectionDriver = (APIParams = { proteome_tag, protein_tag, n_components: 4 }, useQueryOptions = {}) => {
    if (_.isFunction(packageProjectionAPI?.useGetProteomeProjectionDriver)) {
        return packageProjectionAPI.useGetProteomeProjectionDriver(APIParams, useQueryOptions);
    }
    return useQuery({
        queryKey: ["getProteomeProjectionDriver", APIParams.proteome_tag, APIParams.protein_tag, APIParams.n_components, APIParams.min_valid_fraction],
        queryFn: () => apiClient
            .get(`/stats/proteomes/${APIParams.proteome_tag}/projection/drivers/${APIParams.protein_tag}`, {
                params: { n_components: APIParams.n_components, min_valid_fraction: APIParams.min_valid_fraction }
            })
            .then(res => res.data),
        ...useQueryOptions
    });
};

const useGetProteomeProjectionConditionEffects = (APIParams = { proteome_tag, ca_tag, limit: 50 }, useQueryOptions = {}) => {
    if (_.isFunction(packageProjectionAPI?.useGetProteomeProjectionConditionEffects)) {
        return packageProjectionAPI.useGetProteomeProjectionConditionEffects(APIParams, useQueryOptions);
    }
    return useQuery({
        queryKey: ["getProteomeProjectionConditionEffects", APIParams.proteome_tag, APIParams.ca_tag, APIParams.limit, APIParams.min_valid_fraction],
        queryFn: () => apiClient
            .get(`/stats/proteomes/${APIParams.proteome_tag}/projection/effects/${APIParams.ca_tag}`, {
                params: { limit: APIParams.limit, min_valid_fraction: APIParams.min_valid_fraction }
            })
            .then(res => res.data),
        ...useQueryOptions
    });
};

const useGetProteomeProjectionAttributeEffects = (APIParams = { proteome_tag, attribute_tag, n_components: 4, top_proteins: 10 }, useQueryOptions = {}) => {
    if (_.isFunction(packageProjectionAPI?.useGetProteomeProjectionAttributeEffects)) {
        return packageProjectionAPI.useGetProteomeProjectionAttributeEffects(APIParams, useQueryOptions);
    }
    return useQuery({
        queryKey: ["getProteomeProjectionAttributeEffects", APIParams.proteome_tag, APIParams.attribute_tag, APIParams.n_components, APIParams.top_proteins, APIParams.min_valid_fraction],
        queryFn: () => apiClient
            .get(`/stats/proteomes/${APIParams.proteome_tag}/projection/effects/attribute/${APIParams.attribute_tag}`, {
                params: { n_components: APIParams.n_components, top_proteins: APIParams.top_proteins, min_valid_fraction: APIParams.min_valid_fraction }
            })
            .then(res => res.data),
        ...useQueryOptions
    });
};

export const proteomeProjectionAPI = {
    ...(packageProjectionAPI ?? {}),
    useGetProteomeProjectionDriver,
    useGetProteomeProjectionConditionEffects,
    useGetProteomeProjectionAttributeEffects
};
