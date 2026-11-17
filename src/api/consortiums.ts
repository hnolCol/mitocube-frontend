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

const {
    useGetPendingConsortiumMembershipRequests,
    useGetMyPendingConsortiumMembershipRequests,
    usePostConsortiumMembershipRequest,
    useApproveConsortiumMembershipRequest,
    useDenyConsortiumMembershipRequest
} = consortiumsAPI;

export const consortiumMembershipRequestsAPI = {
    useGetPendingConsortiumMembershipRequests,
    useGetMyPendingConsortiumMembershipRequests,
    usePostConsortiumMembershipRequest,
    useApproveConsortiumMembershipRequest,
    useDenyConsortiumMembershipRequest
}

const {
    useGetConsortiumTermsGroups,
    useAgreeConsortiumTerms,
    useRevokeConsortiumTerms,
    useGetPendingConsortiumTerms,
    useGetUserConsortiumsWithPendingTerms
} = consortiumsAPI;

export const consortiumTermsAPI = {
    useGetConsortiumTermsGroups,
    useAgreeConsortiumTerms,
    useRevokeConsortiumTerms,
    useGetPendingConsortiumTerms,
    useGetUserConsortiumsWithPendingTerms
}

export { consortiumsAPI };
