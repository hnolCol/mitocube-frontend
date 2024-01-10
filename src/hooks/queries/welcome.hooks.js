import axios from "axios"
import { useQuery } from "react-query";




/**
 * @description API Call to get the informationa bout the backend including its name and the description. 
 * @param {Object} props - Placeholder for future props and the keep the queries consistent. Ignored at the moment. 
 * @returns {import("../../types/info").AppInfoAPIResponse} The API response for the information about the backend. 
 */
async function getBackendInfo_API({}) {
    const res = await axios.get('/api/info/app')
    return res.data 
}

export const useGetBackendInfo = (APIParams = {}, useQueryOptions = {}) => {
    return useQuery(["backendInfo"],() =>  getBackendInfo_API({...APIParams}), useQueryOptions)
}

// get new mesages 
async function getNews_API({tokenString}) {
    const res = await axios.get('/api/news', {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${tokenString}`
        }
    })
    return res.data 
}

export const useGetNews = (APIParams = {}, useQueryOptions = {}) => {
    return useQuery(["getNews"],() =>  getNews_API({...APIParams}), useQueryOptions)
}


// get key figures 

async function getKeyFigures_API({ tokenString }) {
    return [{"label": "Proteins", "metric" : 7834}, {"label": "Instruments", "metric" : 5}, {"label": "Users", "metric" : 25}, {"label": "Turnaround [d]", "metric" : 23}]
    const res = await axios.get('/api/info/keyfigures', {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${tokenString}`
        }
    })
    return res.data 
}

export const useGetKeyFigures = (APIParams = {}, useQueryOptions = {}) => {
    return useQuery(["getKeyFigures"],() =>  getKeyFigures_API({...APIParams}), useQueryOptions)
}
