
import { api } from "@/api"
import _ from "lodash"
import viz from "@mitocube/viz"
import { getItemFromLocalStorage } from "@/services/localstorage"
import { useEffect, useMemo } from "react"
import { Loading } from "@/comps/core/base/states/Loading"
import { scaleLinear } from "@visx/scale"
import { usePrefetchTestQuantificationDistributions } from "@/api/orchestrated/testQuantificationDists"

export function AnnotationDistribution({ tag, submission_tag, width = 95, height = 200, margins = { left: 20, right: 5, bottom: 5, top: 15} }) {
    let selectedTestParams = {}
    const { itemFound, itemValue } = getItemFromLocalStorage({ itemName: "volcanoProps", parseJson: true })
    if (itemFound && _.isObject(itemValue) && _.has(itemValue, submission_tag)) {
        selectedTestParams = itemValue[submission_tag]
    }
    
    console.log(selectedTestParams)


    const {isReady, tagQueries } = usePrefetchTestQuantificationDistributions({tag : submission_tag, testParams : selectedTestParams, annotation_tag : tag, quantification_type : "protein_groups"}, { enabled: _.isString(submission_tag) && _.isObject(selectedTestParams) && !_.isEmpty(selectedTestParams) })

    console.log(tagQueries)

    if (_.isArray(tagQueries && isReady)) {
        console.log("TAG QUERIES", tagQueries.map(q => { return { suffix: q.data.suffix, distributions: q.data.distributions } }))
    }
    
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
    }, [isReady, height, margins])
    
    // const { data: qsComplete } = api.submissions.quantifications.useGetSubmissionQuantificationDistribution({ tag: submission_tag }, { enabled: _.isString(submission_tag)})

    // const { data : qsAnnotation } = api.submissions.quantifications.useGetSubmissionQuantificationDistribution({tag : submission_tag, annotation_tag : tag}, {enabled : _.isString(submission_tag) && _.isString(tag) && tag.length > 0})
    // const d = _.concat(qsComplete, qsAnnotation)

    return <div className="flex flex-wrap" style={{gap : "2rem"}}> 
        {!isReady && <Loading />}
        {isReady && _.isArray(tagQueries) && tagQueries.length > 0 ? 
            tagQueries.map(d => <div className="flex flex-column" key={d.data.suffix}>
                
                <h3>{d.suffix}</h3>
            
                <viz.charts.minimal.MinimalBoxplots
                    qs={d.data.distributions}
                    margins={margins}
                    yaxisLabel={`log2 FC ${d.data.suffix}`}
                    showMedian={false}
                    width={width}
                    height={height}
                    fill={["#efefef", "red"]} //dangerous! 2 only?
                    spaceBetween={5}
                    preYScale={yScale} />
                
            </div>) : null}

    </div>
}