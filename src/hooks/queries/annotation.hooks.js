import { useQuery } from "react-query";
import axios from "axios"


// get all annotation features THIS RETURSN THE FEATURES NOT THE ANNOTATIONS -> MOVE
/**
 * 
 * @param {Object} props
 * @param {import("../../types/attributes").AttributeValue[]} props.organisms - The organism selected - rename to proteome? 
 * @returns {import("../../types/feature").Feature[]} - The list of features in the database. 
 */
async function getAnnotationFeatures_API({ proteome_id }) {
    const res = await axios.get('/api/annotations/features', { params: { proteome_id } })
    return res.data 
}

export const useGetAnnotationFeatures = (APIParams = {}, useQueryOptions = {staleTime : Infinity}) => {
    return useQuery(["annotation-features"], () => getAnnotationFeatures_API({...APIParams}), useQueryOptions)
}








