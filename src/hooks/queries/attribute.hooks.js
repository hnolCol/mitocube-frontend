import { useQuery } from "react-query"
import axios from "axios"




async function getAttributeValue_API({labels, attribute_tag, attribute_value_tag}) {
    const res = await axios.get('/api/attributes/attribute_values/q',{params : {labels, attribute_tag, attribute_value_tag}})
    return res.data 
}

export const useGetAttributeValues = (APIParams = {labels : "", attribute_tag : null, attribute_value_tag : null},useQueryOptions = {}) => {
    return useQuery(["getAttributeByLabel",APIParams.labels,APIParams.attribute_tag,APIParams.attribute_value_tag],
        () => getAttributeValue_API({ ...APIParams }), useQueryOptions)
}



async function getAttribute_API({labels}) {
    const res = await axios.get('/api/attributes/attributes/q',{params : {labels}})
    return res.data 
}

export const useGetAttributes = (APIParams = {labels : ""},useQueryOptions = {}) => {
    return useQuery(["getAttributeByLabel",APIParams.labels],
        () => getAttribute_API({ ...APIParams }), useQueryOptions)
}