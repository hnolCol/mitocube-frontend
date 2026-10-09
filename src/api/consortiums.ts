import hooks from "@mitocube/api-hooks";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "./client";

const consortiumsAPI = hooks.consortiums.createConsortiumsAPI(apiClient);

async function getPendingConsortiumShareRequests_API() {
    const res = await apiClient.get('/consortiums/requests/pending')
    return res.data
}

const useGetPendingConsortiumShareRequests = (useQueryOptions = {}) => {
    return useQuery({
        queryKey: ["getPendingConsortiumShareRequests"],
        queryFn: () => getPendingConsortiumShareRequests_API(),
        ...useQueryOptions
    })
}

async function approveConsortiumShareRequest_API({ consortium_tag, submission_tag }) {
    const res = await apiClient.post(`/consortiums/requests/${consortium_tag}/${submission_tag}/approve`)
    return res.data
}

const useApproveConsortiumShareRequest = (useMutationOptions = {}) => {
    return useMutation({
        mutationFn: (APIParams = { consortium_tag, submission_tag }) => approveConsortiumShareRequest_API({ ...APIParams }),
        ...useMutationOptions
    })
}

async function denyConsortiumShareRequest_API({ consortium_tag, submission_tag }) {
    const res = await apiClient.post(`/consortiums/requests/${consortium_tag}/${submission_tag}/deny`)
    return res.data
}

const useDenyConsortiumShareRequest = (useMutationOptions = {}) => {
    return useMutation({
        mutationFn: (APIParams = { consortium_tag, submission_tag }) => denyConsortiumShareRequest_API({ ...APIParams }),
        ...useMutationOptions
    })
}

export const pendingConsortiumShareRequestsAPI = {
    useGetPendingConsortiumShareRequests,
    useApproveConsortiumShareRequest,
    useDenyConsortiumShareRequest
}

export { consortiumsAPI };
