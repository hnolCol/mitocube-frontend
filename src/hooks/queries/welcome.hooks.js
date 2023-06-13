import axios from "axios"
import { useQuery } from "react-query";

// get new mesages 

async function getNews_API(token) {
    const res = await axios.get('/api/news', { params: { token } })
    return res.data 
}

export const useGetNews = (useQueryOptions = {}, APIParams = {}) => {
    return useQuery(["getNews"],() =>  getNews_API({...APIParams}), useQueryOptions)
}


// get key figures 

async function getKeyFigures_API(token) {
    const res = await axios.get('/api/keyfigures', { params: { token } })
    return res.data 
}

export const useGetKeyFigures = (useQueryOptions = {}, APIParams = {}) => {
    return useQuery(["getKeyFigures"],() =>  getKeyFigures_API({...APIParams}), useQueryOptions)
}
