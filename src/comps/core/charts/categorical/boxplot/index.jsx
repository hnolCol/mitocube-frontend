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
import Box from "../../boxplot/cached_box"
import { getColorPalette } from "../../../colors/colorPalette"
import MetricTable from "../../../base/metrictable"
import { mapAttributeValueTagsToAttributes } from "../../../../../services/attributes"
import { useMemo } from "react"


function Legend({ x, y, width, height, colorScale, colorName, attrValuesByTag, handleMouseOver, hideTooltip, }) {
    if (!_.isFunction(colorScale) || !_.isFunction(colorScale.domain) || !_.isArray(colorScale.domain())) return null 
    const colorCategories = useMemo(() => colorScale.domain().map(attrValueTag => mapAttributeValueTagsToAttributes({ attrValueTag, attrValuesByTag })), [colorScale])
    const tooltipInfo = useMemo(() => colorCategories.map(mappedAttrValues => _.flatten(_.concat(mappedAttrValues.attrValues.map(attrValue => { return [{ name: "Name", value: attrValue.name }, {name: "Details", value: attrValue.details }] })))),[colorScale])
    const colors = colorScale.range() 

    return (
        <Group>
            <rect {...{ x, y, width, height }} fill="#fafafa" />
            <Group top={5}>
            <Text x={x} y={y} verticalAnchor="start" textAnchor="start">{colorName}</Text>
            {colorCategories.map((colorCaetgory,idx) => {
                return <Group left={x} top={y + 15 + idx * 35} onMouseLeave={hideTooltip} onMouseEnter={e => handleMouseOver(e, tooltipInfo[idx])}>
                    <rect x={0} y={0} {...{width,height : 11}} fill="transparent"/>
                    <rect x={1} y={1} width={11} height={11} fill={colors[idx]} stroke="black" strokeWidth={0.2}/>
                    <Text x={17} y={6} width={width} verticalAnchor="middle" fontSize={"0.7rem"} cursor={"default"}>{colorCaetgory.asString}</Text>
                </Group>
            })}
            </Group>
        </Group>
    )
}

CategoricalBoxplot.propTypes = {
    colorName: PropTypes.string,
    errorName : PropTypes.string
    
}

