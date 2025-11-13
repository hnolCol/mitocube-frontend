import hooks from "@mitocube/api-hooks"
import _ from "lodash"

/**
 * Query to get the genotype of the sample
 * @param {Object} props
 * @param {String} props.tag The sample tag
 * @returns {String} The genotype tag  
 */


export function SampleGenotype({tag}) {

    const { data : sampleGenotype, isError, error, isSuccess} = hooks.samples.useGetSampleGenotype({sample_tag : tag})

    if (isError) console.log(error)

    return <span>{isSuccess && _.isString(sampleGenotype)?sampleGenotype:null}</span>
}