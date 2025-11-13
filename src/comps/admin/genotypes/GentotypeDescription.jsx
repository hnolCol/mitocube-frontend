import hooks from "@mitocube/api-hooks"
import _ from "lodash"


/**
 * React component to display genotype description
 * @param {Object} props  
 * @param {String} props.tag The tag of the genotype to display the description
 */
export function GenotypeDescription({tag}) {

    const {data : genotypeDescription, isError, error, isSuccess} = hooks.genotypes.useGetGenotypeDescription({genotype_tag : tag})

    if (isError) console.log(error)


    return <span>{isSuccess && _.isString(genotypeDescription)?genotypeDescription:null}</span>
}
