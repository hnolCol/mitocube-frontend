import { addMarginToBoundaries, getQuantilesInArrayByKeyNames } from "../../../../services/arrays/boundaries";
import { getChartWidthAndHeightWithMargins } from "../../../../services/plotting/size";
import { SVG } from "../SVGHeader";
import AxisWithBackground from "../axis";
import { useMemo, useRef } from "react";
import { localPoint } from "@visx/event";
import { scaleBand, scaleLinear } from "@visx/scale";

import ProfileLine from "./Line"
import ProfileBars from "./Bars"
import { getQuantiles } from "../../../../services/statistics/quantiles";
import { getQuantilesByGroups } from "../../../../services/arrays/groupby";
import { QuantileBackground } from "./QuantileBackground";
import FilterIcon, { FilterSVG } from "../../svg/icons/chartSelection/Filter";
import { Group } from "@visx/group";
import { Text } from "@visx/text";
import { FilterIndicator } from "../annotations/Filter";
import _ from "lodash"



export function ChartTopLeftLabel({ margins, labelTexts, textOffset = 1, totalYOffset = 4, fontSize = 14}) {
    return (<Group left={margins.left} top={margins.top + totalYOffset}>
        {labelTexts.map((text, textIdx) => <Text key={`${text}-${textIdx}`} x={0} dx={textOffset} fontSize={fontSize} y={fontSize * textIdx} verticalAnchor="start" textAnchor="start">
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
    svgID,
    rerenderHover,
    rerenderBackground,
    hoverData,
    hoverIndices,
    profileAsLine = true,
    profileAsBar = false,
    subsetIndices = new Set(), // subset the data to only plot those 
    searchIndices = new Set(),
}) {
    //console.log(subsetIndices,hoverIndices)
    let hoverIdcsInSubset = hoverIndices.size > 0 ? Array.from([...hoverIndices].filter(idx => subsetIndices.size > 0 && subsetIndices.has(idx))) : []
    let searchIndicesInSubset = searchIndices.size > 0 ? new Set(Array.from([...searchIndices]).filter(idx => subsetIndices.has(idx))) : new Set()
    const hoverDataInSubset = hoverIdcsInSubset.map(idx => data[idx])
    const svgRef = useRef(null);
    const { chartWidth, chartHeight } = getChartWidthAndHeightWithMargins({ width, height, margins })
    
    const q = useMemo(() => getQuantilesInArrayByKeyNames({ data : data.filter((_,idx) => subsetIndices.has(idx)), keyNames: yaxisName }), [yaxisName])
    
    const yScale = useMemo(() => {
        const limitValues = yaxisName.map(yName => limits[yName])
        const minLimit = _.minBy(limitValues, "min")
        const maxLimit = _.minBy(limitValues, "max")
        const yDomain = { min : minLimit.min, max : maxLimit.max }//limits[yaxisName]
        const yDomainWithMargin = addMarginToBoundaries({ domain: yDomain})
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
                <ProfileLine {...{ valid, data: hoverDataInSubset, xScale, yScale, yaxisName, xaxisName, rerenderDependency: rerenderHover, labelNames, showPoints : !yaxisName.length > 30}} />
            </g> : null}
            {profileAsBar ? <g>
                <ProfileBars {...{ valid, data: hoverData, xScale, yScale, yaxisName, xaxisName, rerenderDependency: rerenderHover }} />
            </g> : null}

            {/* Indicate Searches */}
            
            {searchIndices.size > 0 ? <FilterIndicator {...{ searchIndices : searchIndicesInSubset, width, margins }} /> : null}
            
            {<ChartTopLeftLabel {...{ margins, labelTexts: [`C${chartIdx}`,`n=${subsetIndices.size}`], textOffset: 3 }} />}
            
            {/* {
                searchIndices.size > 0 ? <ProfileLine {...{ valid, data: searchData, xScale, yScale, yaxisName, xaxisName, rerenderDependency: rerenderBackground, stroke : "blue" }} /> : null} */}


            {/* <rect x={0} y={0} width={width} height={height} onMouseMove={handeMouseHover} fill="transparent"/> */}
        </SVG >
    )
}