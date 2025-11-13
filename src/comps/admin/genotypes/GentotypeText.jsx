import hooks from "@mitocube/api-hooks"
import _ from "lodash"

/**
 * React component to display genotype text
 * @param {Object} props  
 * @param {String} props.tag The tag of the genotype to display the text
 */
export function GenotypeText({tag}) {

    const {data : genotypeText, isError, error, isSuccess} = hooks.genotypes.useGetGenotypeText({genotype_tag : tag})

    if (isError) console.log(error)


    return <span>{isSuccess && _.isString(genotypeText)?genotypeText:null}</span>
}

