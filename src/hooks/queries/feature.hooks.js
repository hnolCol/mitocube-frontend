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



/**
 * @description - Returns the data for a specific feature (e.g. all dataset in which the feature id was found). The feature id is organism specific. 
 * @param {object} props
 * @param {string} props.featureID - The featureID. For proteins likely the uniprot id. 
 * @returns {import("../../types/feature").FeatureDataResponse} The feature data object. Contains all the datasets in which the feature_id was found.
 */
async function getDataByFeatureID_API({ featureID }) {
    //fet the data for a feature ID
   // const res = await axios.get("/api/features/data", { params: { token, featureID } })
    
    const res = await axios.get(`/api/features/${featureID}/data`)
    
    return res.data
    }


export function useGetDataByFeatureID(APIParams = {}, useQueryOptions = {}, ) {
    return useQuery(["getDataByFeautreID",APIParams.featureID],() =>  getDataByFeatureID_API({...APIParams}), useQueryOptions)
}





// get feature annotation

async function getAnnotationsByFeatureID_API({ tokenString, featureID }) {
    //TO DO add filter to select annotation 
    const res = await axios.get(`/api/features/${featureID}/annotation`,
        {
            headers: {
                "Authorization": `Bearer ${tokenString}`,
                'Content-Type': 'application/json'
            }
        })
    
    return res.data
}

export function useGetAnnotationsByFeatureID(APIParams = {}, useQueryOptions = {}, ) {
    return useQuery(["getDataByFeautreID",APIParams.featureID],() =>  getAnnotationsByFeatureID_API({...APIParams}), useQueryOptions)
}
