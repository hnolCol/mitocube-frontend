import _ from "lodash"
import viz from "@mitocube/viz"
import { useMemo } from "react"
import { Loading } from "@/comps/core/base/states/Loading"
import { scaleLinear } from "@visx/scale"
import { usePrefetchTestQuantificationDistributions } from "@/api/orchestrated/testQuantificationDists"
import { Annotation } from "@/comps/core/base/annotations/Annotation"
import { AnnotationGroup } from "@/comps/core/base/annotations/AnnotationGroup"

export function AnnotationMapDistribution({ tag, tagType = "annotation", submission_tag, activeTestParam, markerValue, markerLabel, width = 220, height = 320, margins = { left: 25, right: 130, bottom: 5, top: 15 } }) {

    const testParams = useMemo(() => {
        if (!_.isObject(activeTestParam) || _.isEmpty(activeTestParam) || !_.isString(submission_tag) || !_.isString(tag)) return []
        const base = {
            tag: submission_tag,
            ca_left_tag: activeTestParam.ca_tag_left,
            ca_right_tag: activeTestParam.ca_tag_right,
            attribute_tag: activeTestParam.attribute_tag,
            within_attribute_tags: activeTestParam.within_attribute_tags,
            within_ca_tags: activeTestParam.within_ca_tags,
            quantification_type: "protein_groups"
        }
        return tagType === "group"
        ? [
            { ...base, annotation_tag: undefined, annotation_group_tag: undefined },
            { ...base, annotation_group_tag: tag }
        ]
        : [
            { ...base, annotation_tag: undefined },
            { ...base, annotation_tag: tag }
        ]
    }, [activeTestParam, submission_tag, tag])

    const { isReady, tagQueries } = usePrefetchTestQuantificationDistributions(testParams)

    const distributions = useMemo(() => {
        if (!isReady || !_.isArray(tagQueries)) return []
        return tagQueries.map(d => d.data?.distributions?.[0]).filter(d => d && d.N > 0)
    }, [isReady, tagQueries])

    const suffix = tagQueries?.[0]?.data?.suffix

    const yScale = useMemo(() => {
        if (distributions.length === 0) return undefined
        const allValues = _.flatMap(distributions, dist => _.concat(dist.min, dist.max))
        const max = _.max(allValues)
        const min = _.min(allValues)
        return scaleLinear({ domain: [max, min], range: [margins.top, margins.top + height - margins.bottom], nice: true })
    }, [distributions, height, margins])

    if (testParams.length === 0) return null

    const boxWidth = 30
    const spaceBetween = width - boxWidth
    const totalWidth = boxWidth * Math.max(distributions.length, 1) + spaceBetween * Math.max(distributions.length - 1, 0) + margins.left + margins.right

    const fills = isReady ? tagQueries.map(d => (d.data?.annotation_tag || d.data?.annotation_group_tag) ? "red" : "#efefef") : []
    const markerValues = isReady ? tagQueries.map((d, i) => (i === 1 && _.isNumber(markerValue)) ? markerValue : undefined) : []
    const markerLabels = isReady ? tagQueries.map((d, i) => (i === 1 && _.isString(markerLabel)) ? markerLabel : undefined) : []
    return <div className="flex flex-column" style={{ gap: "0.25rem" }}>
        {!isReady && <Loading />}
        {isReady && distributions.length === 0 ? <span>No quantified proteins for this comparison.</span> : null}

        {isReady && distributions.length > 0 ? <>
            <h3 style={{ margin: 0 }}>{`log2FC ${suffix}`}</h3>
            <div className="flex" style={{ gap: "0.75rem" }}>
                <div style={{ flexShrink: 0, width: totalWidth, height: height }}>
                <viz.charts.minimal.MinimalBoxplots
                        qs={distributions}
                        margins={margins}
                        yaxisLabel=""
                        showMedian={true}
                        width={totalWidth}
                        height={height}
                        boxWidth={boxWidth}
                        fill={fills}
                        spaceBetween={spaceBetween}
                        preYScale={yScale}
                        markerValues={markerValues}
                        markerLabels={markerLabels}
                        verticalLineAtZero={false} />
                </div>

                <div className="flex flex-column" style={{ gap: "0.35rem", justifyContent: "center", flexShrink: 0 }}>
                    {tagQueries.map((d, i) => {
                        const label = (d.data.annotation_tag || d.data.annotation_group_tag)
                            ? (tagType === "group" ? <AnnotationGroup tag={tag} minimal={true} /> : <Annotation tag={tag} minimal={true} />)
                            : "All proteins"
                        return <div key={`label-${i}`} className="flex center-items" style={{ gap: "0.35rem" }}>
                            <span style={{ width: "10px", height: "10px", backgroundColor: fills[i], border: "1px solid #999", display: "inline-block", flexShrink: 0 }} />
                            <span style={{ fontSize: "0.85rem" }}>{label}</span>
                        </div>
                    })}
                </div>
            </div>
        </> : null}
    </div>

}