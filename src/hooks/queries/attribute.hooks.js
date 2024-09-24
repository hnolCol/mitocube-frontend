import { useQuery, useMutation } from "react-query"
import axios from "axios"






/**
 * @description Adds attributes to the database 
 * @param {Object} props
 * @param {String} props
 * @returns 
 */
async function postAttribute_API({}){
    //fetch availabe features from the API. Reconsider /details 
    const res = await axios.post("/api/attributes",{})
    return res.data
}

export const usePostAttribute = (useMutationOptions = {}) => {
    return useMutation((APIParams) => postAttribute_API({...APIParams}), useMutationOptions)
}



/**
 * @description Adds attribute values for an attribute defined by its tag to the database. 
 * @param {Object} props
 * @param {String} props
 * @returns 
 */
async function postAttributeValues_API({attribute_tag}){
    const res = await axios.post(`/api/attributes/${attribute_tag}/values`,{})
    return res.data
}

export const usePostAttributeValues = (useMutationOptions = {}) => {
    return useMutation((APIParams) => postAttributeValues_API({...APIParams}), useMutationOptions)
}



/**
 * @description Adds attribute values for an attribute defined by its tag to the database. 
 * @param {Object} props
 * @param {String} props.attribute_tag 
 * @param {Object} props.attribute_value
 * @returns 
 */
async function postAttributeValue_API({attribute_tag, attribute_value}){
    const res = await axios.post(`/api/attributes/${attribute_tag}/value`,attribute_value)
    return res.data
}

export const usePostAttributeValue = (useMutationOptions = {}) => {
    return useMutation((APIParams) => postAttributeValue_API({...APIParams}), useMutationOptions)
}


/**
 * @description Deletes attribute values for an attribute defined by its tag from the database. 
 * @param {Object} props
 * @param {String} props.attribute_tag 
 * @param {Object} props.attribute_value
 * @returns 
 */
async function deleteAttributeValue_API({attribute_tag, attribute_value_tag}){
    const res = await axios.delete(`/api/attributes/${attribute_tag}/values/${attribute_value_tag}`,)
    return res.data
}

export const useDeleteAttributeValue = (useMutationOptions = {}) => {
    return useMutation((APIParams) => deleteAttributeValue_API({...APIParams}), useMutationOptions)
}


/**
 * @description Update an attribute value in the database. 
 * @param {Object} props 
 * @param {String} props.attribute_tag
 * @param {Object} props.attribute_value_props
 * @returns 
 */
async function patchAttributeValue_API({ attribute_tag, attribute_value_props }) {
    const res = await axios.patch(
        `/api/attributes/${attribute_tag}/values/${attribute_value_props.tag}`,
        attribute_value_props //updated data 
    )
    return res 
}


export const useUpdateAttributeValue = (useMutationOptions = {}) => {
    return useMutation((APIParams) =>  patchAttributeValue_API({...APIParams}), useMutationOptions)
}


/**
 * 
 * @param {Object} props 
 * @returns {import("../../types/attributes").Attribute[]} - The mandatory attributes for a submission/dataset.
 */
async function getMandatoryAttributes_API({ }) {
    const res = await axios.get('/api/attributes/mandatory')
    return res.data 
}

export const useGetMandatoryAttributes = (APIParams = {}, useQueryOptions) => {
    return useQuery(["manAttributes"], () => getMandatoryAttributes_API({...APIParams}), useQueryOptions)
}


/**
 * @description Returns the dataset attributes that can be used to define a dataset. Dataset attributes
 * are true for the complete dataset including each samples. As an example, if only HeLa cells are utilized, 
 * then a dataset attribute Cellline = att_cellline:hela should be used. If 4 different celllines were used
 * then each sample should be define with the cellline attribuge. 
 * @param {Object} props 
 * @returns {import("../../types/attributes").Attribute[]} - The attributes that are allowed to be define for a dataset.
 */
async function getDatasetAttributes_API({ }) {
    const res = await axios.get('/api/attributes/dataset')
    return res.data 
}

