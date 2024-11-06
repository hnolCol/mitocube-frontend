import { useMutation, useQuery } from "react-query";
import axios from "axios"
import { arrayOfObjectsToObjectByProperty} from "../../services/arrays/groupby";


// get submissions


/**
 * @description Tries to get the submission from the backend. Returns submission in the database. Should not be 
 * used if a large number of submission are present. 
 * @returns {import("../../types/submissions").Submission[]} - Array of submissions.
 */
async function getSubmissions_API({}) {
    const res = await axios.get('/api/submissions')
    return res.data 
}

export const useGetSubmissions = (APIParams = {},useQueryOptions = {}) => {
    return useQuery(["getSubmissions"],() =>  getSubmissions_API({...APIParams}), useQueryOptions)
}




/**
 * @description Gets submissions by a query. Filtering is allowed by attribute_tag, attribute_value_tag, feature_key, genotype_label and state.
 * @returns {import("../../types/submissions").Submission[]} - Array of submissions.
 */
async function getSubmissionsByQuery_API({query,attribute_tag,attribute_value_tag, feature_key, genotype_tag,state, user_tag}) {
    const res = await axios.get('/api/submissions/q',{ params : {query, attribute_tag,attribute_value_tag,feature_key,genotype_tag,state,user_tag}})
    return res.data 
}

export const useGetSubmissionByQuery = (APIParams = {},useQueryOptions = {}) => {
    return useQuery(["getSubmissions",
        APIParams.query,
        APIParams.attribute_tag,
        APIParams.genotype_tag,
        APIParams.feature_key,
        APIParams.state,
        APIParams.user_tag,
        APIParams.attribute_value_tag],
        () => getSubmissionsByQuery_API({ ...APIParams }), useQueryOptions)
}


async function getSubmissionsCount_API({group, tags}) {
    const res = await axios.get('/api/submissions/count',{params : {group, tags}})
    return res.data 
}

export const useGetSubmissionsCount = (APIParams = {group : "state", tags : null},useQueryOptions = {}) => {
    return useQuery(["getSubmissionsCount",APIParams.group,APIParams.labels],
        () => getSubmissionsCount_API({ ...APIParams }), useQueryOptions)
}



// change_owner of submission
async function postSubmissionOwner_API({ submission_tag, user_tag }) {
    const res = await axios.post(`/api/submissions/${submission_tag}/owner`, {}, {params : {user_tag}}
        )
}

export const usePostSubmissionOwner = (useMutationOptions = {}) => {
    return useMutation((APIParams) => postSubmissionOwner_API({...APIParams}), useMutationOptions)
}




/**
 * @description Returns the public information about the users. Still requires a valid token string. 
 * Public indicates here that it is available to all registered users. The default stale time is 250000. 
 * @param {Object} props 
 * @param {String} props.tag - The submission/dataset tag to get the users for 
 * @returns {import("../../types/users").PublicUser[]} The public information about the users in the database as an array.
 */
async function getPublicUsersBySubmission_API({ dataset_tag }) {
    const res = await axios.get(`/api/submissions/${dataset_tag}/users`)
    return res.data
}

export const useGetPublicUserForSubmission = (APIParams = {}, useQueryOptions = {staleTime: 250000}) => {
    return useQuery(["getPublicUserByDatasetTag",APIParams.dataset_tag],() =>   getPublicUsersBySubmission_API({...APIParams}), useQueryOptions)
}








// sumbission ID
async function getSubmissionID_API({}) {

    const res = await axios.get('/api/submission/tag')
    return res.data
}

export const useGetSubmissionsID = (APIParams = {},useQueryOptions = {}) => {
    return useQuery(["getSubmissionTAG"], () => getSubmissionID_API({...APIParams}), useQueryOptions)
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
 * @description Returns the attributes and attributes_values from the API and transform it to a object with the tag as the key. This 
 * is useful when tranforming the tag based submission json objects back to the attributes with properties.
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
async function getSubmissionMetatextsByTag_API({tag}) {
    const res = await axios.get(`/api/submissions/${tag}/metatext`)
    return res.data 
}
export const useGetSubmissionMetatextByTag = (APIParams = {}, useQueryOptions = {staleTime : Infinity}) => {
    return useQuery(["metatext_for_submission",APIParams.tag], () => getSubmissionMetatextsByTag_API({...APIParams}), useQueryOptions)
}




// submission metatexts
async function getSubmissionMetatexts_API({}) {
        
    const res = await axios.get(`/api/submissions/metatext`)
    
    return res.data 
}
export const useGetSubmissionMetatext = (APIParams = {}, useQueryOptions = {staleTime : Infinity}) => {
    return useQuery(["metatext_for_submission"], () => getSubmissionMetatexts_API({...APIParams}), useQueryOptions)
}

//update submission metatexts
async function postSubmissionMetatext_API({ label, metatext }) {
    const res = await axios.patch('/api/submissions/' + label + '/metatext',
        metatext
        )
}
export const usePatchSubmissionMetatext = (useMutationOptions = {}) => {
    return useMutation((APIParams) => postSubmissionMetatext_API({...APIParams}), useMutationOptions)
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

async function patchSubmission_API({ tag, datasetAttributes }) {
    const res = await axios.patch(`/api/submissions/${tag}/datasetattributes`, datasetAttributes)
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








/**
 * 
 * @param {Object} props
 * @param {String} props.tag
 * @returns {import("../../types/attributes").DatasetAttributesAPIResponse}
 */
async function getSubmissionDatasetAttributes_API({ tag }) {
    const res = await axios.get(`/api/submissions/${tag}/datasetattributes`)
    return res.data 
}

export const useGetSubmissionDatasetAttributesByTag = (APIParams = {}, useQueryOptions = {}) => {
    return useQuery(["submission_dataset_attributes",APIParams.tag], () => getSubmissionDatasetAttributes_API({...APIParams}), useQueryOptions)
}



/**
 * @description Returns a summary string of a submission. It is meant to be copied into 
 * Excel for a quick way to provide the metadata information. 
 * @param {Object} props
 * @param {String} props.tag
 * @returns {String} - The summary string of the submission given by its tag. 
 */
async function getSubmissionSummary_API({ tag }) {
    const res = await axios.get(`/api/submissions/${tag}/summary`)
    return res.data 
}

export const useGetSubmissionSummaryString = (APIParams = {}, useQueryOptions = {}) => {
    return useQuery(["submission_summary_string",APIParams.tag], () => getSubmissionSummary_API({...APIParams}), useQueryOptions)
}



/**
 * @description Returns the sample names of a submission including the replicate, the index, and the name. It
 * is meant for copying it to Excel (tab separated.)
 * @param {Object} props
 * @param {String} props.tag
 * @returns {String} - The submission sample names. 
 */
async function getSubmissionSampleNames_API({ tag }) {
    const res = await axios.get(`/api/submissions/${tag}/samples`)
    return res.data 
}

export const useGetSubmissionSampleNames = (APIParams = {}, useQueryOptions = {}) => {
    return useQuery(["submission_samples",APIParams.tag], () => getSubmissionSampleNames_API({...APIParams}), useQueryOptions)
}

