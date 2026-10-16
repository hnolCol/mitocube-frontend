import hooks from "@mitocube/api-hooks";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "./client";

export const depositionsAPI = hooks.requests.createDepositionRequestsAPI(apiClient);

async function createDepositionRequest_API({ submission_tag, database, comment }) {
    const res = await apiClient.post(`/requests/depositions`, {
        submission_tag, database, comment
    })
    return res.data
}

const usePostDepositionRequest = (useMutationOptions = {}) => {
    return useMutation({
        mutationFn: (APIParams = { submission_tag, database, comment }) => createDepositionRequest_API({ ...APIParams }),
        ...useMutationOptions
    })
}

export const depositionRequestsAPI = {
    usePostDepositionRequest
}
