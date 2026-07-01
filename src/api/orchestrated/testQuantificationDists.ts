// src/api/conditionApplications.ts

import { api } from "@/api";
import _ from "lodash";

export function usePrefetchTestQuantificationDistributions({tag, annotation_tag, quantification_type, testParams = []}) {
    console.log(testParams)
  const tagQueries = api.submissions.quantifications.useGetTestQuantificationDistributions({tag, annotation_tag, quantification_type, testParams}, { enabled : _.isArray(testParams) && testParams.length > 0, staleTime : Infinity });

  const isReady = tagQueries.every(q => q.isSuccess);
  if (testParams.length === 0) return { isReady: true, tagQueries: [] };
  return { isReady, tagQueries };
}