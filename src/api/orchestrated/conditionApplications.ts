// src/api/conditionApplications.ts

import { api } from "@/api";


export function usePrefetchConditionApplicationTexts(tags: string[]) {

  const tagQueries = api.condition_applications.useGetConditionApplicationTexts({tags}, { enabled : tags.length > 0, staleTime : Infinity });

  const isReady = tagQueries.every(q => q.isSuccess);

  return { isReady, tagQueries };
}