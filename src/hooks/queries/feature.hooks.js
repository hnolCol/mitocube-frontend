import { useQuery } from "react-query"
import axios from "axios"
import _ from "lodash"

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
 * @param {string} props.feature_tag - The feature tag. For proteins likely the uniprot id. 
 * @returns {import("../../types/feature").FeatureDataResponse} The feature data object. Contains all the datasets in which the feature_id was found.
 */
async function getDataByFeatureID_API({ feature_tag }) {
    const res = await axios.get(`/api/features/${feature_tag}/data`)
    return res.data
    }

export function useGetDataByFeatureID(APIParams = {}, useQueryOptions = {staleTime : Infinity}, ) {
    return useQuery(["getDataByFeautreKey",APIParams.feature_tag],() =>  getDataByFeatureID_API({...APIParams}), useQueryOptions)
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
 * @param {String[]} props.proteome_ids
 * @returns 
 */
async function findFeatureByQuery_API({ query, proteome_ids }) {
    const res = await axios.get("/api/features", { params: { query, proteome_ids : _.join(proteome_ids,";") } })
    return res.data
}

export function useGetFeatureByQuery(APIParams = {}, useQueryOptions = { staleTime: Infinity },) {
    const proteome_string = _.has(APIParams,"proteome_ids") && _.isArray(APIParams.proteome_ids) ? _.join(APIParams.proteome_ids,";") : "" 
    return useQuery(["findFeature",APIParams.query,proteome_string],() =>  findFeatureByQuery_API({...APIParams}), useQueryOptions)
}



/**
 * 
 * @param {Object} props
 * @param {String} props.tag - The feature tag (e.g. Uniprot ID)
 * @returns 
 */
async function featureInfoByTag_API({ tag }) {
    const res = await axios.get(`/api/features/${tag}/i`, { })
    return res.data
}

export function useGetFeatureInfo(APIParams = {tag}, useQueryOptions = { }) {
    return useQuery(["infoFeature",APIParams.tag],() =>  featureInfoByTag_API({...APIParams}), useQueryOptions)
}





/**
 * 
 * @param {Object} props
 * @param {String} props.tag - The feature tag (e.g. Uniprot ID)
 * @returns 
 */
async function featureFStat_API({ tag }) {
    const res = await axios.get(`/api/features/${tag}/f`, { })
    return res.data
}

export function useGetFeatureFStats(APIParams = {}, useQueryOptions = { }) {
    return useQuery(["infoFeature",APIParams.tag],() =>  featureFStat_API({...APIParams}), useQueryOptions)
}




/**
 * 
 * @param {Object} props
 * @param {String} props.tag - The feature tag (e.g. Uniprot ID)
 * @returns {import("../../types/feature").Feature}
 */
async function feature_API({ tag }) {
    const res = await axios.get(`/api/features/${tag}`, { })
    return res.data
}
export function useGetFeatureByTag(APIParams = {tag }, useQueryOptions = {}) {
    return useQuery(["feature",APIParams.tag],() =>  feature_API({...APIParams}), useQueryOptions)
}


/**
 * 
 * @param {Object} props
 * @param {String} props.tag - The feature tag (e.g. Uniprot ID)
 * @returns {Object} The distribution of the abundance of the feature across the database
 */
async function featureAbundance_API({ tag }) {
    const res = await axios.get(`/api/features/${tag}/abundance`, { })
    return res.data
}
export function useGetFeatureAbundanceByTag(APIParams = {tag}, useQueryOptions = {}) {
    return useQuery(["featureAbudannceDist",APIParams.tag],() =>  featureAbundance_API({...APIParams}), useQueryOptions)
}



