import hooks from "@mitocube/api-hooks"
import _ from "lodash"


/**
 * React component to display genotype Proteins
 * @param {Object} props  
 * @param {String} props.tag The tag of the genotype to display the Proteins
 */
export function GenotypeProteins({tag}) {

    const {data : genotypeProteins, isError, error, isSuccess} = hooks.genotypes.useGetGenotypeProteins({genotype_tag : tag})

    if (isError) console.log(error)


    return <span>{isSuccess && _.isString(genotypeProteins)?genotypeProteins:null}</span>
}

