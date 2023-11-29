import { useQuery } from "react-query";
import axios from "axios"


// get all annotation features
async function getAnnotationFeatures_API({ organisms }) {
    organisms // list of attributes
    console.log(organisms)
    const res = await axios.post('/api/annotations/features/attributeValues', organisms)
    return res.data 
}

export const useGetAnnotationFeatures = (APIParams = {}, useQueryOptions = {staleTime : 12000000}) => {
    return useQuery(["annotation-features"], () => getAnnotationFeatures_API({...APIParams}), useQueryOptions)
}