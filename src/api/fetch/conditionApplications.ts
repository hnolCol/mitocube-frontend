// src/api/conditionApplications.ts

import { queryClient } from "@/api/queryClient";
import { api } from "@/api";

export const getConditionApplicationLabel = (tag) => {
  const queryKey = ["conditionApplicationText", tag];

    const cached = queryClient.getQueryData(queryKey);
    console.log(cached)
  if (cached) return cached.text ?? "";

  queryClient.prefetchQuery({
    queryKey,
    queryFn: () =>
      api.condition_applications.getConditionApplicationTextByTag_API({ tag }),
  });

  return "";
};