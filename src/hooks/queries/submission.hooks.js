import { useMutation, useQuery } from "react-query";
import axios from "axios"
import { arrayOfObjectsToObjectByProperty} from "../../services/arrays/groupby";


// get submissions

async function getSubmissions_API({ tokenString }) {
    const res = await axios.get('/api/submissions', {
        headers: {
            "Authorization": `Bearer ${tokenString}`,
            'Content-Type': 'application/json'
        }
        })
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


async function getSubmissionAttribute_API() {
    // returns submission attributes
    const res = await axios.get('/api/attributes')
    return res.data 
}

export const useGetSubmissionAttributes = (APIParams = {}, useQueryOptions = {staleTime : Infinity}) => {
    return useQuery(["attributes"], () => getSubmissionAttribute_API({...APIParams}), useQueryOptions)

}


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

async function patchSubmission_API({ label, tokenString, data }) {
   
    const res = await axios.patch('/api/submissions/' + label + "/datasetattributes",
    data,
        {
            headers : {
                "Authorization": `Bearer ${tokenString}`,
                'Content-Type': 'application/json'
            }
        }
        )
}

export const usePatchSubmission = (useMutationOptions = {}) => {
    return useMutation((APIParams) => patchSubmission_API({...APIParams}), useMutationOptions)
}

//submission states

async function getSubmissionStates_API() {
    const res = await axios.get('/api/submissions/states')
    return res.data
}

export const useGetSubmissionStates = (APIParams = {}, useQueryOptions = {staleTime : Infinity}) => {
    return useQuery(["submissionStates"], () => getSubmissionStates_API({...APIParams}), useQueryOptions)
}