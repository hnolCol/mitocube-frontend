// src/api/orchestrated/proteins.ts

import { api } from "@/api";

export function usePrefetchProteins(tags: string[]) {

  const tagQueries = api.features.proteinsQuery.useGetProteins({tags}, { enabled : tags.length > 0, staleTime : Infinity });

  const isReady = tagQueries.every(q => q.isSuccess);

  return { isReady, tagQueries };
}