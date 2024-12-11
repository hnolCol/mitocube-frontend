import { useQuery, useMutation } from "react-query";
import axios from "axios"

async function getProteomes_API({ }) {
    //user login attempt, returns a token.
    const res = await axios.get('/api/proteomes')
    return res.data
}

export const useGetProteomes = (APIParams = {}, queryOptions = {}) => {
    return useQuery(["proteomes"], () => getProteomes_API({...APIParams}), queryOptions)
}


/**
 * @description Adds a proteome to the database (e.g. downloads from Uniprot) and updates the 
 * sequence information as well as gene names. Does not delete existing proteins in the database if
 * they are not present in the new version of the reference proteome. 
 * @param {Object} props
 * @param {String} props.proteome_tag - Proteome Tag (starting with UP) Mulitple strings should be separated using a semicolon (;) 
 * @param {Boolean} props.reviewed - If only reviewed proteins from the Uniprot database should be loaded.
 * @returns 
 */
async function postProteome_API({proteome_tag, reviewed = True}){
    //fetch availabe features from the API. Reconsider /details 
    const res = await axios.post("/api/proteomes",{},{params : {proteome_tag, reviewed}} )
    return res.data
}

export const usePostProteome = (useMutationOptions = {}) => {
    return useMutation((APIParams) => postProteome_API({...APIParams}), useMutationOptions)
}




async function getProteomeAbundanceDist_API({tag}) {
    //user login attempt, returns a token.
    const res = await axios.get(`/api/proteomes/${tag}/abundance`)
    return res.data
}

export const useGetProteomeAbundaneDist = (APIParams = {tag}, queryOptions = {}) => {
    return useQuery(["proteomesdist",APIParams.tag], () => getProteomeAbundanceDist_API({...APIParams}), queryOptions)
}




