import _ from "lodash"
import { api } from "@/api"

/**
 * React component to count relationships of a genotype
 * @param {Object} props  
 * @param {String} props.tag The tag of the genotype to display the relationship count
 */
export function GenotypeCount({tag}) {
    const {data : sampleCount, isError, error, isSuccess} = api.samples.count.useGetSampleCount({genotype_tag : tag}, {staleTime : Infinity, enabled : _.isString(tag) && tag.length > 0})

    if (isError) console.log(error)
    return <span>{isSuccess && (_.isNumber(sampleCount) || _.isString(sampleCount))?sampleCount:null}</span>
}

