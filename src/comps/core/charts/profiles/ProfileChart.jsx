import { getQuantilesInArrayByKeyNames } from "../../../../services/arrays/boundaries";
import { getChartWidthAndHeightWithMargins } from "../../../../services/plotting/size";
import { SVG } from "../SVGHeader";
import AxisWithBackground from "../axis";
import { useMemo, useRef } from "react";
import { memo } from "react";
import { scaleBand, scaleLinear } from "@visx/scale";

import ProfileLine from "./Line"
import ProfileBars from "./Bars"

import { QuantileBackground } from "./QuantileBackground";
import { Group } from "@visx/group";
import { Text } from "@visx/text";
import { FilterIndicator } from "../annotations/Filter";
import _ from "lodash"
import { Protein } from "../../base/protein/Protein";


export function _extractProteinName(proteinTag, proteinTagMap, sep = ";") {
    if (_.isString(proteinTag) && proteinTag.length > 0) {
        if (proteinTag.includes(sep)) {
            const tags = proteinTag.split(sep).map(t => t.trim())
            return tags.map(t => proteinTagMap.has(t) ? proteinTagMap.get(t).text : t).join(sep)
        }
        return proteinTagMap.has(proteinTag) ? proteinTagMap.get(proteinTag).text : proteinTag
    }
    return proteinTag

}

function areSetsEqual(a, b) {
   
    if (a.size !== b.size) return false;
    for (const value of a) {
        if (!b.has(value)) return false;
    }

    return true;
}


export function ChartTopLeftLabel({ margins, labelTexts, textOffset = 1, totalYOffset = 4, fontSize = 14, color = ["#00000"], isFeature = [false]}) {

    return (<Group left={margins.left} top={margins.top + totalYOffset}>

        {labelTexts.map((text, textIdx) => {
            const textProps = {
                key: `${text}-${textIdx}`,
                fill : color[textIdx],
                x : 0,
                dx : textOffset,
                fontSize,
                y : fontSize * textIdx,
                verticalAnchor : "start",
                textAnchor : "start"
            }
            if (isFeature[textIdx]) return <Protein tag={text} inSVG={true} svgTextProps={textProps}/>
            return <Text
                    key={`${text}-${textIdx}`}
                    fill={color[textIdx]}
                    x={0}
                    dx={textOffset}
                    fontSize={fontSize}
                    y={fontSize * textIdx}
                    verticalAnchor="start"
                    textAnchor="start" >
                    {text}
                </Text>
        })}
        
        </Group>) 
}

//export const ProfileChart = memo(
function ProfileChartComponent({
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
        profileAsLine = true,
        profileAsBar = false,
        subsetIndices = new Set(), // subset the data to only plot those 
        searchIndices = new Set(),
        hoverIndices = new Set(),
        proteinTagMap = new Map(),
        showSearchLabels = true,
        showHoverLabels = true,
        hoverDataInSubset = []
}) {    
    
            const svgRef = useRef(null);
            const { chartWidth, chartHeight } = getChartWidthAndHeightWithMargins({ width, height, margins })

        
            const subsetData = useMemo(() => {
                return data.filter((d, idx) => subsetIndices.has(idx))
            }, [data, subsetIndices])
        
        
            const q = useMemo(() => {
                return getQuantilesInArrayByKeyNames({
                    data: subsetData,
                    keyNames: yaxisName,
                });
                }, [subsetData, yaxisName]);
            
            
            const yScale = useMemo(() => {

                let min = Infinity;
                let max = -Infinity;

                for (const y of yaxisName) {
                    const l = limits[y];

                    if (l.min < min) min = l.min;
                    if (l.max > max) max = l.max;
                }
                
                const yDomain = {
                    min,
                    max
                }
                
                return scaleLinear(
                    {
                        domain: [yDomain.max, yDomain.min],
                        range: [margins.top, margins.top + chartHeight],
                        nice: true
                    }
                )
            }, [yaxisName, limits, chartHeight, margins.top])

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
            }, [yaxisName, chartWidth, margins.left]);

            const rerenderDeps = useMemo(
                () => [...rerenderHover, ...rerenderBackground],
                [rerenderHover, rerenderBackground]
            );

            const chartLabels = useMemo(
                () => [`C${chartIdx}`, `n=${subsetIndices.size}`],
                [chartIdx, subsetIndices.size]
            );
        
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
                
                    <QuantileBackground {
                        ...{ xScale, yScale, data: q, keyNames: yaxisName, rerenderDependency: rerenderBackground }} />
                    
                    
                    {profileAsLine ? <g >
                        <ProfileLine {...{
                            valid,
                            data: hoverDataInSubset,
                            xScale,
                            yScale,
                            yaxisName,
                            xaxisName,
                            rerenderDependency: rerenderDeps,
                            labelNames,
                            showPoints: yaxisName.length <= 20,
                            stroke
                        }} />
                    </g> : null}
                    {profileAsBar ? <g>
                        
                        <ProfileBars {...{ valid, data: hoverDataInSubset, xScale, yScale, yaxisName, xaxisName, rerenderDependency: rerenderDeps }} />
                    </g> : null}

                    {/* Indicate Searches */}


                    {showSearchLabels && searchIndices.size > 0 ? Array.from(searchIndices).slice(0, 5).map((dataIdx,idx) => {
        
                        return <Text
                            x={xScale(yaxisName[yaxisName.length - 1])-2}
                            y={yScale(yScale.domain()[1])}
                            fontSize={13}
                            fontWeight={hoverIndices.has(dataIdx) ? "800" : "400"}
                            dy={-8 - 11 * idx}
                            textAnchor="end"
                            verticalAnchor="middle">
                            {_extractProteinName(data[dataIdx].tag, proteinTagMap)}</Text>
                    }) : null}


                    {showHoverLabels && hoverDataInSubset.length > 0 && !(searchIndices.size > 0)  ? hoverDataInSubset.slice(0, 5).map((dataItem, idx) => {
                        return <Text
                            x={xScale(yaxisName[0])+2}
                            y={yScale(yScale.domain()[1])}
                            fontSize={13}
                            dy={-8 - 11 * idx}
                            textAnchor="start"
                            verticalAnchor="middle">
                            {_extractProteinName(dataItem.tag, proteinTagMap)}</Text>
                    }) : null} 
                    
                    {searchIndices.size > 0 ? <FilterIndicator {...{ searchIndices, width, margins }} /> : null}
                    
                    {<ChartTopLeftLabel {...{ margins, labelTexts: chartLabels, textOffset: 3, color : [stroke,"#00000"] }} />}
                    
                </SVG >
            )
    } //, areEqual)
        

function areEqual(prevProps, nextProps) {
    if (prevProps.chartIdx !== nextProps.chartIdx) return false 
    if (prevProps.width !== nextProps.width) return false 
    if (prevProps.height !== nextProps.height) return false
    if (!areSetsEqual(prevProps.searchIndices, nextProps.searchIndices)) return false
    if (!areSetsEqual(prevProps.hoverIndices, nextProps.hoverIndices)) return false
    if (!areSetsEqual(prevProps.subsetIndices, nextProps.subsetIndices)) return false
    return true

}

export const ProfileChart = memo(ProfileChartComponent, areEqual)