import { useQuery } from "@tanstack/react-query";
import axios from "axios"


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
