import { useQuery } from "react-query";
import axios from "axios"


async function getDatasetQC_API({ dataset_tag }) {
    console.log(dataset_tag)
    const res = await axios.get('/api/datasets/'+dataset_tag+'/qc',
    )
    return res.data
}

export const useGetDataQC = (APIParams = {}, useQueryOptions = {staleTime : Infinity}) => {
    return useQuery(["getDatasetTable",APIParams.dataset_tag],() => getDatasetQC_API({...APIParams}), useQueryOptions)
}

//meta data 
/**
 * 
 * @param {Object} API_Params 
 * @param {string} API_Params.tag - The submission/dataset tag.
 * @returns {import("../../types/submissions").Submission} - The submission metadata.
 */
async function getDatasetMetadata_API({ tag}) {
    const res = await axios.get('/api/datasets/'+tag+'/meta')
    return res.data
}

export const useGetMetadata = (APIParams = {}, useQueryOptions = {}) => {
    return useQuery(["getDatasetMeta",APIParams.tag],() => getDatasetMetadata_API({...APIParams}), useQueryOptions)
}


/**
 * 
 * @param {Object} API_Params 
 * @param {string} API_Params.dataset_tag - The submission/dataset tag.
 * @returns {Object} - The submission sample attribute.
 */
async function getDatasetSamplesMetadata_API({ dataset_tag }) {
    const res = await axios.get('/api/datasets/'+dataset_tag+'/meta/samples')
    return res.data
}

export const useGetMetaSamples = (APIParams = {}, useQueryOptions = {}) => {
    return useQuery(["getDatasetSampleMeta",APIParams.dataset_tag],() => getDatasetSamplesMetadata_API({...APIParams}), useQueryOptions)
}







/**
 * 
 * @param {Object} props
 * @param {string} props.dataset_label - The dataset unique label.
 * @returns {import("../../types/datasets").DatasetPCAResponse} - The API response for a principal component analysis.
 */
async function getDatasetPCA_API({ dataset_tag }) {
    const res = await axios.get('/api/datasets/'+dataset_tag+'/pca'
    )
    return res.data

}

export const useGetDatasetPCA = (APIParams = {}, useQueryOptions = {staleTime : Infinity}) => {
    return useQuery(["getDatasetPCA",APIParams.dataset_tag],() => getDatasetPCA_API({...APIParams}), useQueryOptions)
}

//// 






// get all datasets and its details from the API 
async function getDatasets_API(filters) {
    const res = await axios.get('/api/dataset/details', { params: { filters : filters } })
    return res.data 
}

export const useGetDatasets = (filters = {}, useQueryOptions = {}) => {
    return useQuery(["getDatasets",filters],() => getDatasets_API(filters), useQueryOptions)
}


async function getDatasetInfo_API({ token, dataID }) {
    const res = await axios.get('/api/dataset/info', { params: { token, dataID } })
    return res.data 
}

export const useGetDatasetInfo = (datasetInfo = {}, useQueryOptions = {}) => {
    return useQuery(["getDatasetInfo",datasetInfo.dataID],() => getDatasetInfo_API(datasetInfo), useQueryOptions)
}

// Heatmap for dataset

async function getDatasetHeatmap_API({ dataset_tag }) {
    const res = await axios.get(`/api/datasets/${dataset_tag}/heatmap`, { params: { }})
    return res.data 
}

export const useGetDatasetHeatmap = (APIParams = {}, useQueryOptions = {staleTime : Infinity}) => {
    return useQuery(["getHeatmap", APIParams.dataset_tag], () => getDatasetHeatmap_API({ ...APIParams }), useQueryOptions)
}


// Volcano for dataset

async function getDatasetVolcano_API({ dataset_tag, testParams }) {
    const res = await axios.get(`/api/datasets/${dataset_tag}/volcano`, { params: testParams })
    return res.data 
}

export const useGetDatasetVolcano = (APIParams = {}, useQueryOptions = {}) => {
    return useQuery(["getVolcano",
        APIParams.dataset_tag,
        APIParams.attribute_left_tag,
        APIParams.attribute_right_tag,
        APIParams.sample_attribute_tag,
        APIParams.within_attribute_tag,
        APIParams.within_attribute_value_tag,
        APIParams.impute], () => getDatasetVolcano_API({ ...APIParams }), useQueryOptions)
}




// MitoMap



async function getDatasetMitoloc_API({ token, dataID, grouping }) {
   
    const res = await axios.get('/api/dataset/mitoloc', { params: { token, dataID, ...grouping }})
    return res.data 
}

export const useGetDatasetMitoLoc = (datasetInfo = {dataID : "", token : ""}, useQueryOptions = {}) => {
    console.log(datasetInfo)
    return useQuery(["getMitoLoc",datasetInfo.dataID],() => getDatasetMitoloc_API(datasetInfo), useQueryOptions)
}
