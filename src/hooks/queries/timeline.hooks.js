import { useQuery } from "react-query";
import axios from "axios"



/**
 * @description Retrieves the use of terms from the backend.
 * @returns
 */
async function getTimelineBySubmissionTag_API({submission_tag}) {
    const res = await axios.get('/api/timelines', { params : {submission_tag}})
    return res.data 
}

export const useGetTimelineBySubmissionTag = (APIParams = {submission_tag},useQueryOptions = {}) => {
    return useQuery(["timelineBySubmissionTag",APIParams.submission_tag],() =>  getTimelineBySubmissionTag_API({...APIParams}), useQueryOptions)
}