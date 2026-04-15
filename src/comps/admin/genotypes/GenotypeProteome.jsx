import { api } from "@/api"
import _ from "lodash"
import { useEffect } from "react"


/**
 * React component to display genotype proteome
 * @param {Object} props  
 * @param {String} props.tag The tag of the genotype to display the proteome
 */
export function GenotypeProteome({tag, update}) {

    const {data : genotypeProteome, isError, error, isSuccess, refetch} = api.genotypes.queryGenotypes.useGetGenotypeProteome({genotype_tag : tag})
    
    if (isError) console.log(error)
    useEffect(() =>{
        if (_.isNumber(update)) refetch()
        
    }, [update])

    return <span>{isSuccess && _.isString(genotypeProteome)?genotypeProteome:null}</span>
}
