import { useQuery } from "react-query";
import axios from "axios"


// get all annotation features
async function getAnnotationFeatures_API({ tokenString }) {
    const res = await axios.get('/api/annotations/features/attributeValues',
    {
        headers: {
            "Authorization": `Bearer ${tokenString}`,
            'Content-Type': 'application/json'
        }
      })
    return res.data 
}

export const useGetAnnotationFeatures = (APIParams = {}, useQueryOptions = {staleTime : 12000000}) => {
    return useQuery(["annotation-features"], () => getAnnotationFeatures_API({...APIParams}), useQueryOptions)
}