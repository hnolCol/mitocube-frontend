import { useQuery, useMutation } from "react-query"
import axios from "axios"
import _ from "lodash"


/**
 * @description Finds a symtom by its search string.
 * @returns {String[]} - The tags matching the search string. 
 */
async function getSymptom_API({search_string, limit}) {
    const res = await axios.get(`${config.baseURL}/maintenance/symptoms/q`, { params: { search_string, limit } })
    console.log(res.data)
    return res.data 
}

export const useGetSymptomByQuery = (APIParams = {search_string : "", limit : 5}, useQueryOptions = {stateTime : 200000, placeholderData: (prev) => prev}) => {
    return useQuery(["getSymptomBySearchString", APIParams.search_string],() =>  getSymptom_API({...APIParams}), useQueryOptions)
}


/**
 * @description  Returns a symptom by its tag. 
 * @returns {String[]} - The tags matching the search string. 
 */
async function getSymptomByTag_API({tag}) {
    const res = await axios.get(`${config.baseURL}/maintenance/symptoms/${tag}`)
    return res.data 
}

export const useGetSymptomByTag = (APIParams = { tag }, useQueryOptions = {stateTime : 200000}) => {
    return useQuery(["getSymptomBy", APIParams.tag],() =>  getSymptomByTag_API({...APIParams}), useQueryOptions)
}

/**
 * @description Checks if the symptom exists.
 * @returns {Boolean} - If the symptom exists. 
 */
async function checkSymptomExists_API({ tag }) {
    const res = await axios.get(`${config.baseURL}/maintenance/symptoms/${tag}/exists`)
    return res.data 
}

export const useCheckSymptomExists = (APIParams = { tag }, useQueryOptions = {stateTime : 200000}) => {
    return useQuery(["checkSymptomExists", APIParams.tag],() =>  checkSymptomExists_API({...APIParams}), useQueryOptions)
}

/** 
 * @description Returns all symptoms.
 * @returns  - The list of symptoms. 
 */

async function getSymptoms_API() {
    const res = await axios.get(`${config.baseURL}/maintenance/symptoms`);
    return res.data;
}
export const useGetSymptoms = (useQueryOptions = { staleTime: 30000 }) => {
    return useQuery(["getSymptoms"], () => getSymptoms_API(), useQueryOptions);
}


/**
 * @description Returns the symptom text .
 * @returns  - The symptom texts.
 */

async function useGetSymptomText_API({ tag }) {
    const res = await axios.get(`${config.baseURL}/maintenance/symptoms/${tag}/text`); 
    return res.data;
}
export const useGetSymptomText = (APIParams={tag},useQueryOptions = { staleTime: 30000 }) => {
    return useQuery(["getSymptomText",APIParams.tag], () => useGetSymptomText_API({...APIParams}), useQueryOptions);        
}

/**
 * @description Returns the symptom descriptions for all symptoms.
 * @returns  - The symptom descriptions.        
 */
async function useGetSymptomDescription_API({ tag }) {
    const res = await axios.get(`${config.baseURL}/maintenance/symptoms/${tag}/description`); 
    return res.data;
}
export const useGetSymptomDescription = (APIParams= {tag}, useQueryOptions = { staleTime: 30000 }) => {
    return useQuery(["getSymptomDescription", APIParams.tag], () => useGetSymptomDescription_API({...APIParams}), useQueryOptions);        
}

/**
 * @description Returns the symptom priorities for all symptoms.
 * @returns  - The symptom priorities.              
 */
async function useGetSymptomPriority_API({ tag }) {
    const res = await axios.get(`${config.baseURL}/maintenance/symptoms/${tag}/priority`); 
    return res.data;
}
export const useGetSymptomPriority = (APIParams= {tag},useQueryOptions = { staleTime: 30000 }) => {
    return useQuery(["getSymptomPriority", APIParams.tag], () => useGetSymptomPriority_API({...APIParams}), useQueryOptions);        
}

/**
 * @description Inserts a new symptom.
 * @returns {Boolean} - If the insertion was successful. 
 */
async function postSymptom_API({  tag, text, description, priority }) {
    const res = await axios.post(`${config.baseURL}/maintenance/symptoms/`, { tag, text, description,  priority })
    return res.data 
}

export const usePostSymptom = (useMutationOptions = {}) => {
    return useMutation((APIParams) => postSymptom_API({ ...APIParams }), useMutationOptions)
}

/**
 * @description Edits an existing symptom.
 * @returns {Boolean} - If the editing was successful. 
 */
async function editSymptom_API({ tag, text, description,  priority }) {
    const res = await axios.put(`${config.baseURL}/maintenance/symptoms/${tag}`, { text, description,  priority })
    return res.data 
}

export const useEditSymptom = (useMutationOptions = {}) => {
    return useMutation((APIParams) => editSymptom_API({ ...APIParams }), useMutationOptions)
}

/**
 * @description Deletes an existing symptom.
 * @returns {Boolean} - If the deletion was successful.    
 */
async function deleteSymptom_API({ tag }) {
    const res = await axios.delete(`${config.baseURL}/maintenance/symptoms/${tag}`)
    return res.data 
}

export const useDeleteSymptom = (useMutationOptions = {}) => {
    return useMutation((APIParams) => deleteSymptom_API({ ...APIParams }), useMutationOptions)
}


/**
 * 
 * @param {Object} props 
 * @param {String} props.description
 * @param {String} props.instrument_tag    
 * @param {String} props.instrument_state_tag The new instrument state tag
 * @description Create a new maintenance event. Endpoint: POST '/api/maintenance/'
 * @returns 
 */
async function postMaintenanceEvent_API({ description, instrument_tag, instrument_state_tag, symptom_tags = []}) {
    const res = await axios.post(`${config.baseURL}/maintenance/`,
        { description, instrument_tag, instrument_state_tag, symptom_tags }
    )
    return res.data 
}   
export const usePostMaintenanceEvent = (useMutationOptions = {}) => {
    return useMutation((APIParams) => postMaintenanceEvent_API({ ...APIParams }), useMutationOptions)
}   