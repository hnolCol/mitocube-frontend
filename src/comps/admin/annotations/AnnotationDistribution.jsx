
import { api } from "@/api"
import _ from "lodash"
import viz from "@mitocube/viz"
import { getItemFromLocalStorage } from "@/services/localstorage"
import { useEffect, useMemo } from "react"
import { Loading } from "@/comps/core/base/states/Loading"
import { scaleLinear } from "@visx/scale"
import { usePrefetchTestQuantificationDistributions } from "@/api/orchestrated/testQuantificationDists"

export function AnnotationDistribution({ tag, submission_tag, width = 95, height = 200, margins = { left: 20, right: 5, bottom: 5, top: 15} }) {
    let selectedTestParams = []

    const { itemFound, itemValue } = getItemFromLocalStorage({ itemName: "volcanoProps", parseJson: true })
    if (itemFound && _.isObject(itemValue) && _.has(itemValue, submission_tag)) {
        selectedTestParams = itemValue[submission_tag]
    }
    

    const testParams = useMemo(() => {
        if (!_.isArray(selectedTestParams) || selectedTestParams.length === 0) return []
        return selectedTestParams.flatMap(tp => {
            const base = {
                tag: submission_tag,
                ca_left_tag: tp.ca_left_tag ?? tp.ca_tag_left,
                ca_right_tag: tp.ca_right_tag ?? tp.ca_tag_right,
                attribute_tag: tp.attribute_tag,
                within_attribute_tags: tp.within_attribute_tags,
                within_ca_tags: tp.within_ca_tags,
                quantification_type: "protein_groups"
            }
            return [
                { ...base, annotation_tag: undefined },
                { ...base, annotation_tag: tag }
            ]
        })
    }, [selectedTestParams, submission_tag, tag])

    // testParams = [{tag : submission_tag, annotation_tag : undefined , attribute_tag}, {tag : submission_tag, annotation_tag : tag , attribute_tag }]

    const {isReady, tagQueries } = usePrefetchTestQuantificationDistributions(testParams)
    
    const pairedQueries = _.chunk(tagQueries, 2)

    const yScale = useMemo(() => {
        
        if (!isReady || !_.isArray(tagQueries) || tagQueries.length === 0) {
            return undefined
        }
        const allValues = _.flatMap(tagQueries, d => _.flatMap(d.data.distributions, dist => _.concat(dist.min, dist.max)))
        const max = _.max(allValues)
        const min = _.min(allValues)

        return scaleLinear(
            {
                domain: [max, min],
                range: [margins.top, margins.top + height - margins.bottom],
                nice: true
            }
        )
    }, [isReady, tagQueries, height, margins])
    
    // const { data: qsComplete } = api.submissions.quantifications.useGetSubmissionQuantificationDistribution({ tag: submission_tag }, { enabled: _.isString(submission_tag)})

    // const { data : qsAnnotation } = api.submissions.quantifications.useGetSubmissionQuantificationDistribution({tag : submission_tag, annotation_tag : tag}, {enabled : _.isString(submission_tag) && _.isString(tag) && tag.length > 0})
    // const d = _.concat(qsComplete, qsAnnotation)

    return <div className="flex flex-wrap" style={{gap : "2rem"}}> 
        {!isReady && <Loading />}
        {isReady && _.isArray(tagQueries) && tagQueries.length > 0 ? 
            pairedQueries.map((pair, i) => <div className="flex flex-column" key={`${pair[0].data.suffix}-${i}`}>
                
                <h3>{pair[0].data.suffix}</h3>
            
                <viz.charts.minimal.MinimalBoxplots
                    qs={pair.map(d => d.data.distributions[0])}
                    margins={margins}
                    yaxisLabel={`log2 FC ${pair[0].data.suffix}`}
                    showMedian={false}
                    width={width}
                    height={height}
                    fill={pair.map(d => d.data.annotation_tag || d.data.annotation_group_tag ? "red" : "#efefef")} //dangerous! 2 only?
                    spaceBetween={5}
                    preYScale={yScale} />
                
            </div>) : null}

    </div>
}