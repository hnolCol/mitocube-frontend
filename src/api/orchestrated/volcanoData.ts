
import { api } from "@/api";
import _ from "lodash";

export function usePrefetchVolcanoData(testParams: Object[] = []) {
    
  const tagQueries = api.submissions.analysis.useGetSubmissionVolcanos({testParams}, { enabled : _.isArray(testParams) && testParams.length > 0, staleTime : Infinity });

  const isReady = tagQueries.every(q => q.isSuccess);
  if (testParams.length === 0) return { isReady: true, tagQueries: [] };
  return { isReady, tagQueries };
}