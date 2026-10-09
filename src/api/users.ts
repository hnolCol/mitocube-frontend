import hooks from "@mitocube/api-hooks";
import { apiClient } from "./client";

export const usersViewsAPI = hooks.users.views.createUserViewsAPI(apiClient);
export const userActiveAPI = hooks.users.createQueryUserActiveAPI(apiClient);
export const userCountAPI = hooks.users.createQueryUserCountAPI(apiClient);
export const queryUserByQueryAPI = hooks.users_query.createQueryUsersByQueryAPI(apiClient);
export const userRolesAPI = hooks.users.createQueryUserRolesAPI(apiClient);
export const userCoreAPI = hooks.users.createCoreUsersAPI(apiClient);
export const userEditAPI = hooks.users.createEditUserAPI(apiClient);

import { useMutation } from "@tanstack/react-query";
import { apiClient } from "./client";

async function postUserWithGroupTags_API({ firstname, lastname, email, role, research_group_tags, institute }) {
    const res = await apiClient.post('/users', { firstname, lastname, email, role, research_group_tags, institute })
    return res.data
}

export const userCreateAPI = {
    usePostUser: (useMutationOptions = {}) => useMutation({
        mutationFn: (APIParams) => postUserWithGroupTags_API({ ...APIParams }),
        ...useMutationOptions
    })
};
