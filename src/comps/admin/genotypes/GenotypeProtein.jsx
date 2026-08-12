import { api } from "@/api"
import _ from "lodash"


/**
 * React component to display genotype Proteins
 * @param {Object} props  
 * @param {String} props.tag The tag of the genotype to display the Proteins
 */
export function GenotypeProteins({tag}) {

    const {data : genotypeProteins, isError, error, isSuccess} = api.genotypes.queryGenotypes.useGetGenotypeProteins({genotype_tag : tag}, {staleTime : Infinity, enabled : _.isString(tag) && tag.length > 0})

    if (isError) console.log(error)


    return <span>{isSuccess && _.isString(genotypeProteins)?genotypeProteins:null}</span>
}

