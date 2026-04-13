import { useQuery, useMutation } from "@tanstack/react-query"
import axios from "axios"
import _ from "lodash"

/**
 * 
 * @param {Object} props
 * @param {String} props.proteome_id
 * @returns {import("../../types/filter").Filter[]} - The filter found for the given proteome_ids 
 */
async function getFilters_API({proteome_tag, feature_tag, submission_tag}){
    //fetch availabe features from the API. Reconsider /details 
    const res = await axios.get("/api/filters", {params : {proteome_tag,feature_tag, submission_tag}} )
    return res.data
}

export function useGetFilters (APIParams = {proteome_tag, feature_tag, submission_tag}, useQueryOptions = {}) {
    return useQuery(["getFilters",APIParams.proteome_tag,APIParams.feature_tag, APIParams.submission_tag],() =>  getFilters_API({...APIParams}), useQueryOptions)
}


/**
 * @description Adds a filter set to the database. 
 * @param {Object} props
 * @param {String} props.proteome_id
 * @param {String[]} props.protein_tags 
 * @param {String} props.description 
 * @param {String} props.publication
 * @param {String} props.text 
 * @returns 
 */
async function postFilter_API({proteome_tag, protein_tags, description, text, publication}){
    //fetch availabe features from the API. Reconsider /details 
    const res = await axios.post("/api/filters",{proteome_tag,text,description,protein_tags, publication, tag : text.replaceAll(" ","_").toLowerCase()})
    return res.data
}

export const usePostFilter = (useMutationOptions = {}) => {
    return useMutation((APIParams) => postFilter_API({...APIParams}), useMutationOptions)
}


/**
 * @description Delete a filter by its tag.
 * @param {Object} props
 * @param {String} props.tag - The filter tag
 * @returns 
 */
async function deleteFilter_API({tag}){
    //fetch availabe features from the API. Reconsider /details 
    const res = await axios.delete(`/api/filters/${tag}`)
    return res.data
}

export const useDeleteFilter = (useMutationOptions = {}) => {
    return useMutation((APIParams) => deleteFilter_API({...APIParams}), useMutationOptions)
}




