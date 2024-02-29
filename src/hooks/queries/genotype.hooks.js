
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
async function getGenotypes_API({ proteome_ids, feature_key}) {
    const res = await axios.get(`/api/genotypes`, {params : { proteome_ids, feature_key }})
    return res.data
}

export function useGetGenotypes(APIParams = {}, useQueryOptions = { staleTime: 30000 },) {
    const joinedProteomeIds = _.isArray(APIParams.proteome_ids)?_.join(APIParams.proteome_ids, ";"):_.isString(APIParams.proteome_ids)?APIParams.proteome_ids:undefined
    APIParams.proteome_ids = joinedProteomeIds
    return useQuery(["getGenotypes",joinedProteomeIds],() =>  getGenotypes_API({...APIParams}), useQueryOptions)
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



