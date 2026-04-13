import { useQuery, useMutation } from "@tanstack/react-query"
import axios from "axios"

/**
 * @description Returns phenotypes by tag, or query. If a tag is given, the backend will ignore the query. 
 * Provide a limit integer to get a maximum of $limit phenotypes.
 * @param {Object} props 
 * @returns {String[]} Returns the list of research group tags. 
 */
async function getPhenotype_API({ tag, query, limit }) {
    const res = await axios.get('/api/phenotypes', {params : {tag, query, limit}})
    return res.data
}

export const useGetPhenotypes = (APIParams = {tag, query, limit}, useQueryOptions = {}) => {
    return useQuery(["getPhenotype", APIParams.tag, APIParams.limit, APIParams.query], () => getPhenotype_API({...APIParams}), useQueryOptions)
}
