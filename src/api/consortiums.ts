import hooks from "@mitocube/api-hooks";
import { apiClient } from "./client";

const consortiumsAPI = hooks.consortiums.createConsortiumsAPI(apiClient);

const {
    useGetMyPendingShareRequests,
    useApproveConsortiumShareRequest,
    useDenyConsortiumShareRequest
} = consortiumsAPI;

export const pendingConsortiumShareRequestsAPI = {
    useGetPendingConsortiumShareRequests: (APIParams = {}, useQueryOptions = {}) => useGetMyPendingShareRequests(useQueryOptions),
    useApproveConsortiumShareRequest,
    useDenyConsortiumShareRequest
}

export { consortiumsAPI };
