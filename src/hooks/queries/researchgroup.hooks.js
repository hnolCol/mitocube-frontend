import { useQuery, useMutation } from "react-query"
import axios from "axios"

/**
 * 
 * @param {Object} props 
 * @returns {String[]} Returns the list of research group tags. 
 */
async function getResearchGroups_API({limit}) {
    const res = await axios.get('/api/researchgroups', {params : {limit}})
    return res.data
}

export const useGetResearchGroups = (APIParams = {}, useQueryOptions = {}) => {
    return useQuery(["getResearchGroups"], () => getResearchGroups_API({...APIParams}), useQueryOptions)
}




/**
 * @description The list of users tags in the research group. 
 * @param {Object} props 
 * @param {String} props.tag Research group tag 
 * @returns {String[]} Returns the list of users in the group. 
 */
async function getResearchGroupUsers_API({ tag }) {
    const res = await axios.get(`/api/researchgroups/${tag}/users`, {})
    return res.data
}

export const useGetResearchGroupUsers = (APIParams = {tag}, useQueryOptions = {}) => {
    return useQuery(["getResearchGroupsUsers", APIParams.tag], () => getResearchGroupUsers_API({...APIParams}), useQueryOptions)
}


/**
 * @description Returns the research group item
 * @param {Object} props
 * @param {String} props.tag The research group tag to return 
 * @returns {import("../../types/researchgroup").ResearchGroup} The research group item.
 */
async function getResearchGroupsByTag_API({ tag }) {
    const res = await axios.get(`/api/researchgroups/${tag}`, {})
    return res.data
}

export const useGetResearchGroupByTag = (APIParams = {tag }, useQueryOptions = {}) => {
    return useQuery(["getResearchGroupsByTag", APIParams.tag], () => getResearchGroupsByTag_API({...APIParams}), useQueryOptions)
}



/**
 * @description Adds a research group to the database 
 * @param {Object} props 
 * @param {import("../../types/researchgroup").ResearchGroupPost} props.researchGroup
 */
async function postResearchGroup_API({ name, abbreviation, address, email}) {
    const res = await axios.post('/api/researchgroups/',
        {name, abbreviation, address, email}
    )
    return res.data
}
export const usePostResearchGroup = (useMutationOptions = {}) => {
    return useMutation((APIParams) => postResearchGroup_API({...APIParams}), useMutationOptions)
}


/**
 * @description Updates a research group by its tag 
 * @param {Object} props 
 * @param {String} props.name The name of the research group 
 * @param {String} props.abbreviation - The abbreviation of the research group 
 * @param {String} props.email - The contact email address 
 * @param {String} props.address 
 */
async function patchResearchGroup_API({ tag, name, abbreviation, email, address }) {
    const res = await axios.patch(`/api/researchgroups/${tag}`,
        {},
        {params : {name, abbreviation, email, address}}
    )
    return res.data
}
export const usePatchResearchGroup = (useMutationOptions = {}) => {
    return useMutation((APIParams = { tag, name, abbreviation, email, address }) => patchResearchGroup_API({...APIParams}), useMutationOptions)
}



/**
 * @description Deletes user(s) from a research group. 
 * @param {Object} props 
 * @param {String} props.tag 
 * @param {String[]} props.users_tags
 */
async function deleteResearchGroup_API({ tag, user_tags }) {
    const res = await axios.delete(`/api/researchgroups/${tag}/users`,
        { data: user_tags }
    )
    return res.data
}
export const useDeleteResearchGroupUsers = (useMutationOptions = {}) => {
    return useMutation((APIParams) => deleteResearchGroup_API({...APIParams}), useMutationOptions)
}



/**
 * @description Add user(s) to a research group. 
 * @param {Object} props 
 * @param {String} props.tag 
 * @param {String[]} props.users_tags
 */
async function postResearchGroupUsers_API({ tag, user_tags }) {
    const res = await axios.post(`/api/researchgroups/${tag}/users`,
        user_tags
    )
    return res.data
}
export const usePostResearchGroupUsers = (useMutationOptions = {}) => {
    return useMutation((APIParams) => postResearchGroupUsers_API({...APIParams}), useMutationOptions)
}












