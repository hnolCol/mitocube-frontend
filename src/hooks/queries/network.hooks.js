import { useQuery, useMutation } from "react-query"
import axios from "axios"
import _ from "lodash"


async function getNetwork_API({type}) {
    const res = await axios.get(`/api/networks/mitocarta`, {params : {type}})
    return res.data
}

export function useGetNetwork(APIParams = {}, useQueryOptions = { staleTime: 300000 },) {
    return useQuery(["getNetwork",APIParams.type],() =>  getNetwork_API({...APIParams}), useQueryOptions)
}

