
import { useQuery, useMutation } from "react-query"
import axios from "axios"
import _ from "lodash"


async function getGenotypesByQuery_API({ query }) {
    const res = await axios.get(`/api/genotypes/q`, {params : { query }})
    return res.data
}

export function useGetGenotypesByQuery(APIParams = {}, useQueryOptions = { staleTime: 30000 },) {
    return useQuery(["getGenotypes",APIParams.query],() =>  getGenotypesByQuery_API({...APIParams}), useQueryOptions)
}


/**
 * 
 * @param {Object} props
 * @returns {import("../../types/genotypes").GenotypeResponse[]} - The list of genotypes
 */
async function getGenotypes_API({ proteome_tags, feature_key}) {
    const res = await axios.get(`/api/genotypes`, {params : { proteome_tags, feature_key }})
    return res.data
}

export function useGetGenotypes(APIParams = {}, useQueryOptions = { staleTime: 30000 },) {
    const joinedProteomeTags = _.isArray(APIParams.proteome_tags)?_.join(APIParams.proteome_tags, ";"):_.isString(APIParams.proteome_tags)?APIParams.proteome_tags:undefined
    APIParams.proteome_tags = joinedProteomeTags
    return useQuery(["getGenotypes",joinedProteomeTags],() =>  getGenotypes_API({...APIParams}), useQueryOptions)
}

//submit genotype
async function postGenotype_API({ genotype }) {
    //console.log(genotype)
    const res = await axios.post('/api/genotypes',
        genotype
        )
}

export const usePostGenotype = (useMutationOptions = {}) => {
    return useMutation((APIParams) => postGenotype_API({...APIParams}), useMutationOptions)
}


//delete genotype
async function deleteGenotype_API({ genotype_label }) {
    //console.log(genotype)
    const res = await axios.delete(`/api/genotypes/${genotype_label}`)
    return res
}

export const useDeleteGenotype = (useMutationOptions = {}) => {
    return useMutation((APIParams) => deleteGenotype_API({...APIParams}), useMutationOptions)
}



/**
 * 
 * @param {Object} props
 * @returns {import("../../types/genotypes").GenotypeResponse} - The genotype
 */
async function getGenotypeByTag_API({ tag }) {
    const res = await axios.get(`/api/genotypes/${tag}`)
    return res.data
}

export const useGetGenotypeByTag = (APIParams = {tag}, useQueryOptions = { staleTime : 30000 })  => {
    return useQuery(["getGenotypeByTag",APIParams.tag],() =>  getGenotypeByTag_API({...APIParams}), useQueryOptions)
}








