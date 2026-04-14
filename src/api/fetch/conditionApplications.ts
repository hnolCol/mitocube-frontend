import { api } from "@/api";
import { queryClient } from "@/api/queryClient";


export const getConditionApplicationText = (tag) => {
  return queryClient.fetchQuery({
    queryKey: ["conditionApplicationText", tag],
    queryFn: () =>
      api.condition_applications.getConditionApplicationTextByTag_API({ tag }),
  });
};