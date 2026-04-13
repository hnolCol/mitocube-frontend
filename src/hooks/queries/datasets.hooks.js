import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios"
async function getFeatureCorrelationsInDataset_API({ submission_tag, feature_tag, filter_tag, direction, limit, min_data_points}) {
   
    const res = await axios.get(`/api/datasets/${submission_tag}/correlation/${feature_tag}`, { params: {filter_tag, direction, limit, min_data_points}})
    return res.data 
}

export const useGetFeatureCorrelationInDataset = (APIParams = { submission_tag, feature_tag, filter_tag, direction, limit, min_data_points }, useQueryOptions = {}) => {
    return useQuery({
        queryKey: ["getSubmissionFeatureCorrelation", APIParams],
        queryFn: () => getFeatureCorrelationsInDataset_API(APIParams),
        ...useQueryOptions
    })
}
