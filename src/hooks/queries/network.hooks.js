import { useQuery, useMutation } from "react-query"
import axios from "axios"
import _ from "lodash"


async function getNetwork_API({dataset_label, network_type, statProps}) {
    const res = await axios.get(`/api/networks/mitocarta/${dataset_label}`, {
        params: {
            network_type,
            impute: statProps.impute,
            sample_attribute_tag: statProps.sample_attribute_tag,
            attribute_value_tag_left: statProps.attribute_value_tag_left,
            attribute_value_tag_right: statProps.attribute_value_tag_right,
            within_attribute_tag: statProps.within_attribute_tag,
            within_attribute_value_tag : statProps.within_attribute_value_tag
        }
    })
    return res.data
}

export function useGetNetwork(APIParams = {}, useQueryOptions = { staleTime: 300000 },) {
    return useQuery(["getNetwork", APIParams.network_type, APIParams.dataset_label,
        APIParams.statProps.impute,
        APIParams.statProps.sample_attribute_tag,
        APIParams.statProps.attribute_value_tag_left,
        APIParams.statProps.attribute_value_tag_right,
        APIParams.statProps.within_attribute_tag,
        APIParams.statProps.within_attribute_value_tag,
        ], () => getNetwork_API({ ...APIParams }), useQueryOptions)
}