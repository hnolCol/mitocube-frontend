import { useQuery } from "react-query"
import axios from "axios"

async function getFeatureDetails_API({filter = {}, token = ""}){
    //fetch data from api
    const res = await axios.post("/api/features/details",
        { filter: filter, token: token },
        { headers: { 'Content-Type': 'application/json' } })
    return res.data
}

export function useGetFeatures (useQueryOptions = {}, APIParams = {}) {
    return useQuery(["getFeatureDeatails"],() =>  getFeatureDetails_API({...APIParams}), useQueryOptions)
}
