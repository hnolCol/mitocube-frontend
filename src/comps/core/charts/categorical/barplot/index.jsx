import { Group } from "@visx/group"
import MultiCategoricalChart from "../multiple"
import { Text } from "@visx/text"
import Bar from "../../barplot/Bar"
import { AxisBottom, AxisLeft } from "@visx/axis"
import { ChartLegend } from "../../legend"
import _ from "lodash"
import { getAxisStrokeColor, getColorPalette } from "../../../colors/colorPalette"
import { getNumberTicks } from "../../../../../services/plotting/ticks"
import ErrorBar from "../../error"
import SingleCategoricalChart from "../single"
import AxisBackground from "../../background"
import AxisWithBackground from "../../axis"
import SubplotName from "../../annotations/subplotName"
import { useTooltip, useTooltipInPortal } from "@visx/tooltip"
import { localPoint } from "@visx/event"
import PropTypes from "prop-types"


function getNamesFromCategories({ categoricalNames, data, labels = ["colorName","splitName","subplotName"] }) {

    const checkedNames = categoricalNames.filter(catName => _.has(data[0], catName))
    return Object.fromEntries(checkedNames.map((checkedName,idx) => [labels[idx],checkedName]))
}


CategoricalBarplot.propTypes = {
    colorName: PropTypes.string,
    errorName : PropTypes.string
    
}

