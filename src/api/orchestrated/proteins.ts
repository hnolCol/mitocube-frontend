// src/api/orchestrated/proteins.ts

import { api } from "@/api";
import _ from "lodash"

export function usePrefetchProteins(tags: string[]) {
  
  const tagQueries = api.features.proteinsQuery.useGetProteins({tags}, { enabled : _.isArray(tags) && tags.length > 0, staleTime : Infinity });

  const isReady = tagQueries.every(q => q.isSuccess);
  const isLoading = tagQueries.some(q => q.isLoading);
  if (tags.length === 0) return { isReady: true, tagQueries: [], isLoading: false };
  return { isReady, tagQueries, isLoading };
}

export function usePrefetchInterproFeatures(tags: string[]) {
  const tagQueries = api.features.proteinsQuery.useGetProteinsInterproFeatures({ tags }, { enabled: _.isArray(tags) && tags.length > 0, staleTime: Infinity });
  console.log(tagQueries, "tagQueries")
  if (tags.length === 0) return { isReady: true, tagQueries: [], isLoading: false };
  const isReady = tagQueries.every(q => q.isSuccess);
  const isLoading = tagQueries.some(q => q.isLoading);
    return {isReady, isLoading, tagQueries };
}