import { useQuery } from "react-query";
import axios from "axios"


// get all annotation features THIS RETURSN THE FEATURES NOT THE ANNOTATIONS -> MOVE
/**
 * 
 * @param {Object} props
 * @param {import("../../types/attributes").AttributeValue[]} props.organisms - The organism selected - rename to proteome? 
 * @returns {import("../../types/feature").Feature[]} - The list of features in the database. 
 */
async function getAnnotationFeatures_API({ organisms }) {
    console.log(organisms)
    const res = await axios.get('/api/annotations/features', { params: { proteome_id: organisms.map(organism => organism.value).join(" ") } })
    return res.data 
}

export const useGetAnnotationFeatures = (APIParams = {}, useQueryOptions = {staleTime : Infinity}) => {
    return useQuery(["annotation-features"], () => getAnnotationFeatures_API({...APIParams}), useQueryOptions)
}








