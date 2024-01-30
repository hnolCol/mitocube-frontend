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
 * @param {string} props.feature_key - The featureID. For proteins likely the uniprot id. 
 * @returns {import("../../types/feature").FeatureDataResponse} The feature data object. Contains all the datasets in which the feature_id was found.
 */
async function getDataByFeatureID_API({ feature_key }) {
    const res = await axios.get(`/api/features/${feature_key}/data`)
    return res.data
    }

export function useGetDataByFeatureID(APIParams = {}, useQueryOptions = {staleTime : 600000}, ) {
    return useQuery(["getDataByFeautreID",APIParams.feature_key],() =>  getDataByFeatureID_API({...APIParams}), useQueryOptions)
}



/**
 * @description - Returns the annotatio present in the database for a particular feature.
 * @param {object} props
 * @param {string} props.featureID - The featureID. For proteins likely the uniprot id. 
 * @returns {} The feature annotation data object.
 */
async function getAnnotationsByFeatureID_API({ featureID }) {
    const res = await axios.get(`/api/features/${featureID}/annotation`)
    return res.data
}

export function useGetAnnotationsByFeatureID(APIParams = {}, useQueryOptions = {}, ) {
    return useQuery(["getDataByFeautreID",APIParams.featureID],() =>  getAnnotationsByFeatureID_API({...APIParams}), useQueryOptions)
}


/**
 * 
 * @param {Object} props
 * @param {import("../../types/feature").Feature} props.feature
 * @returns 
 */
async function getSequenceByFeatureKey_API({ feature }) {
    const res = await axios.get(`/api/features/${feature.key}/sequence`)
    return res.data
}

export function useGetSequenceByFeatureKey(APIParams = {}, useQueryOptions = {staleTime : Infinity}, ) {
    return useQuery(["getFeatureSequence",APIParams.feature.key],() =>  getSequenceByFeatureKey_API({...APIParams}), useQueryOptions)
}



/**
 * 
 * @param {Object} props
 * @param {String} props.query
 * @returns 
 */
async function findFeatureByQuery_API({ query, proteome_id }) {
    const res = await axios.get("/api/features", { params: { query, proteome_id } })
    return res.data
}

export function useGetFeatureByQuery(APIParams = {}, useQueryOptions = {staleTime : Infinity}, ) {
    return useQuery(["findFeature",APIParams.query],() =>  findFeatureByQuery_API({...APIParams}), useQueryOptions)
}




