import axios from "axios"
import { useQuery } from "@tanstack/react-query";
/**
 * 
 * @param {Object} props 
 * @param {Number} props.limit - The maximum number of news to be returned 
 * @param {String} props.tags - Specific news tag to be returned.  
 * @returns {import("../../types/news").News[]}
 */
async function getNews_API({limit}) {
    const res = await axios.get('/api/news', {params: {limit}})
    return res.data 
}

export const useGetNews = (APIParams = {limit}, useQueryOptions = {}) => {
    return useQuery({
        queryKey: ["getNews"],
        queryFn: () => getNews_API({...APIParams}),
        ...useQueryOptions
    })
}

/**
 * 
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
