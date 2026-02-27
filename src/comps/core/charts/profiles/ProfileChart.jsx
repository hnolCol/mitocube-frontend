import { getQuantilesInArrayByKeyNames } from "../../../../services/arrays/boundaries";
import { getChartWidthAndHeightWithMargins } from "../../../../services/plotting/size";
import { SVG } from "../SVGHeader";
import AxisWithBackground from "../axis";
import { useMemo, useRef } from "react";
import { scaleBand, scaleLinear } from "@visx/scale";

import ProfileLine from "./Line"
import ProfileBars from "./Bars"

import { QuantileBackground } from "./QuantileBackground";
import { Group } from "@visx/group";
import { Text } from "@visx/text";
import { FilterIndicator } from "../annotations/Filter";
import _ from "lodash"

export function ChartTopLeftLabel({ margins, labelTexts, textOffset = 1, totalYOffset = 4, fontSize = 14, color = ["#00000"]}) {
    return (<Group left={margins.left} top={margins.top + totalYOffset}>
        {labelTexts.map((text, textIdx) => <Text key={`${text}-${textIdx}`} fill={color[textIdx]} x={0} dx={textOffset} fontSize={fontSize} y={fontSize * textIdx} verticalAnchor="start" textAnchor="start">
            {text}
        </Text>)}
    </Group>) 
}

export function ProfileChart({
    chartIdx,
    width = 320,
    height = 240,
    margins = {
        left: 45,
        top: 5,
        right: 45,
        bottom: 40
    },
    data,
    valid,
    yaxisName = [],
    xaxisName,
    labelNames = [],
    yaxisLabel,
    xaxisLabel,
    limits,
    stroke = "#00000",
    svgID,
    rerenderHover,
    rerenderBackground,
    hoverData,
    profileAsLine = true,
    profileAsBar = false,
    subsetIndices = new Set(), // subset the data to only plot those 
    searchIndices = new Set(),
    hoverIndices = new Set(),
    mergeHoverWithSearch = true
}) {    
    let hoverIdcsInSubset = []
    if (mergeHoverWithSearch && (hoverIndices.size > 0 || searchIndices.size > 0)) {

        hoverIdcsInSubset = Array.from([...hoverIndices, ...searchIndices].filter(idx => subsetIndices.has(idx)))
    } else {
        hoverIdcsInSubset = hoverIndices.size > 0 ? Array.from([...hoverIndices].filter(idx => subsetIndices.has(idx))) : []
    }


    let searchIndicesInSubset = searchIndices.size > 0 ? new Set(Array.from([...searchIndices]).filter(idx => subsetIndices.has(idx))) : new Set()
    const hoverDataInSubset = hoverIdcsInSubset.map(idx => data[idx])
    const svgRef = useRef(null);
    const { chartWidth, chartHeight } = getChartWidthAndHeightWithMargins({ width, height, margins })
    
    const q = useMemo(() => getQuantilesInArrayByKeyNames({ data : data.filter((_,idx) => subsetIndices.has(idx)), keyNames: yaxisName }), [yaxisName])
    
    const yScale = useMemo(() => {

        const limitValues = yaxisName.map(yName => limits[yName])
        const minLimit = _.minBy(limitValues, "min")
        const maxLimit = _.minBy(limitValues, "max")
        
        const yDomain = {
            min: minLimit.min,
            max: maxLimit.max
        }
        
        return scaleLinear(
            {
                domain: [yDomain.max, yDomain.min],
                range: [margins.top, margins.top + chartHeight],
                nice: true
            }
        )
    }, [yaxisName, chartHeight])

    const xScale = useMemo(() => {
        // y scale for the scatter by yaxisNames
        return scaleBand(
            {
                domain: yaxisName,
                range: [margins.left, margins.left + chartWidth],
                nice: true,
                paddingInner: 0.2,
                paddingOuter : 0.1
            }
        )
    }, [xaxisName, chartWidth, yaxisName.length])

    return (
        
        <SVG {...{ width, height, svgID, svgRef}}>
            <AxisWithBackground
                margins={margins}
                leftScale={yScale}
                bottomScale={xScale}
                bottomLabel={_.isString(xaxisLabel)?xaxisLabel:xaxisName}
                leftHideTicks={false}
                leftLabel={""} //_.isString(yaxisLabel)? yaxisLabel : yaxisName
                moveBottomToLeft={false}
                bottomHideTickLabels={true}
                findAttributesForBottomScale={false}
            
                {...{ chartHeight, chartWidth }} />
        
            <QuantileBackground {...{xScale, yScale, data : q, keyNames : yaxisName, rerenderDependency: rerenderBackground}} />
            {profileAsLine ? <g >
                <ProfileLine {...{
                    valid,
                    data: hoverDataInSubset,
                    xScale,
                    yScale,
                    yaxisName,
                    xaxisName,
                    rerenderDependency: _.concat(rerenderHover, rerenderBackground),
                    labelNames,
                    showPoints: yaxisName.length <= 20,
                    stroke
                }} />
            </g> : null}
            {profileAsBar ? <g>
                <ProfileBars {...{ valid, data: hoverData, xScale, yScale, yaxisName, xaxisName, rerenderDependency: rerenderHover }} />
            </g> : null}

            {/* Indicate Searches */}
            
            {searchIndices.size > 0 ? <FilterIndicator {...{ searchIndices : searchIndicesInSubset, width, margins }} /> : null}
            
            {<ChartTopLeftLabel {...{ margins, labelTexts: [`C${chartIdx}`,`n=${subsetIndices.size}`], textOffset: 3, color : [stroke,"#00000"] }} />}
            
        </SVG >
    )
}