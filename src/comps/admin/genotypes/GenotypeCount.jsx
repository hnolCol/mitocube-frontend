import hooks from "@mitocube/api-hooks"
import _ from "lodash"


/**
 * React component to count relationships of a genotype
 * @param {Object} props  
 * @param {String} props.tag The tag of the genotype to display the relationship count
 */
export function GenotypeCount({tag}) {
    const {data : sampleCount} = hooks.samples.useGetSampleCount({genotype_tag : tag})

    if (isError) console.log(error)


    return <span>{isSuccess && _.isString(genotypeCount)?genotypeCount:null}</span>
}

