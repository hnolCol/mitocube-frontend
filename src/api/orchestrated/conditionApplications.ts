// src/api/conditionApplications.ts

import { api } from "@/api";
import _ from "lodash";

export function usePrefetchConditionApplicationTexts(tags: string[] = []) {
  const validTags = tags.filter(_.isString)
  const tagQueries = api.condition_applications.useGetConditionApplicationTexts({tags : validTags}, { enabled : validTags.length > 0, staleTime : Infinity });

  const isReady = tagQueries.every(q => q.isSuccess);
  if (validTags.length === 0) return { isReady: true, tagQueries: [], tags: [] };
  return { isReady, tagQueries, tags: validTags };
}
