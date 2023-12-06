import { useQuery } from "react-query";
import axios from "axios"


async function getDatasetForSelection_API({ tokenString }) {
    const res = axios.get('/api/datasets',
    {
        headers: {
            "Authorization": `Bearer ${tokenString}`,
            'Content-Type': 'application/json'
        }
      })
    return res.data
}

export const useGetDatasetForSelection = (APIParams = {}, useQueryOptions = {}) => {
    return useQuery(["getDatasetForSelection"],() =>  getDatasetForSelection_API({...APIParams}), useQueryOptions)
}



//data table 

async function getDatasetQC_API({ tokenString, dataset_label }) {
    const res = await axios.get('/api/datasets/'+dataset_label+'/qc',
    )
    return res.data
}

export const useGetDataQC = (APIParams = {}, useQueryOptions = {staleTime : Infinity}) => {
    return useQuery(["getDatasetTable",APIParams.dataset_label],() => getDatasetQC_API({...APIParams}), useQueryOptions)
}

//meta data 

async function getDatasetMetadata_API({ dataset_label }) {
    const res = await axios.get('/api/datasets/'+dataset_label+'/meta'
    )
    return res.data

}

export const useGetMetadata = (APIParams = {}, useQueryOptions = {}) => {
    return useQuery(["getDatasetMeta",APIParams.dataset_label],() => getDatasetMetadata_API({...APIParams}), useQueryOptions)
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

async function getDatasetHeatmap_API({ token, dataID, anovaDetails }) {
    console.log(anovaDetails, dataID, token)
    const res = await axios.get('/api/data/heatmap', { params: { token, dataID, ...anovaDetails }})
    return res.data 
}

export const useGetDatasetHeatmap = (datasetInfo = {}, useQueryOptions = {}) => {
    console.log(datasetInfo)
    return useQuery(["getHeatmap",datasetInfo.dataID],() => getDatasetHeatmap_API(datasetInfo), useQueryOptions)
}


// Volcano for dataset

async function getDatasetVolcano_API({ token, dataID, anovaDetails }) {
    console.log(anovaDetails, dataID, token)
    const res = await axios.get('/api/data/volcano', { params: { token, dataID, ...anovaDetails }})
    return res.data 
}

export const useGetDatasetVolcano = (datasetInfo = {dataID : "", token : ""}, useQueryOptions = {}) => {
    console.log(datasetInfo)
    return useQuery(["getVolcano",datasetInfo.dataID],() => getDatasetVolcano_API(datasetInfo), useQueryOptions)
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
