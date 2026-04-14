import hooks from "@mitocube/api-hooks";
import { apiClient } from "./client";

export const attributesModifyAPI = hooks.attributes.createModifyAttributesAPI(apiClient);
export const attributesQueryAPI = hooks.attributes.createQueryAttributesAPI(apiClient);
export const traitsModifyAPI = hooks.traits.createModifyTraitsAPI(apiClient);
export const traitsQueryAPI = hooks.traits.createQueryTraitsAPI(apiClient);
