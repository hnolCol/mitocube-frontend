// src/api/conditionApplications.ts

import { api } from "@/api";
import _ from "lodash";

export function usePrefetchConditionApplicationTexts(tags: string[] = []) {
  const tagQueries = api.condition_applications.useGetConditionApplicationTexts({tags}, { enabled : _.isArray(tags) && tags.length > 0, staleTime : Infinity });

  const isReady = tagQueries.every(q => q.isSuccess);
  if (tags.length === 0) return { isReady: true, tagQueries: [] };
  return { isReady, tagQueries };
}