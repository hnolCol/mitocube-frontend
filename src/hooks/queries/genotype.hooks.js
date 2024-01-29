
import { useQuery, useMutation } from "react-query"
import axios from "axios"


/**
 * 
 * @param {Object} props
 * @returns 
 */
async function getGenotypes_API({ proteome_id }) {
    const res = await axios.get(`/api/genotypes`, {params : { proteome_id}})
    return res.data
}

export function useGetGenotypes(APIParams = {}, useQueryOptions = {staleTime : 30000}, ) {
    return useQuery(["getGenotypes",APIParams.proteome_id],() =>  getGenotypes_API({...APIParams}), useQueryOptions)
}

//submit genotype
async function postGenotype_API({ genotype }) {
    console.log(genotype)
    const res = await axios.post('/api/genotypes',
        genotype
        )
}

export const usePostGenotype = (useMutationOptions = {}) => {
    return useMutation((APIParams) => postGenotype_API({...APIParams}), useMutationOptions)
}