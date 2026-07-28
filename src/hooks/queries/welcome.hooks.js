import axios from "axios"
import { useQuery } from "@tanstack/react-query";

/**
 * @description Fetches key figures from the API. TO DO: api-hooks MOVE TO API PACKAGE! 
 * @returns {Object[]}
 */
async function getKeyFigures_API() {
    const res = await axios.get('/api/info/keyfigures')
    return res.data 
}

export const useGetKeyFigures = (useQueryOptions = {}) => {
    return useQuery({
        queryKey: ["getKeyFigures"],
        queryFn: () => getKeyFigures_API(),
        ...useQueryOptions
    })
}
