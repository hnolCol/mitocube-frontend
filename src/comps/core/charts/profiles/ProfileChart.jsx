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




export function ChartTopLeftLabel({ margins, labelTexts, textOffset = 1, totalYOffset = 4, fontSize = 14}) {
    return (<Group left={margins.left} top={margins.top + totalYOffset}>
        {labelTexts.map((text, textIdx) => <Text key={`${text}-${textIdx}`} x={0} dx={textOffset} fontSize={fontSize} y={fontSize * textIdx} verticalAnchor="start" textAnchor="start">
            {text}
        </Text>)}
    </Group>) 
}

export function ProfileChart({
    chartIdx,
    width = 300,
    height = 300,
    margins = {
        left: 40,
        top: 5,
        right: 5,
        bottom: 40
    },
    data,
    valid,
    yaxisName = [],
    xaxisName,
    labelNames = [],
    limits,
    svgID,
    rerenderHover,
    rerenderBackground,
    hoverData,
    profileAsLine = true,
    profileAsBar = false,
    searchIndices = new Set(),
    hoverIndices = new Set(),
    setHoverDataByDataIndex
    
}) {

    const svgRef = useRef(null);
    const { chartWidth, chartHeight } = getChartWidthAndHeightWithMargins({ width, height, margins })
    
    const q = getQuantilesInArrayByKeyNames({data, keyNames : yaxisName})
    const yScale = useMemo(() => {
    
        const yDomain = { min: 0, max: 5000 }//limits[yaxisName]
        const yDomainWithMargin = addMarginToBoundaries({ domain: yDomain})
        return scaleLinear(
            {
                domain: [yDomainWithMargin.max, yDomainWithMargin.min],
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
                bottomLabel={xaxisName}
                leftHideTicks={false}
                leftLabel={yaxisName}
                moveBottomToLeft={false}
                findAttributesForBottomScale={false}
                {...{ chartHeight, chartWidth }} />
        
            <QuantileBackground {...{xScale, yScale, data : q, keyNames : yaxisName, rerenderDependency: rerenderBackground}} />
            {profileAsLine ? <g >
                <ProfileLine {...{ valid, data: hoverData, xScale, yScale, yaxisName, xaxisName, rerenderDependency: rerenderHover, labelNames }} />
            </g> : null}
            {profileAsBar ? <g>
                <ProfileBars {...{ valid, data: hoverData, xScale, yScale, yaxisName, xaxisName, rerenderDependency: rerenderHover }} />
            </g> : null}

            {/* Indicate Searches */}
            
            {searchIndices.size > 0 ? <FilterIndicator {...{ searchIndices, width, margins }} /> : null}
            
            {<ChartTopLeftLabel {...{ margins, labelTexts: [`Cluster 8`,`n=${data.length}`], textOffset: 2 }} />}
            
            {/* {
                searchIndices.size > 0 ? <ProfileLine {...{ valid, data: searchData, xScale, yScale, yaxisName, xaxisName, rerenderDependency: rerenderBackground, stroke : "blue" }} /> : null} */}


            {/* <rect x={0} y={0} width={width} height={height} onMouseMove={handeMouseHover} fill="transparent"/> */}
        </SVG >
    )
}