import { useQuery } from "react-query";
import axios from "axios"



/**
 * @description Retrieves the use of terms from the backend.
 * @returns
 */
async function getTerms_API({}) {
    const res = await axios.get('/api/info/terms')
    return res.data 
}

export const useGetTermsOfUse = (APIParams = {},useQueryOptions = {}) => {
    return useQuery(["getTermsOfUse"],() =>  getTerms_API({...APIParams}), useQueryOptions)
}