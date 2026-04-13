import hooks from "@mitocube/api-hooks"
import _ from "lodash"
import { ConditionApplicationsView } from "../../core/base/condition_applications/ConditionApplicationView"

/**
 * Query to get the genotype of the sample
 * @param {Object} props
 * @param {String} props.tag The sample tag
 * @returns {String} The genotype tag  
 */


export function SampleGenotype({tag}) {

    const { data : sampleGenotypeTags, isError, error, isSuccess} = hooks.samples.useGetSampleGenotype({tag},{ enabled : _.isString(tag) && tag.length > 0, staleTime: Infinity})
    console.log(sampleGenotypeTags)
    if (isError) console.log(error)

    return <div className="flex">{_.isArray(sampleGenotypeTags) ? sampleGenotypeTags.map(tag => <ConditionApplicationsView key={tag} tag={tag} />) : null}</div>
}