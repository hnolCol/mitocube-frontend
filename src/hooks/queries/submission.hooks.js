import { useMutation, useQuery } from "react-query";
import axios from "axios"
import { arrayOfObjectsToObjectByProperty} from "../../services/arrays/groupby";


// get submissions


/**
 * @description Tries to get the submission from the backend.
 * @author Hendrik Nolte 
 * @since 0.1.0
 * @returns {import("../../types/submissions").Submission[]} - Array of submissions.
 */
async function getSubmissions_API({}) {
    const res = await axios.get('/api/submissions')
    return res.data 
}

export const useGetSubmissions = (APIParams = {},useQueryOptions = {}) => {
    return useQuery(["getSubmissions"],() =>  getSubmissions_API({...APIParams}), useQueryOptions)
}


// sumbission ID
async function getSubmissionID_API(token) {

    const res = await axios.get('/api/submission/id', { params: { token: token } })
    return res.data
}

export const useGetSubmissionsID = (useQueryOptions = {}, APIParams = {}) => {
    return useQuery(["getSubmissionID"], () => getSubmissionID_API({...APIParams}), useQueryOptions)
}


// update submission samplesAttributes
async function patchSubmissionSampleAttrs_API({label,data}) {

    const res = await axios.patch('/api/submission/' + label + 'samplesAttributes', data)
    return res.data
}

export const usePathSubmissionSampleAttributes = (useMutationOptions = {}) => {
    return useMutation((APIParams) => patchSubmissionSampleAttrs_API({...APIParams}), useMutationOptions)
}







// submission help 

async function getSubmissionHelp_API(token) {

    const res = await axios.get('/api/submission/help', { params: { token: token } })
    return res.data
}


export const useGetSubmissionHelp = (useQueryOptions = {}, APIParams = {}) => {
    return useQuery(["getSubmissionHelp"], () => getSubmissionHelp_API({...APIParams}), useQueryOptions)
}



/**
 * @description Returns the attributes and attributes_values from the API.
 * @author Hendrik Nolte 
 * @since 0.1.0
 * @returns {import("../../types/attributes").AttributesAPIResponse} -  The attributes and attribute_values as an array of its type.
 */
async function getSubmissionAttribute_API() {
    // returns submission attributes
    const res = await axios.get('/api/attributes')
    return res.data 
}
export const useGetSubmissionAttributes = (APIParams = {}, useQueryOptions = {staleTime : Infinity}) => {
    return useQuery(["attributes"], () => getSubmissionAttribute_API({...APIParams}), useQueryOptions)

}

/**
 * @description Returns the attributes and attributes_values from the API and transform it to a object witht the tag as the key. This 
 * is useful when tranforming the tag based submission json objects back to the real attributes.
 * @author Hendrik Nolte 
 * @since 0.1.0
 * @returns {import("../../types/attributes").AttributesByTagAPIResponse} -  The attributes and attribute_values as an object where the tag is the key.
 */
async function getSubmissionAttributeByTag_API() {
    // returns submission attributes but puts them in a dictionary where key is the tag
    //TO DO: merge with function from above 
    const res = await axios.get('/api/attributes')    
    let attributesByTag = arrayOfObjectsToObjectByProperty(res.data.attributes,"tag")
    let attributeValuesByTag = arrayOfObjectsToObjectByProperty(res.data.attribute_values,"tag")
    return {attributes : attributesByTag, attribute_values : attributeValuesByTag}
}

export const useGetSubmissionAttributesByTag = (APIParams = {}, useQueryOptions = {staleTime : Infinity}) => {
    return useQuery(["attributes_by_tag"], () => getSubmissionAttributeByTag_API({...APIParams}), useQueryOptions)
}






// submission metatexts 


async function getSubmissionMetatexts_API({}) {
        
    const res = await axios.get('/api/submissions/metatext')
    
    return res.data 
}

export const useGetSubmissionMetatext = (APIParams = {}, useQueryOptions = {staleTime : Infinity}) => {
    return useQuery(["metatext_for_submission"], () => getSubmissionMetatexts_API({...APIParams}), useQueryOptions)
}



//submit submission

async function postSubmission_API({ submission }) {
    const res = await axios.post('/api/submissions',
        submission
        )
}

export const usePostSubmission = (useMutationOptions = {}) => {
    return useMutation((APIParams) => postSubmission_API({...APIParams}), useMutationOptions)
}

//update submission

async function patchSubmission_API({ label, data }) {
   
    const res = await axios.patch('/api/submissions/' + label + "/datasetattributes",
    data)
}

export const usePatchSubmission = (useMutationOptions = {}) => {
    return useMutation((APIParams) => patchSubmission_API({...APIParams}), useMutationOptions)
}

/**
 * @description Returns the available states of a submission from the API.
 * @author Hendrik Nolte 
 * @since 0.1.0
 * @returns {import("../../types/states").StatesResponse} - The available states.
 */
async function getSubmissionStates_API() {
    const res = await axios.get('/api/submissions/states')
    return res.data
}

export const useGetSubmissionStates = (APIParams = {}, useQueryOptions = {staleTime : Infinity}) => {
    return useQuery(["submissionStates"], () => getSubmissionStates_API({...APIParams}), useQueryOptions)
}



/**
 * @description Creates a run list for the dataset 
 * @author Hendrik Nolte
 * @since 0.1.0 
 * @param {Object} props 
 * @param {String} props.submission_label - The label of the submission/dataset 
 * @param {Objet} props.runlist_props - The runlist properties. 
 * @returns {Object} The created runlist, if success. Otherwise an empty object.
 */
async function postRunlist_API({submission_label, runlist_props}) {
    const res = await axios.post(`/api/submissions/${submission_label}/runlist`,runlist_props)
    return res.data
}

export const usePostRunlist = (useMutationOptions = {}) => {
    return useMutation((APIParams) => postRunlist_API({...APIParams}), useMutationOptions)
}



/**
 * @param {Object} props 
 * @param {String} props.submission_label 
 * @returns {import("../../types/submissions").Runlist} 
 */
async function getRunlist_API({submission_label}) {
    const res = await axios.get(`/api/submissions/${submission_label}/runlist`)
    return res.data
}
export const useGetRunlist = (APIParams = {}, useQueryOptions = {staleTime : 3000000}) => {
    return useQuery(["submissionStates",APIParams.submission_label], () => getRunlist_API({...APIParams}), useQueryOptions)
}
