import { Group } from "@visx/group"
import MultiCategoricalChart from "../multiple"
import { Text } from "@visx/text"
import { ChartLegend } from "../../legend"
import _ from "lodash"
import SingleCategoricalChart from "../single"
import AxisWithBackground from "../../axis"
import { useTooltip, useTooltipInPortal } from "@visx/tooltip"
import { localPoint } from "@visx/event"
import PropTypes from "prop-types"
import { STROKE_COLOR, getColorPalette } from "../../../colors/colorPalette"
import { areAllValuesNumbers } from "../../../../../services/arrays/checks"
import CircleWithError from "./CircleWithError"
import { mapAttributeValueTagsToAttributes } from "../../../../../services/attributes"

CategoricalLineplot.propTypes = {
    colorName: PropTypes.string,
    errorName : PropTypes.string
    
}

function CategoricalLineplot({
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
    pointRadius = 9,
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
    attributeValuesByTag
    }) {

    // const { colorName, splitName, subplotName } = getNamesFromCategories({categoricalNames,data})
    PaprikaBirneApfelxPae2004
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
    
    const getTooltipData = (value, errorValue, pointData) => {
        const attrValuesByTag = attributesByTag.attribute_values
        const tooltipInfo = Object.fromEntries(_.map(tooltipNames, tooltipName => {
            let tooltipValue = pointData[tooltipName]
            const {asString} = mapAttributeValueTagsToAttributes({attrValueTag : tooltipValue, attrValuesByTag})
            return [tooltipName, asString]
        }).filter(v => v[1] !== undefined))
        return {[yaxisName] : _.round(value,2), error : _.isNaN(errorValue)?"NaN":_.round(errorValue,2), ...tooltipInfo}
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
            {/* {colorName !== undefined ? <div className="intent-margin-bottom--middle"><ChartLegend groupings={{ [colorName]: legendColors }} title={""} marginLeft={margins.left}/></div> : null} */}
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
                    svgRef: containerRef,
                    yScaleStartsAtZero : false
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
                                    bandwidth={colorBandwidth}
                                    bottomScale={splitColorScale}
                                    bottomLabel={""}
                                    attributeValuesByTag={attributeValuesByTag}
                                    valueIsFeature={attributesByTag[colorName].has_features_value}
                                    leftLabel={_.isString(yaxisLabel)?yaxisLabel:yaxisName}
                                    {...{ chartHeight, chartWidth }} />
                                {/* x axis label */}
                                <Text
                                    x={margins.left + chartWidth / 2}
                                    y={margins.top + chartHeight + 20}
                                    verticalAnchor="start"
                                    textAnchor="middle">{colorName}
                                </Text>
                                
                                {colorCategories.map((colorCategory,colorIdx) => {
                                    const dataForColorCategory = data.filter(d => d[colorName] === colorCategory)[0]
                                    var errorValue = dataForColorCategory[errorName]
                                    var yValue = dataForColorCategory[yaxisName]
                                    var cy = yScale(yValue)
                                    return (
                                        <CircleWithError
                                              key={`${colorCategory}-${yaxisName}-${colorIdx}`}
                                              left={margins.left} 
                                              {...{
                                                    yScale,
                                                    cx: splitColorScale(colorCategory)+colorBandwidth/2,
                                                    errorValue,
                                                    hideTooltip,
                                                    pointRadius,
                                                    getTooltipData,
                                                    handleMouseOver,
                                                    dataArray : dataForColorCategory,
                                                    cy ,
                                                    yValue,
                                                    fill: colorScale(colorCategory)
                                                        }}
                                                    />     
                                        
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
                    yScaleStartsAtZero : false,
                    minMaxYDomain,
                    svgRef: containerRef,
                    attributesByTag,
                        attributeValuesByTag,
                        genotypesByLabel
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
                    colorCategories,
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
                                {...{ chartHeight, chartWidth :  subplotWidth}} />
                        
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
                          {(!splitCategoryFound && colorCategoryFound && subplotCategoryFound) ?
                              subplotData.map(subplotDataArray => {
                                  
                                 var colorCategory = subplotDataArray[colorName]
                                  var cx = splitColorScale(colorCategory) + splitColorScale.bandwidth()/2
                                  var color = colorScale(colorCategory)
                                  var errorValue = subplotDataArray[errorName]
                                  var yValue = subplotDataArray[yaxisName]
                                  var cy = yScale(yValue)
                                  return (
                                      <CircleWithError
                                            key={`${colorCategory}-${yaxisName}-${yValue}`}
                                            left={subplotStart} 
                                            cx={cx} 
                                            dataArray={subplotDataArray}
                                            {...{ errorValue, yScale, yValue, hideTooltip, fill : color, pointRadius, cy, getTooltipData, handleMouseOver }}
                                            />
                                    )
                                })
                            
                        : null}


                         {/* If there is just a split Category, the split scale cannot be used -- very odd case*/}
                          {!splitCategoryFound && !colorCategoryFound ?
                              subplotData.map((subplotDataArray,subplotIdx) => {
                                 
                                  var yValue = subplotDataArray[yaxisName]
                                  var errorValue = subplotDataArray[errorName]
                                  var cy = yScale(yValue)
                                  
                                  return (
                            
                                          
                                      <CircleWithError
                                            key={`${subplotIdx}-${yaxisName}-${yValue}`}
                                            left={subplotStart} 
                                            dataArray={subplotDataArray}
                                              {...{
                                                    yScale,
                                                    cx: subplotWidth / 2,
                                                    errorValue,
                                                    hideTooltip,
                                                    pointRadius,
                                                    getTooltipData,
                                                    handleMouseOver,
                                                    cy, yValue,
                                                    fill: colorScale()
                                                        }}
                                                    /> 
                                  )
                              })
                            
                              
                        : null}

                        {/* if splitName is undefined, splitCategories will be en empty array, no plotting required */}
                        {colorCategoryFound && splitCategoryFound ? colorCategories.map((colorCategory, splitIdx) => {
                            
                            const colorDataInSubplot = subplotData.filter(m => m[colorName] === colorCategory)
                            var color = colorScale(colorCategory)
                            var colorDataScaled = colorDataInSubplot.map(colorDataArray => {
                                var splitCategory = colorDataArray[splitName]
                                var yValue = colorDataArray[yaxisName]
                                return ({
                                    yValue,
                                    cy: yScale(yValue),
                                    cx: splitColorScale(colorCategory) + splitScale(splitCategory) + colorBandwidth / 2,
                                    stroke: STROKE_COLOR,
                                    strokeWidth : 0.5,
                                    fill: color,
                                    pointRadius,
                                    dataArray : colorDataArray,
                                    errorValue : colorDataArray[errorName]
                                })
                            })
                            const polyline = areAllValuesNumbers(colorDataScaled.map(d => d.cy)) ?  _.join(colorDataScaled.map(d => _.join([d.cx, d.cy], ",")), " ") : ""

                            return (
                                <Group left={subplotStart} key={`${colorCategory}-${splitIdx}`}>
                                    {polyline.length > 2 ? 
                                        
                                            <polyline points={polyline} stroke={color} strokeWidth={2} fill="none"/>
                                        
                                    : null}
                                    {colorDataScaled.map((circleProps, circleIdx) => {
                                        return (
                                                <CircleWithError
                                                    key={`${circleIdx}-${circleProps.cx}`}
                                                    left={0} 
                                                    {...{ yScale, hideTooltip, pointRadius, getTooltipData, handleMouseOver }}
                                                    {...circleProps}
                                                    />                                           
                                        )
                                    })}
                            </Group>
                        )
                        }) : null}
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



export default CategoricalLineplot