import { Group } from "@visx/group"
import MultiCategoricalChart from "../multiple"
import { Text } from "@visx/text"
import Bar from "../../barplot/Bar"
import { ChartLegend } from "../../legend"
import _ from "lodash"
import { getAxisStrokeColor, getColorPalette } from "../../../colors/colorPalette"
import ErrorBar from "../../error"
import SingleCategoricalChart from "../single"
import AxisWithBackground from "../../axis"
import { useTooltip, useTooltipInPortal } from "@visx/tooltip"
import { localPoint } from "@visx/event"
import PropTypes from "prop-types"
import MetricTable from "../../../base/metrictable"
import { mapAttributeValueTagsToAttributes } from "../../../../../services/attributes"



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
        left: 45,
        right: 0,
        bottom: 35,
        top: 5
    },
    yaxisName = "y",
    colorName,
    splitName,
    subplotName,
    yaxisLabel, 
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
    attributesByTag,
    attributeValuesByTag,
    genotypesByLabel
    }) {
    
   // const { colorName, splitName, subplotName } = getNamesFromCategories({categoricalNames,data})
    const uniqueColorValuesFromData = _.uniqBy(data, colorName)
    const colorValues =  colorPalette.length === 0 ? getColorPalette(uniqueColorValuesFromData.length) : colorPalette.length === uniqueColorValuesFromData.length ? colorPalette : getColorPalette(uniqueColorValuesFromData.length)
    const legendColors = Object.fromEntries(uniqueColorValuesFromData.map((d, idx) => [d[colorName], colorValues[idx]]))
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
        const attrValuesByTag = attributesByTag.attribute_values
        const tooltipInfo = _.map(tooltipNames, tooltipName => {
            let tooltipValue = barData[tooltipName]
            const { attrValues, asString, isAttrValue } = mapAttributeValueTagsToAttributes({attrValueTag : tooltipValue, attrValuesByTag})
            return { text: tooltipName, value : asString }
        })
        const barInfo = [{text: yaxisName, value : _.round(value,2)}, {text: "Error", value : _.isNaN(errorValue)?"NaN":_.round(errorValue,2)}]
        return _.concat(barInfo,tooltipInfo)
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
            {/* {colorName !== undefined ? <ChartLegend groupings={{ [colorName]: legendColors }} title={colorName} /> : null} */}
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
                                {/* add axis with background */}
                                <AxisWithBackground
                                    margins={margins}
                                    leftScale={yScale}
                                    bottomScale={splitColorScale}
                                    bottomLabel={""}
                                    leftLabel={_.isString(yaxisLabel) ? yaxisLabel : yaxisName}
                                    attributeValuesByTag={attributeValuesByTag}
                                    valueIsFeature={attributesByTag[colorName].has_features_value}
                                    {...{ chartHeight, chartWidth, genotypesByLabel }} />
                                {/* x axis label */}
                                <Text
                                    x={margins.left + chartWidth / 2}
                                    y={margins.top + chartHeight + 20}
                                    verticalAnchor="start"
                                    textAnchor="middle">{colorName}
                                </Text>
                                
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
                    svgRef: containerRef,
                    attributesByTag,
                    attributeValuesByTag
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
                const subplotStart = subplotScale(subplotCategory)
                const subplotWidth = subplotScale.bandwidth()
                
                  return(
                        <g key={`${subplotCategory}-subplot`}>
                        
                          
                          <AxisWithBackground
                                leftLeft={subplotStart}
                                topBottom={margins.top + chartHeight}
                                margins={margins}
                                leftScale={yScale}
                                bottomScale={splitScale}
                                bandwidth={colorBandwidth * 1.1}
                                leftTickLabelProps={{ opacity: didx === 0 ? 1 : 0 }}
                                bottomLabel={""}
                                attributeValuesByTag={attributeValuesByTag}
                                valueIsFeature={_.isString(splitName) ? attributesByTag[splitName].has_features_value : false}
                                leftLabel={didx === 0 ? _.isString(yaxisLabel)?yaxisLabel:yaxisName : ""}
                                {...{ chartHeight, chartWidth :  subplotWidth, genotypesByLabel}} />
                        
                        {subplotCategoryFound ?
                              <g>
                                  <Text
                                    x={xcenter}
                                    y={margins.top + 12}
                                      verticalAnchor="middle"
                                      width={subplotWidth}
                                    textAnchor="middle">
                                    {mapAttributeValueTagsToAttributes({attrValueTag : subplotCategory, attrValuesByTag : attributesByTag.attribute_values}).asString}
                                </Text>
                              </g> : null}
                          
                          {didx === 0 ? <Text
                              x={margins.left + chartWidth / 2}
                              y={margins.top + chartHeight + 20}
                              verticalAnchor="start"
                              textAnchor="middle">{splitName}</Text> : null}
                        
                          
                        {/* {If there is not split but a subplot} */}
                          {!splitCategoryFound && colorCategoryFound && subplotCategoryFound ?
                              subplotData.map(subplotDataArray => {
                                    var barWidth = splitColorScale.bandwidth()
                                    var colorCategory = subplotDataArray[colorName]
                                    var xBar = splitColorScale(colorCategory)
                                    var yValue = subplotDataArray[yaxisName]
                                    var yBar = yScale(yValue)
                                    var errorValue = subplotDataArray[errorName]
                                  
                                    return (
                                        <Group left={subplotStart}
                                            onMouseEnter={e => handleMouseOver(e, getTooltipData(yValue, errorValue, subplotDataArray))}
                                            onMouseLeave={hideTooltip}>
                                            
                                            <Bar x={xBar} y1={yBar} y0={yScale(0)} fill={colorScale(colorCategory)} width={barWidth} />
                                            {errorName !== undefined &&  !_.isNaN(errorValue) && _.isNumber(errorValue)?
                                            <ErrorBar
                                                x={xBar+barWidth/2}
                                                y0={yBar} //bar start 
                                                y1={yValue > 0 ? yScale(yValue + errorValue) : yScale(yValue - errorValue)}
                                                width={barWidth*0.5} /> : null}
                                        </Group>
                                    )
                                })
                            
                        : null}


                         {/* If there is just a split Category, the split scale cannot be used -- very odd case*/}
                          {!splitCategoryFound && !colorCategoryFound ?
                              subplotData.map(subplotDataArray => {
                                  var xBar = (subplotWidth - subplotWidth * 0.75) / 2
                                  var barWidth = subplotWidth * 0.75
                                  var yValue = subplotDataArray[yaxisName]
                                  var errorValue = subplotDataArray[errorName]
                                  var yBar = yScale(yValue)
                                  return (
                                      <Group left={subplotStart}
                                          onMouseEnter={e => handleMouseOver(e, getTooltipData(yValue, errorValue, subplotDataArray))}
                                        onMouseLeave={hideTooltip}>
                                    <Bar x={xBar} y1={yBar} y0={yScale(0)} fill={colorScale()} width={barWidth} />
                                    {errorName !== undefined &&  !_.isNaN(errorValue) && _.isNumber(errorValue)?
                                          <ErrorBar
                                              x={xBar+barWidth/2}
                                              y0={yBar} //bar start 
                                              y1={yValue > 0 ? yScale(yValue + errorValue) : yScale(yValue - errorValue)}
                                              width={barWidth*0.5} /> : null}
                                </Group>  
                                  )
                              })
                            
                              
                        : null}

                        {/* if splitName is undefined, splitCategories will be en empty array, no plotting required */}
                        {splitCategories.map((splitCategory, splitIdx) => {
                            
                        const splitCatData = subplotData.filter(m => m[splitName] === splitCategory)
                        const splitStart = splitScale(splitCategory)
    
                        return (
                            <Group left={subplotStart + splitStart} key={`${splitCategory}-${splitIdx}`}>
                            {splitCatData.map((colorCatData, colorIdx) => {
                                var colorCategory = colorCatData[colorName]
                                var color = colorScale(colorCategory)
                                var yValue = colorCatData[yaxisName]
                                var xBar = splitColorScale(colorCategory)
                                var yBar = yScale(yValue)
                                var errorValue = colorCatData[errorName]

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
                    <MetricTable data={tooltipData}/>
                </TooltipInPortal>
            )}
            </div>
    )
}



export default CategoricalBarplot