export const useGetDatasetAttributes = (APIParams = {}, useQueryOptions) => {
    return useQuery(["datasetAttributes"], () => getDatasetAttributes_API({...APIParams}), useQueryOptions)
}



/**
 * @description Returns the attribute values by a search string. Allows to subset the attributes by defining 
 * a minimum state (e.g. attributes have a minimum submission state requirement) and a boolean param (please see Attribute type).
 * 
 * @param {Object} props 
 * @param {String} props.search_string 
 * @param {Number} props.min_state - Enumerate state integer 0-5 
 * @param {String} props.param_name - The name of an attribute param (boolean) that needs to be true. Example : allow_for_dataset, allow_for_qc,...
 * @returns {[import("../../types/attributes").Attribute,import("../../types/attributes").AttributeValue[]|import("../../types/feature").Feature[]][]} - The attributes that are allowed to be define for a dataset as an array of Attribute (index 0) and AttributeValues (index 1)
 */
async function getAtributesAndValuesByQuery_API({search_string,min_state,param_name}) {
    const res = await axios.get('/api/attributes', {params : {search_string,min_state,param_name}})
    return res.data 
}

export const useGetAttributes = (APIParams = {search_string, min_state, param_name}, useQueryOptions) => {
    return useQuery(["datasetAttributes",APIParams.search_string,APIParams.min_state,APIParams.param_name], () => getAtributesAndValuesByQuery_API({...APIParams}), useQueryOptions)
}


/**
 * @description Fetches the attribute values associated with an attribute_tag (tag)
 * @param {Object} props 
 * @param {String} props.tag  
 * @returns {import("../../types/attributes").AttributeValue[]}
 */
async function getValuesByAttributeTag_API({ tag }) {
    const res = await axios.get('/api/attributes/values',{params : {tag}})
    return res.data 
}

export const useGetValueForAttributeByTag = (APIParams = {tag : ""}, useQueryOptions) => {
    return useQuery(["valuesByTag",APIParams.tag], () => getValuesByAttributeTag_API({...APIParams}), useQueryOptions)
}




/**
 * @description Returns a list of attribute values that are present in the given dataset tags. 
    Use the attribute_value_tag and attribute_tag params to return a specific subset of attribute_tags. 
 * @param {Object} props
 * @param {String[]} props.tags - The submission tags for which the attributes/values should be returned 
 * @param {String} props.attribute_tag - The attribute tag, for multiple join by ';'
 * @param {String} props.attribute_value_tag - The attribute value tags, for multiple join by ';'
 * @returns 
 */
async function getAttributeValue_API({tags, attribute_tag, attribute_value_tag}) {
    const res = await axios.get('/api/attributes/attribute_values/q',{params : {tags, attribute_tag, attribute_value_tag}})
    return res.data 
}

export const useGetAttributeValues = (APIParams = {tags : "", attribute_tag : null, attribute_value_tag : null},useQueryOptions = {}) => {
    return useQuery(["getAttributeByTag", APIParams.tags,
        APIParams.attribute_tag,
        APIParams.attribute_value_tag],
        () => getAttributeValue_API({ ...APIParams }), useQueryOptions)
}



// async function getAttribute_API({labels}) {
//     const res = await axios.get('/api/attributes/attributes/q',{params : {labels}})
//     return res.data 
// }

// export const useGetAttributes = (APIParams = {labels : ""},useQueryOptions = {}) => {
//     return useQuery(["getAttributeByLabel",APIParams.labels],
//         () => getAttribute_API({ ...APIParams }), useQueryOptions)
// }



async function getAttributeUnit_API({tag}) {
    const res = await axios.get('/api/attributes/units',{params : {tag}})
    return res.data 
}

export const useGetAttributeUnit = (APIParams = { tag: "" }, useQueryOptions = {}) => {
    return useQuery(["getAttributeUnit",APIParams.tag],
        () => getAttributeUnit_API({ ...APIParams }), useQueryOptions)
}




