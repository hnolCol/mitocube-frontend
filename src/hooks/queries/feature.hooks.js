import { useQuery } from "react-query"
import axios from "axios"

async function getFeatureDetails_API({filter = {}, token}){
    //fetch availabe features from the API. Reconsider /details 
    const res = await axios.post("/api/features/details",
        { filter: filter, token: token },
        { headers: { 'Content-Type': 'application/json' } })
    return res.data
}

export function useGetFeatures (useQueryOptions = {}, APIParams = {}) {
    return useQuery(["getFeatureDeatails"],() =>  getFeatureDetails_API({...APIParams}), useQueryOptions)
}

// get data for features 

async function getDataByFeatureID_API({ token, featureID }) {
    //fet the data for a feature ID
    const res = await axios.get("/api/features/data", { params: { token, featureID} })
return res.data
}


export function useGetDataByFeatureID(useQueryOptions = {}, APIParams = {}) {
    return useQuery(["getDataByFeautreID",APIParams.featureID],() =>  getDataByFeatureID_API({...APIParams}), useQueryOptions)
}
