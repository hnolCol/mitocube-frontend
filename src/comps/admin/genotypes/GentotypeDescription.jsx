import { api } from "@/api"
import _ from "lodash"
import { useEffect } from "react"


/**
 * React component to display genotype description
 * @param {Object} props  
 * @param {String} props.tag The tag of the genotype to display the description
 */
export function GenotypeDescription({tag, update}) {

    const {data : genotypeDescription, isError, error, isSuccess, refetch} = api.genotypes.queryGenotypes.useGetGenotypeDescription({genotype_tag : tag})
    
    if (isError) console.log(error)
    useEffect(() =>{
        if (_.isNumber(update)) refetch()
        
    }, [update])

    return <span>{isSuccess && _.isString(genotypeDescription)?genotypeDescription:null}</span>
}
