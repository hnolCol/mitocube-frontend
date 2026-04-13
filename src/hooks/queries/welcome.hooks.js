import axios from "axios"
import { useQuery } from "@tanstack/react-query";

/**
 * @description API Call to get the informationa bout the backend including its name and the description. 
 * @param {Object} props - Placeholder for future props and the keep the queries consistent. Ignored at the moment. 
 * @returns {import("../../types/info").AppInfoAPIResponse} The API response for the information about the backend. 
 */
async function getBackendInfo_API({}) {
    const res = await axios.get('/api/info/app')
    return res.data 
}

export const useGetBackendInfo = (useQueryOptions = {}) => {
    return useQuery({
        queryKey: ["backendInfo"],
        queryFn: () => getBackendInfo_API({}),
        ...useQueryOptions
    })
}

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
