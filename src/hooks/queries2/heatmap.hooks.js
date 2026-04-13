import { useQuery } from "@tanstack/react-query"
import axios from "axios"

async function getDendro_API(token) {
    const res = await axios.get('/api/dendro', { params: { token } })
    return res.data 
}

export const useGetDendro = (useQueryOptions = {}, APIParams = {}) => {
    return useQuery(["seGetDendro"],() =>   getDendro_API({...APIParams}), useQueryOptions)
}
