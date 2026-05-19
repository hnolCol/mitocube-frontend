// src/api/attributes.ts

import { api } from "@/api";

export function usePrefetchAttributes(tags: string[] = []) {
  const tagQueries = api.attributes.queryAttributes.useGetAttributes({tags}, { enabled : tags.length > 0, staleTime : Infinity });

  const isReady = tagQueries.every(q => q.isSuccess);
  if (tags.length === 0) return { isReady: true, tagQueries: [] };

  return { isReady, tagQueries };
}