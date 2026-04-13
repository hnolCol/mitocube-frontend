import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios"
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

export const usePostRunlist = (options = {}) => {
    return useMutation({
        mutationFn: (APIParams) => postRunlist_API({...APIParams}),
        ...options
    })
}



async function getSubmissionTag_API({}) {
    const res = await axios.get('/api/submissions/tag')
    return res.data
}

export const useGetSubmissionTag = (APIParams = {}, useQueryOptions = {}) => {
    return useQuery({
        queryKey: ["getSubmissionTAG"],
        queryFn: () => getSubmissionTag_API({...APIParams}),
        ...useQueryOptions
    })
}

// submission metatexts
async function getSubmissionMetatexts_API({}) {
    const res = await axios.get(`/api/submissions/metatext`)
    return res.data 
}

export const useGetSubmissionMetatext = (APIParams = {}, useQueryOptions = {staleTime: Infinity}) => {
    return useQuery({
        queryKey: ["metatext_for_submission"],
        queryFn: () => getSubmissionMetatexts_API({...APIParams}),
        ...useQueryOptions
    })
}

// submit submission
async function postSubmission_API({ submission }) {
    const res = await axios.post('/api/submissions', submission)
    return res.data
}

export const usePostSubmission = (useMutationOptions = {}) => {
    return useMutation({
        mutationFn: (APIParams) => postSubmission_API({...APIParams}),
        ...useMutationOptions
    })
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
    return useQuery({
        queryKey: ["submission_summary_string", APIParams.tag],
        queryFn: () => getSubmissionSummary_API({...APIParams}),
        ...useQueryOptions
    })
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
    return useQuery({
        queryKey: ["submissionStates", APIParams.submission_label],
        queryFn: () => getRunlist_API({...APIParams}),
        ...useQueryOptions
    } )
}

