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

    const res = await axios.get('/api/data/submission/id', { params: { token: token } })
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




