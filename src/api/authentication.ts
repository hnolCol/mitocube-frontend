import hooks from "@mitocube/api-hooks";
import { apiClient } from "./client";


export const userLogin = hooks.authorization.login.createAuthenticationAPI(apiClient);
export const tokenAuthentication = hooks.authorization.token.createAuthenticationTokenAPI(apiClient);


