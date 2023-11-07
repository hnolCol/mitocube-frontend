


import _ from "lodash"
import { useMemo } from "react"
import { addMarginToBoundaries } from "../../../../services/arrays/boundaries"
import { getQuantiles } from "../../../../services/statistics/quantiles"
import { getValueFromArrayOfObjectsByKey } from "../../../../services/arrays/transforms"
import { scaleLinear } from "@visx/scale"
import { SVG } from "../SVGHeader"
import Verticalbox from "./Verticalbox"
import Point from "../scatter/Point"
import { Text } from "@visx/text"
import { useTooltip, useTooltipInPortal } from "@visx/tooltip"
import SubplotName from "../annotations/SubplotName"
import { localPoint } from "@visx/event"



// Component showing a distirubtion in a boxplot iwht value highlighted 
// 


function MinimalVerticalBoxplot({
    width = 300,
    height = 100,
    margins = {
        left: 5,
        top: 25,
        right: 5,
        bottom: 10
    },
    quantiles,
    scaledQuantiles,
    highlightedItem,
    highlightItemScaled,
    highligtedItemOverHaldWidth,
    scaleBoxplotHeight,
    yaxisName
}) {
    const chartWidth = width - margins.left - margins.right
    const chartHeight = height - margins.top - margins.bottom
    const boxWidth = chartHeight * scaleBoxplotHeight
    const center = chartHeight / 2 + margins.top
    
    const relativeDistanceToMedian = highlightedItem.length === 1 ? _.round((highlightedItem[0][yaxisName] - quantiles.median)/quantiles.median * 100,1):undefined
    const {
        tooltipData,
        tooltipLeft,
        tooltipTop,
        tooltipOpen,
        showTooltip,
        hideTooltip,
    } = useTooltip();
    
      const { containerRef, TooltipInPortal } = useTooltipInPortal({
        // use TooltipWithBounds
        detectBounds: true,
        // when tooltip containers are scrolled, this will correctly update the Tooltip position
        scroll: true,
      })
    
    const handleMouseOver = (event, quantiles) => {
        const coords = localPoint(event.target.ownerSVGElement, event);
        showTooltip({
          tooltipLeft: coords.x,
          tooltipTop: coords.y,
          tooltipData: quantiles
        });
      };

    
    return (
        <div>
        <SVG {...{ width, height }} svgRef={containerRef}>
            <g onMouseLeave={hideTooltip}>
                <rect x={margins.left} y={margins.top} width={chartWidth} height={chartHeight} fill="white"/>
                    <Verticalbox center={center} width={boxWidth} {...scaledQuantiles} handleBoxMouseEnter = {(e) => handleMouseOver(e,quantiles)} />
                    {/* add label */}
                    <SubplotName text={yaxisName} loc="topleft" />
                {highlightedItem.length === 1 ?
                    <g>
                        <line x1={highlightItemScaled} x2={highlightItemScaled} y1={center} y2={center - boxWidth / 2 - 5} stroke="black" />
                        <Point p={[highlightItemScaled, center]} r={boxWidth / 4} fill="#466688" />
                        <Text
                                x={highlightItemScaled}
                                y={center - boxWidth / 2 - 5}
                                dx={highligtedItemOverHaldWidth?2:-2}
                                dy={-3}
                                verticalAnchor="end"
                                textAnchor={highlightItemScaled > width / 2?"end":"start"}>
                                
                                {highlightedItem[0][yaxisName]}
                            </Text>
                            <Text x={scaledQuantiles.max} dx={8} y={center} fontWeight={900} verticalAnchor="middle">{`${relativeDistanceToMedian}${"%"}`}</Text>
                            
                    </g> : null}          
        </g>
            </SVG>
            {tooltipOpen && (
                <TooltipInPortal
                // set this to random so it correctly updates with parent bounds
                key={Math.random()}
                top={tooltipTop}
                left={tooltipLeft}
                >   
                    <div className="flex flex-column">
                        {Object.keys(tooltipData).map(qLabel => <div key={qLabel}>{qLabel} : <span className="h0-span">{tooltipData[qLabel]}</span></div>)}
                        
                    </div>
                </TooltipInPortal>
            )}
        </div>
    )
}




function BoxplotWithValue({
    width = 300,
    height = 100,
    margins = {
        left: 5,
        top: 25,
        right: 35,
        bottom: 10
    },
    data = [{ idx: 1, ids: 2200, p : 30 }, { idx: 2, ids: 250, p : 35  }, { idx: 3, ids: 789, p : 32 }, { idx: 5, ids: 739, p : 33  }],
    highligtedIdx = { idx : 1 },
    yaxisNames = ["ids", "p"],
    scaleBoxplotHeight = 0.35}) {
    // Boxplots for yaxisNames of an array of objects - it uses an individual yScale for each yaxisName. 
    // all values in yaxisNames must be numeric, which is not checked. 
    // highlightIdx allows to plot an individual data point. 
    const chartWidth = width - margins.left - margins.right
    const chartHeight = height - margins.top - margins.bottom
    
    const highlightedItem = _.filter(data,highligtedIdx)
    const quantiles = useMemo(() => {
        return Object.fromEntries(yaxisNames.map(yaxisName => {
            var values = getValueFromArrayOfObjectsByKey({ data, keyName : yaxisName })
            var quantiles = getQuantiles(values, [0, 0.25, 0.5, 0.75, 1], NaN, false)
            return [yaxisName, Object.fromEntries(quantiles.values.map((q,idx) => { return [quantiles.labels[idx],q]}))]
        }))
    }, [yaxisNames,data])


    // const vertDistScale = useMemo(() => {
    //     return scaleBand({
    //         domain : yaxisNames,
    //         range: [margins.top, chartHeight + margins.top],
    //         paddingInner: 0.2,
    //         paddingOuter : 0.05
    //     })
    // },[yaxisNames,chartHeight])

    const yScales = useMemo(() => {
        //calculate domains 
        // yScales in this case scales the x-axis due to the vertical box
        return Object.fromEntries(yaxisNames.map(yaxisName => {
            var qs = quantiles[yaxisName]
            var domain = {min : qs.min, max : qs.max}
            var domainWithMargin = addMarginToBoundaries({ domain })
            return [yaxisName, scaleLinear({
                domain: [domainWithMargin.min,domainWithMargin.max],
                range: [margins.left, chartWidth],
                nice: true
            })]

        }))
    
    }, [quantiles,chartWidth])
    
    return (
        <div className="flex flex--wrap">

            <div>
                {yaxisNames.map((yaxisName, svgIdx) => {
                    var yscale = yScales[yaxisName]
                    
                    const highlightItemScaled = highlightedItem.length === 1 ? yscale(highlightedItem[0][yaxisName]) : NaN
                    const highligtedItemOverHaldWidth = highlightItemScaled > width / 2
                    const scaledQuantiles = Object.fromEntries(Object.keys(quantiles[yaxisName]).map(
                        quantLabel => {
                            return ([quantLabel, yscale(quantiles[yaxisName][quantLabel])])
                        }))
                    return (
                        <MinimalVerticalBoxplot {...{
                            yaxisName,
                            width,
                            height,
                            margins,
                            quantiles : quantiles[yaxisName],
                            highlightedItem,
                            highlightItemScaled,
                            scaledQuantiles,
                            highligtedItemOverHaldWidth,
                            scaleBoxplotHeight
                        }} />
                    )

                })}
                

            </div>
            

        </div>

    )
}



export default BoxplotWithValue