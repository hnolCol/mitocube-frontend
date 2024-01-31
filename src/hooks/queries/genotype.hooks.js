
import { useQuery, useMutation } from "react-query"
import axios from "axios"
import _ from "lodash"

/**
 * 
 * @param {Object} props
 * @returns 
 */
async function getGenotypes_API({ proteome_ids }) {
    const res = await axios.get(`/api/genotypes`, {params : { proteome_ids }})
    return res.data
}

export function useGetGenotypes(APIParams = {}, useQueryOptions = { staleTime: 30000 },) {
    const joinedProteomeIds = _.join(APIParams.proteome_ids, ";")
    //console.log(joinedProteomeIds)
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