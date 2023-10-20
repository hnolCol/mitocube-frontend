import { useQuery } from "react-query";
import axios from "axios"


// get submissions

async function getSubmissions_API(token) {
    const res = await axios.get('/api/admin/submissions', { params: {token : token} })
    return res.data 

}

export const useGetSubmissions = (useQueryOptions = {}, APIParams = {}) => {
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



// submission help 

async function getSubmissionHelp_API(token) {

    const res = await axios.get('/api/submission/help', { params: { token: token } })
    return res.data
}


export const useGetSubmissionHelp = (useQueryOptions = {}, APIParams = {}) => {
    return useQuery(["getSubmissionHelp"], () => getSubmissionHelp_API({...APIParams}), useQueryOptions)
}




// submission attributes

async function getSubmissionAttribute_API({tokenString}) {
        
    const res = await axios.get('/api/attributes',
    {
        headers: {
            "Authorization": `Bearer ${tokenString}`,
            'Content-Type': 'application/json'
        }
        })
    
    return res.data 
}


export const useGetSubmissionAttributes = (APIParams = {}, useQueryOptions = {}) => {


    return useQuery(["attributes_for_submission"], () => getSubmissionAttribute_API({...APIParams}), useQueryOptions)

}


// submission metatexts 


async function getSubmissionMetatexts_API({tokenString}) {
        
    const res = await axios.get('/api/submission/metatext',
    {
        headers: {
            "Authorization": `Bearer ${tokenString}`,
            'Content-Type': 'application/json'
        }
        })
    
    return res.data 
}


export const useGetSubmissionMetatext = (APIParams = {}, useQueryOptions = {}) => {
    return useQuery(["metatext_for_submission"], () => getSubmissionMetatexts_API({...APIParams}), useQueryOptions)

}
