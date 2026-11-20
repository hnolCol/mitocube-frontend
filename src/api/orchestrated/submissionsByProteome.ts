
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../client";

/**
 * @description Returns the tags of the submissions that are associated with any of the given
 * proteome tags (via a condition application of the attribute 'att_proteome'), restricted to
 * the requesting user's submission scope. Endpoint: GET '/api/submissions/q' with
 * attribute_tag='att_proteome' and trait_tags=<proteome tags>. The submissions query hook of
 * @mitocube/api-hooks sends the trait filter as 'trait_tag' which the backend ignores, so the
 * request is issued directly here with the correct 'trait_tags' parameter.
 * @param {Object} props
 * @param {String[]} props.proteome_tags The proteome tags to match.
 * @param {String} [props.search_string] Optional text search on the submission title/tag.
 * @param {Number} [props.min_state] Optional minimum submission state (e.g. 5 = ACTIVE and PUBLISHED, i.e. has quantification data).
 * @returns {String[]} The submission tags associated with any of the proteome tags.
 */
export function useGetSubmissionsByProteome(APIParams: { proteome_tags: string[], search_string?: string, min_state?: number } = { proteome_tags: [] }, useQueryOptions = {}) {
    const proteome_tags = Array.isArray(APIParams.proteome_tags) ? APIParams.proteome_tags.filter(t => typeof t === "string") : [];
    const search_string = typeof APIParams.search_string === "string" && APIParams.search_string.length > 0 ? APIParams.search_string : undefined;
    const min_state = typeof APIParams.min_state === "number" && APIParams.min_state > 0 ? APIParams.min_state : undefined;
    return useQuery({
        queryKey: ["submissionsByProteome", search_string, min_state, ...proteome_tags],
        queryFn: () => apiClient
            .get("/submissions/q", {
                params: {
                    search_string,
                    min_state,
                    attribute_tag: "att_proteome",
                    trait_tags: proteome_tags.join(";"),
                    group_by_state: false,
                    ordered: true,
                    limit: 200
                }
            })
            .then(res => res.data),
        staleTime: 60000,
        ...useQueryOptions,
        enabled: proteome_tags.length > 0
    });
}
