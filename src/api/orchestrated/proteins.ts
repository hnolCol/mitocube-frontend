// src/api/orchestrated/proteins.ts

import { api } from "@/api";
import _ from "lodash"

export function usePrefetchProteins(tags: string[]) {
  const tagQueries = api.features.proteinsQuery.useGetProteins({tags}, { enabled : _.isArray(tags) && tags.length > 0, staleTime : Infinity });

  const isReady = tagQueries.every(q => q.isSuccess);

  return { isReady, tagQueries };
}