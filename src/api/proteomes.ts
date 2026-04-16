import hooks from "@mitocube/api-hooks";
import { apiClient } from "./client";

export const proteomesQueryAPI = hooks.proteomes.createQueryProteomeAPI(apiClient);
export const proteomesPostAPI = hooks.proteomes.createPostProteomeAPI(apiClient);
export const proteomesCountAPI = hooks.proteomes.createQueryProteomeCountsAPI(apiClient);