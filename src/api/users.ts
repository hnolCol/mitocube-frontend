import hooks from "@mitocube/api-hooks";
import { apiClient } from "./client";

export const usersViewsAPI = hooks.users.views.createUserViewsAPI(apiClient);
export const userActiveAPI = hooks.users.createQueryUserActiveAPI(apiClient);
export const userCountAPI = hooks.users.createQueryUserCountAPI(apiClient);
export const queryUserByQueryAPI = hooks.users_query.createQueryUsersByQueryAPI(apiClient);
export const userRolesAPI = hooks.users.createQueryUserRolesAPI(apiClient);
export const userModifyAPI = hooks.users.createEditUserAPI(apiClient);
export const userCoreAPI = hooks.users.createCoreUsersAPI(apiClient);