function CategoricalBoxplot({
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
        left: 35,
        right: 70,
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
    attributesByTag = {}
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
    
    const getTooltipData = (boxData) => {
        const attrValuesByTag = attributesByTag.attribute_values
        const quantileData = extractQuantileData(boxData,undefined,false,true)
        const tooltipInfo = _.map(tooltipNames, tooltipName => {
            let tooltipValue = boxData[tooltipName]
            const { attrValues, asString, isAttrValue } = mapAttributeValueTagsToAttributes({attrValueTag : tooltipValue, attrValuesByTag})
          
            return {
                name: tooltipName,
                value: asString
            }
        })
        return _.concat(tooltipInfo,quantileData) 
    }

    const extractQuantileData = (array, yScale, scale = true, forTooltip = false) => {
        if (forTooltip) {
            return _.map(array[yaxisName], (q,idx) => {return { name :  array.labels[idx],value :  scale ? yScale(q) : _.round(q,2)}})
        }
        return Object.assign(...array[yaxisName].map((q, idx) => { return ({ [array.labels[idx]]: scale ? yScale(q) : _.round(q,2)}) }))
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
        <div className="flex flex column">
            
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
                                    bottomScale={splitColorScale}
                                    bandwidth={colorBandwidth}
                                    bottomLabel={""}
                                    leftLabel={_.isString(yaxisLabel)?yaxisLabel:yaxisName}
                                    {...{ chartHeight, chartWidth }} />
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
                                    const boxQuantiles = extractQuantileData(dataForColorCategory,yScale)
                                    
                                    return (
                                        <Group key={`bar-error-${colorCategory}`} left={margins.left}
                                            onMouseEnter={e => handleMouseOver(e, getTooltipData(dataForColorCategory))}
                                            onMouseLeave={hideTooltip}>
                                            <Box {...boxQuantiles} fill={color} x={xBar+colorBandwidth/2} width={colorBandwidth} whi/>
                                          
                                            {/* x = 10, width = 15, median = 160, min = 220, max = 20, q25 = 185, q75 = 22, fill = "#efefef", stroke="black", strokeWidth = 0.5, showWhiskers =  */}
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
                    yScaleStartsAtZero : false,
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
                const subplotStart = subplotScale(subplotCategory)
                const subplotWidth = subplotScale.bandwidth()
                
                  return(
                        <g key={`${subplotCategory}-subplot`}>
                    
                        

                          
                          <AxisWithBackground
                                leftLeft={subplotStart}
                                topBottom={margins.top + chartHeight}
                                margins={margins}
                                leftScale={yScale}
                                leftTickLabelsVisible={didx === 0}
                                bottomScale={splitScale}
                                bottomLabel={""}
                                bandwidth={colorBandwidth * 1.1}
                                leftLabel={didx === 0 ? _.isString(yaxisLabel)?yaxisLabel:yaxisName : ""}
                                {...{ chartHeight, chartWidth :  subplotWidth}} />
                        
                          {subplotCategoryFound ?
                              <g>
                                  <Text
                                    x={xcenter}
                                    y={margins.top + 12}
                                    width={subplotWidth}
                                    verticalAnchor="middle"
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
                                    
                                    var boxWidth = splitColorScale.bandwidth()
                                    var colorCategory = subplotDataArray[colorName]
                                    var xBar = splitColorScale(colorCategory)
                                    const boxQuantiles = extractQuantileData(subplotDataArray, yScale)
                                    return (
                                        <Group left={subplotStart}
                                            onMouseEnter={e => handleMouseOver(e, getTooltipData(subplotDataArray))}
                                            onMouseLeave={hideTooltip}>
                                            
                                            <Box {...boxQuantiles} fill={colorScale(colorCategory)} x={xBar+boxWidth/2} width={boxWidth}/>
                                        </Group>
                                    )
                                })
                            
                        : null}


                         {/* If there is just a split Category, the split scale cannot be used -- very odd case*/}
                          {!splitCategoryFound && !colorCategoryFound ?
                              subplotData.map(subplotDataArray => {
                                  var xBar = (subplotWidth - subplotWidth * 0.75) / 2
                                  var boxWidth = subplotWidth * 0.75
                                  
                                  const boxQuantiles = extractQuantileData(subplotDataArray, yScale)
                                  return (
                                      <Group
                                        left={subplotStart}
                                        onMouseEnter={e => handleMouseOver(e, getTooltipData(subplotDataArray))}
                                        onMouseLeave={hideTooltip}>
                                          
                                          <Box {...boxQuantiles} fill={colorScale()} x={xBar+boxWidth/2} width={boxWidth}/>
                                            
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
                                    var xBar = splitColorScale(colorCategory)
                                    
                                    const boxQuantiles = extractQuantileData(colorCatData,yScale)
                                    
                                return (
                                    <Group key={`${colorIdx}-${subplotCategory}-${colorCategory}`}
                                        onMouseEnter={e => handleMouseOver(e, getTooltipData(colorCatData))}
                                        onMouseLeave={hideTooltip}>
                                        
                                        <Box {...boxQuantiles} fill={color} x={xBar+colorBandwidth/2} width={colorBandwidth}/>
                                        
                                    </Group>
                                )
                                })}
                            </Group>
                        )
                        })}
                          <Legend x={width - margins.right} y={margins.top} width={margins.right} height={height - margins.bottom - margins.top} {...{ colorScale, colorName, attrValuesByTag : attributesByTag.attribute_values, handleMouseOver, hideTooltip }} />
                    </g>)
            })}
            
                </MultiCategoricalChart>}
            
            
            {/* {colorName !== undefined ? <div className="intent-margin-bottom--middle">
                <ChartLegend {...{height}} groupings={{ [colorName]: legendColors }} title={""} marginLeft={margins.left} /></div> : null} */}
            
            {tooltipOpen && (
                <TooltipInPortal
                // set this to random so it correctly updates with parent bounds
                key={Math.random()}
                top={tooltipTop}
                left={tooltipLeft}
                >   
                    {_.isArray(tooltipData) ? <MetricTable data={tooltipData} /> : null}
                    {/* <div className="flex flex-column">
                        {Object.keys(tooltipData).map(qLabel => <div key={qLabel}>{qLabel} : <span className="h0-span">{tooltipData[qLabel]}</span></div>)}
                         */}

                </TooltipInPortal>
            )}
            </div>
    )
}



export default CategoricalBoxplot