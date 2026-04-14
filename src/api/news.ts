import hooks from "@mitocube/api-hooks";
import { apiClient } from "./client";

export const newsAPI = hooks.news.createNewsAPI(apiClient);
