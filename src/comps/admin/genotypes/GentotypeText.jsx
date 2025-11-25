import hooks from "@mitocube/api-hooks"
import _ from "lodash"
import { useEffect } from "react"

/**
 * React component to display genotype text
 * @param {Object} props  
 * @param {String} props.tag The tag of the genotype to display the text
 */
export function GenotypeText({tag, update}) {

    const {data : genotypeText, isError, error, isSuccess, refetch} = hooks.genotypes.useGetGenotypeText({genotype_tag : tag})
    useEffect(() =>{
        if (_.isNumber(update)) refetch()
        
    }, [update])

    if (isError) console.log(error)


    return <span>{isSuccess && _.isString(genotypeText)?genotypeText:null}</span>
}