function CategoricalBarplot({
    width = 400,
    height = 300,
    data = [
    
        { y: 5, T: "A", G: "WT", O : "0.5h", e : 0.2},
        { y: 4, T: "B", G: "WT", O : "0.5h", e : 0.4 },
        { y: 10, T: "C", G: "WT", O: "0.5h", e : 1.2 },
        { y: 5, T: "A", G: "WT", O : "0.5h", e : 0.2 },
        { y: 4, T: "B", G: "WT", O : "0.5h", e : 0.2 },
        { y: 10, T: "C", G: "WT", O : "0.5h", e : 0.2 },
        { y: 5, T: "A", G: "KO", O : "0.5h", e : 0.2 },
        { y: 40, T: "B", G: "KO", O : "0.5h", e : 0.2 },
        { y: -20, T: "C", G: "KO", O : "0.5h", e : 0.2 },
        { y: 5, T: "A", G: "WT", O : "10h", e : 3.2 },
        { y: 4, T: "B", G: "WT", O : "10h", e : 0.2 },
        { y: 2, T: "C", G: "WT", O : "10h", e : 0.2 },
        { y: 5, T: "A", G: "KO", O : "10h", e : 0.8 },
        { y: 4, T: "B", G: "KO", O : "10h", e : 0.2 },
        { y: 2, T: "C", G: "KO", O : "10h", e : 6.2 }
    ],
    
    margins = {
        left: 30,
        right: 5,
        bottom: 35,
        top: 5
    },
    yaxisName = "y",
    colorName,
    splitName,
    subplotName,
  //  categoricalNames = ["O","T","G"],
    errorName = "e",
    tooltipNames = ["T","G"],
    colorPalette = [],
    minMaxYDomain = undefined,
    innerSubplotPadding = 0.05,
    outerSubplotPadding = 0.1,
    innerSplitPadding = 0.2,
    innerColorPadding = 0.0,
    svgID = undefined,
    }) {
    
   // const { colorName, splitName, subplotName } = getNamesFromCategories({categoricalNames,data})
    const uniqueColorValuesFromData = _.uniqBy(data, colorName)
    const colorValues =  colorPalette.length === 0 ? getColorPalette(uniqueColorValuesFromData.length) : colorPalette.length === uniqueColorValuesFromData.length ? colorPalette : getColorPalette(uniqueColorValuesFromData.length)
    const legendColors = Object.fromEntries(uniqueColorValuesFromData.map((d, idx) => [d[colorName], colorValues[idx]]))
    console.log(colorName, splitName, subplotName,_.isString(colorName))
    console.log(colorName && splitName === undefined && subplotName === undefined)
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
    
    const getTooltipData = (value, errorValue, barData) => {
        const tooltipInfo = Object.fromEntries(_.map(tooltipNames, tooltipName => [tooltipName, barData[tooltipName]]).filter(v => v[1] !== undefined))
        return {[yaxisName] : _.round(value,2), error : _.round(errorValue,2), ...tooltipInfo}
    }
    
    const handleMouseOver = (event, bartooltipData) => {
        
        const coords = localPoint(event.target.ownerSVGElement, event);
        showTooltip({
          tooltipLeft: coords.x,
          tooltipTop: coords.y,
          tooltipData: bartooltipData
        });
    };
    
    return (
        <div className="flex flex-column">
            {colorName !== undefined ? <ChartLegend groupings={{ [colorName]: legendColors }} title={colorName} /> : null}
            {colorName && splitName === undefined && subplotName === undefined?
                <SingleCategoricalChart
                {...{data,
                    width,
                    height,
                    svgID,
                    margins,
                    yaxisName,
                    colorName,
                    minMaxYDomain,
                    colorPalette: legendColors,
                    svgRef : containerRef
                    }}>
                    {(categoricalData) => categoricalData.map(({
                        idx,
                        colorCategories,
                        data,
                        yaxisName,
                        colorName,
                        margins,
                        splitColorScale,
                        colorScale,
                        yScale,
                        chartHeight,
                        chartWidth,
                        colorBandwidth,
                    }, didx) => {
                        
                        return (
                            <g key={`singleCat-bar-${idx}`}>
                                <AxisWithBackground
                                    margins={margins}
                                    leftScale={yScale}
                                    bottomScale={splitColorScale}
                                    bottomLabel={colorName}
                                    leftLabel={yaxisName}
                                    {...{ chartHeight, chartWidth }} />
                                
                                {colorCategories.map(colorCategory => {
                                    const xBar = splitColorScale(colorCategory)
                                    const color = colorScale(colorCategory)
                                    const dataForColorCategory = data.filter(d => d[colorName] === colorCategory)[0]
                                    const yValue = dataForColorCategory[yaxisName]
                                    const yBar = yScale(yValue)
                                    const errorValue = dataForColorCategory[errorName]
                                   
                                    return (
                                        <Group key={`bar-error-${colorCategory}`} left={margins.left}
                                            onMouseEnter={e => handleMouseOver(e, getTooltipData(yValue, errorValue, dataForColorCategory))}
                                            onMouseLeave={hideTooltip}>
                                            <Bar x={xBar} y1={yBar} y0={yScale(0)} fill={color} width={colorBandwidth} />
                                            {/* add the error bar if any errorName (key for object in dat) is given */}
                                            
                                            {errorName !== undefined && !_.isNaN(errorValue) && _.isNumber(errorValue)?
                                                <ErrorBar
                                                    x={xBar + colorBandwidth / 2}
                                                    y0={yBar} //bar start 
                                                    y1={yValue > 0 ? yScale(yValue + errorValue) : yScale(yValue - errorValue)}
                                                    width={colorBandwidth*0.5} /> : null}
                                    </Group>
                                    )
                                })}
                            </g>
                        )
                })}

                </SingleCategoricalChart>:
        
            <MultiCategoricalChart
                {...{
                    data,
                    width,
                    height,
                    svgID,
                    margins,
                    yaxisName,
                    colorName,
                    splitName,
                    subplotName,
                    innerColorPadding,
                    innerSplitPadding,
                    innerSubplotPadding,
                    outerSubplotPadding,
                    colorPalette: legendColors,
                    minMaxYDomain,
                    svgRef : containerRef
                }}>
            {(categoricalData) => categoricalData.map((
                {
                    yaxisName,
                    splitName,
                    colorName,
                    subplotCategory,
                    splitCategories,
                    subplotScale,
                    splitScale,
                    splitColorScale,
                    colorScale,
                    yScale,
                    subplotData,
                    chartHeight, chartWidth,
                    colorBandwidth,
                    margins,
                    xcenter,
                    subplotCategoryFound,
                    colorCategoryFound,
                    splitCategoryFound}, didx) => {
                        console.log(didx,"asd")
                const subplotStart = subplotScale(subplotCategory)
                const subplotWidth = subplotScale.bandwidth()
                console.log(subplotStart)
                console.log(splitCategories)
                console.log(subplotData)
                console.log(subplotScale.bandwidth())
                  return(
                        <g key={`${subplotCategory}-subplot`}>
                        
                          
                          <AxisWithBackground
                                leftLeft={subplotStart}
                                topBottom={margins.top + chartHeight}
                                margins={margins}
                                leftScale={yScale}
                                bottomScale={splitScale}
                                leftTickLabelProps={{ opacity: didx === 0 ? 1 : 0 }}
                                bottomLabel={categoricalData.length === 1?splitName:""}
                                leftLabel={didx === 0 ? yaxisName : ""}
                                {...{ chartHeight, chartWidth :  subplotWidth}} />
                        
                          {subplotCategoryFound ?
                              <Text x={xcenter}
                                  y={margins.top + 10}
                                  verticalAnchor="middle"
                                  textAnchor="middle">{subplotCategory}</Text> : null}
                          <Text
                            x={margins.left + chartWidth / 2 }
                            y={margins.top + chartHeight + 20}
                            verticalAnchor="start"
                            textAnchor="middle">{splitName}</Text>
                        
                         {/* If there is just a split Category, the split scale cannot be used -- very odd case*/}
                          {!splitCategoryFound && !colorCategoryFound ?
                              <Group left={subplotStart}>
                                  <Bar x={(subplotWidth-subplotWidth*0.75)/2} y1={yScale(subplotData[0][yaxisName])} y0={yScale(0)} fill={colorScale()} width={subplotWidth*0.75}/>
                              </Group>  
                        : null}

                        {/* if splitName is undefined, splitCategories will be en empty array, no plotting required */}
                        {splitCategories.map((splitCategory, splitIdx) => {
                            
                        const splitCatData = subplotData.filter(m => m[splitName] === splitCategory)
                        const splitStart = splitScale(splitCategory)
    
                        return (
                            <Group left={subplotStart + splitStart} key={`${splitCategory}-${splitIdx}`}>
                            {splitCatData.map((colorCatData, colorIdx) => {
                                const colorCategory = colorCatData[colorName]
                                const color = colorScale(colorCategory)
                                const yValue = colorCatData[yaxisName]
                                const xBar = splitColorScale(colorCategory)
                                const yBar = yScale(yValue)
                                const errorValue = colorCatData[errorName]

                                return (
                                    <Group key={`${colorIdx}-${subplotCategory}-${colorCategory}`}
                                        onMouseEnter={e => handleMouseOver(e, getTooltipData(yValue,errorValue,colorCatData))}
                                        onMouseLeave={hideTooltip}>
                                        
                                        <Bar x={xBar} y1={yBar} y0={yScale(0)} fill={color} width={colorBandwidth} />
                                        {/* add the error bar if any errorName (key for object in dat) is given */}
                                        {errorName !== undefined &&  !_.isNaN(errorValue) && _.isNumber(errorValue)?
                                            <ErrorBar
                                                x={xBar + colorBandwidth / 2}
                                                y0={yBar} //bar start 
                                                y1={yValue > 0 ? yScale(yValue + errorValue) : yScale(yValue - errorValue)}
                                                width={colorBandwidth*0.5} /> : null}
                                    </Group>
                                )
                                })}
                            </Group>
                        )
                        })}
                    </g>)})}
                </MultiCategoricalChart> }
            
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



export default CategoricalBarplot