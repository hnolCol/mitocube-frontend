// src/api/proteins.ts

import { api } from "@/api";
import _ from "lodash"

export function usePrefetchProteins(tags: string[]) {
  const validTags = _.uniq(tags).filter(_.isString);
  const tagQueries = api.features.proteinsQuery.useGetProteins({tags: validTags}, { enabled : validTags.length > 0, staleTime : Infinity });

  const isReady = tagQueries.every(q => q.isSuccess);
  const isLoading = tagQueries.some(q => q.isLoading);
  if (validTags.length === 0) return { isReady: true, tagQueries: [], isLoading: false, tags: [] };
  return { isReady, tagQueries, isLoading, tags: validTags };
}

export function usePrefetchInterproFeatures(tags: string[]) {
  const validTags = tags.filter(_.isString)
  const tagQueries = api.features.proteinsQuery.useGetProteinsInterproFeatures({ tags: validTags }, { enabled : validTags.length > 0, staleTime : Infinity });
  if (validTags.length === 0) return { isReady: true, tagQueries: [], isLoading: false, tags: [] };
  const isReady = tagQueries.every(q => q.isSuccess);
  const isLoading = tagQueries.some(q => q.isLoading);
    return {isReady, isLoading, tagQueries, tags: validTags };
}
