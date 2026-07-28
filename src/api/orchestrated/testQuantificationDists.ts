// src/api/conditionApplications.ts

import { api } from "@/api";
import _ from "lodash";

export function usePrefetchTestQuantificationDistributions(testParams : { tag : string, annotation_tag : string, attribute_tag : string, ca_tag_left : string, ca_tag_right : string, within_attribute_tags : string, within_ca_tags : string }[]) {
  const tagQueries = api.submissions.quantifications.useGetTestQuantificationDistributions(testParams, { enabled : _.isArray(testParams) && testParams.length > 0, staleTime : Infinity });

  const isReady = tagQueries.every(q => q.isSuccess);
  if (testParams.length === 0) return { isReady: true, tagQueries: [] };
  return { isReady, tagQueries };
}