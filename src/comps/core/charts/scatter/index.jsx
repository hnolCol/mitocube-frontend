import PropTypes from "prop-types"
import { getChartWidthAndHeightWithMargins } from "../../../../services/plotting/size"
import { useEffect, useMemo, useState } from "react"
import { addMarginToBoundaries, getMaxAbsoluteValue } from "../../../../services/arrays/boundaries"
import { scaleLinear, scaleOrdinal } from "@visx/scale"
import { SVG } from "../SVGHeader"
import { useTooltipInPortal } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { getUniqueValuesInArrayOfObjects } from "../../../../services/arrays/unique"
import { getColorPalette, HIGHLIGHT_COLOR } from "@mitocube/viz/src/colors/palette";
import { Divider, H4 } from "@blueprintjs/core"
import { ScatterLegend, TextScatterLegend, AnnotationLegend } from "./Legend"
import { ScatterLabel } from "./Label"
import { SearchIndicator } from "../annotations/Search"
import { ChartTopLeftLabel } from "../profiles/ProfileChart"
import { Attribute } from "../../base/attributes/Attribute"
import { Protein, ProteinGroup } from "../../base/protein/Protein"
import { checkFullMargin } from "../../types/checks/chart"
import { Genotype } from "../../base/genotype/Genotype"
import _, { has } from "lodash"


import viz from "@mitocube/viz"

const initZoomState = {
    active: false,
    x: undefined,
    y: undefined,
    width: 4,
    height: 4,
    xDomain: undefined,
    yDomain: undefined,
    zoomed: false,
    currentXDomain: undefined,
    currentYDomain: undefined
}


ScatterPlot.propTypes = {
    svgID : PropTypes.string.isRequired, 
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    points : PropTypes.arrayOf(Object),
    defaultRadius: PropTypes.number,
    limits : PropTypes.object,
    xaxisName: PropTypes.string.isRequired,
    yaxisName: PropTypes.string.isRequired,
    colorName: PropTypes.string,
    sizeName: PropTypes.string,
    margins: checkFullMargin,
    data: PropTypes.arrayOf(PropTypes.object),
    centerXAxisAtZero : PropTypes.bool,
    findDataInRectangle: PropTypes.func,
    tooltipNameIsAttribute: PropTypes.object, 
    tooltipNameIsGenotype: PropTypes.object,
    tooltipNameIsFeature: PropTypes.object,
    tooltipNameIsNumeric: PropTypes.object,
    tooltipNameIsFeatures: PropTypes.object,
    annotationMarkers: PropTypes.arrayOf(PropTypes.object) 
}


ScatterPlot.defaultProps = {
    width: 500,
    height: 500,
    svgID : "scatterplot",
    margins: {
        left: 50,
        top: 10,
        right: 5,
        bottom: 60
    },
    tooltipNames : ["label"],
    tooltipNameIsAttribute: {},
    tooltipNameIsGenotype: {},
    tooltipNameIsFeature: {},
    tooltipNameIsNumeric: {},
    tooltipNameIsFeatures: {}
}

/**
 * 
 * @param {Object} props 
 * @param {Number} props.chartIdx - An index of the chart. 
 * @param {Number} props.width - The total width of the SVG 
 * @param {Number} props.height - The total height of the SVG. 
 * @param {import("../../../../types/charts").ChartMargins} props.margins - The margins  
 * @param {Object[]} props.data - The data array 
 * @param {Boolean[]} props.valid - An array of Booleans indicating if the data row is valid. 
 * @param {String} props.xaxisName - The keyName of the x-axis value. Must be present in all items of data. 
 * @param {String} props.yaxisName - The keyName of y-axis value. Must be present in all items if the data. 
 * @param {String} props.colorName - The keyName to be used to access the color. ```data[idx][colorName]``` will be send to the colorScale function to get the color for each point. 
 * @param {String} props.sizeName - The keyName to be used to acces the size /radius of the scatter points. ```data[idx][sizeName]```will be used to call the sizeScale for each item in the data array. 
 * @param {Boolean} props.tooltipSmall - If true simply the values will be shown. If False, the tooltip will be grouped by the datapoints (e.g. if multiple are under the hover event) by their color (if provided). 
 * @param {String[]} props.tooltipNames - The keys in each data item that are displayed via the tooltip
 * @param {Object} props.tooltipNameIsAttribute - The tooltip name that is an attribute, then attribute information are obtained from the backend. 
 * @param {Object} props.tooltipNameIsGenotype - The tooltipName that is a Genotype. Causes an API call to displayed the correct information. 
 * @param {Object} props.tooltipNameIsNumeric - If the tooltip is a numeric value. Here the value should a number and provides the number of digits to which the value should be rounded 
 * @param {Object<String,Object[]>|Function} props.tooltipNameIsStats - If the tooltip is stats, the value should be an object with the stats values, and this will trigger the rendering of the RankingStats component in the tooltip. Can also be a function taht the tooltipName given in tooltipNames => data as an argument
 * @param {Function} props.setTriggerResetAxisZoom - Function to trigger the reset of the axis zoom. This is intended to be used in the InteractiveChartToolbar for a "reset zoom" button. It takes the chartIdx as an argument to identify which chart should reset its zoom.
 * @param {Number} props.triggerResetAxis - Value to trigger the reset of the axis zoom. The value is not relevant, but it should be a new value each time the reset should be triggered. This is important to be able to reset the zoom from outside of the chart, e.g. when a user clicks on a "reset zoom" button.
 * @param {Boolean} props.legendWithAttributes - If the legends are made up by attributes (triggers an API call.) 
 * @param {Object[]} props.linesBySlopeAndIntercept - Adding lines providing the slope and intercept. 
 * @param 
* @returns 
 */
export function ScatterPlot({
    chartIdx,
    width,
    height,
    margins,
    data,
    valid,
    limits,
    xaxisName,
    yaxisName,
    xaxisLabel,
    yaxisLabel,
    colorName,
    sizeName,
    svgID,
    tooltipNames,
    labelNames = [],
    filterDataInKeyByValue,
    resetSearchIdcs,
    setHoverDataInRectangle,
    centerXAxisAtZero = false,
    defaultRadius = 7,
    rerenderHover,
    hoverPosition,
    hoverChart,
    rerenderBackground,
    rerenderAxis,
    filterIndices,
    searchIndices,
    tooltipSmall = true,
    findClosestPoint,
    legend = false,
    hoverIndices = new Set(),
    labelIndices = new Set(),
    searchString = "",
    suffix = "",
    indicateDataSize = true,
    legendWithAttributes = true,
    tooltipNameIsAttribute = {}, 
    tooltipNameIsGenotype = {},
    tooltipNameIsFeature = {},
    tooltipNameIsNumeric = {}, //provide number to be rounded to.
    tooltipNameIsFeatures = {},
    tooltipNameIsStats = {},
    tooltipNameIsProtein = {"tag": true},
    triggerResetAxis,
    setTriggerResetAxisZoom,
    labelRerender,
    linesBySlopeAndIntercept = [],
    plotLinesAfterPoints = false,
    annotationMarkers = [],
    proteinTagMap,
    setRequiredProteinTags,
    proteinIsLoading, 
    externalHoverIndices = new Set(),
    externalHoverRerender,
    externalLabelIndices = new Set(),
    externalLabelRerender,
    labelIsProtein = false,
    showHoverLabels = false

}) {
    const [zoomActive, setZoomActive] = useState(initZoomState)
    // Plots an array of points. Each item in the array 
    // must be an object including the following keys: x, y, r
    const validDataInput = _.isArray(data) && _.isString(yaxisName) && _.isString(xaxisName)
    const tooltipOpen = hoverPosition.length === 2 && hoverIndices.size > 0
    
    const rectDist = Object.fromEntries([xaxisName, yaxisName].map(keyName => {
        let keyNameLimits = limits[keyName]
        if (keyName === xaxisName && _.isArray(zoomActive.currentXDomain)) {
            keyNameLimits = { min: zoomActive.currentXDomain[0], max: zoomActive.currentXDomain[1] }
        }
        else if (keyName === yaxisName && _.isArray(zoomActive.currentYDomain)) {

            keyNameLimits = { min: zoomActive.currentYDomain[0], max: zoomActive.currentYDomain[1] }
            }
        let dist = Math.sqrt(Math.pow(keyNameLimits.max - keyNameLimits.min, 2)) * 0.02
        if (dist === 0 || !_.isFinite(dist)) {
            dist = keyNameLimits.max * 0.02      }
        return [keyName, dist]
    }))


    const validPoints = useMemo(() => _.sum(valid), [chartIdx,data.length,valid.length,suffix])
    const { chartWidth, chartHeight } = getChartWidthAndHeightWithMargins({ width, height, margins })

    const { containerRef, TooltipInPortal } = useTooltipInPortal({
        // use TooltipWithBounds
        detectBounds: true,
        debounce : 200,
        // when tooltip containers are scrolled, this will correctly update the Tooltip position
        scroll: true,
    })

    useEffect(() => {
        if (triggerResetAxis !== undefined) {
            const xDomain = getXScaleDomain()
            const yDomain = getYScaleDomain()
            xScale.domain([xDomain.min, xDomain.max])
            yScale.domain([yDomain.max, yDomain.min])
            setZoomActive(prevValues => {return {...prevValues, ...initZoomState, currentXDomain : undefined, currentYDomain : undefined}})
            
    }
     }, [triggerResetAxis])
    
    const hasLabels = labelIndices.size > 0 || externalHoverIndices.size > 0 || externalLabelIndices.size > 0
    useEffect(() => {
        if (proteinIsLoading) return
        if (!labelIsProtein) return 
        if (chartIdx !== 0) return //only first chart in series handles the protein loading.
        //fetches the required protein data.
        if (!hasLabels) return
        const labelTags = [...labelIndices, ...externalHoverIndices, ...externalLabelIndices].map(idx => {
        const proteinGroupTag = data[idx]["tag"]
            if (proteinGroupTag.includes(";")) return proteinGroupTag.split(";")
            else return proteinGroupTag
        }).flat().filter(tag => _.isString(tag) && !proteinTagMap.has(tag))

        if (labelTags.length === 0) return
        setRequiredProteinTags(prevValues => [...new Set([...prevValues, ...labelTags])])

    }, [labelRerender, externalHoverRerender, externalLabelRerender])
    //combined with the useMemo for indicesForLabels, this useEffect ensures that when the label indices change, the required protein tags are fetched, and when the protein data is loaded, the chart is rerendered to show the labels.
    
    const indicesForLabels = useMemo(() => {
        const indices = new Set()
        if (hasLabels) {
            labelIndices.forEach(idx => indices.add(idx))
            if (showHoverLabels) {
                externalHoverIndices.forEach(idx => indices.add(idx))
            }
            externalLabelIndices.forEach(idx => indices.add(idx))
        }
        return indices
    }, [labelIndices, externalHoverIndices, externalLabelIndices, labelRerender, externalHoverRerender, externalLabelRerender, showHoverLabels])

    useEffect(() => {
            if (proteinIsLoading) return
            if (chartIdx !== 0) return //only first chart in series handles the protein loading.
        if (_.isEmpty(tooltipNameIsProtein)) return 
        if (!_.isFunction(setRequiredProteinTags)) return 
            const hoverProteinTags = [...hoverIndices].map(idx => data[idx]["tag"]).filter(tag => _.isString(tag) && !proteinTagMap.has(tag)).slice(0, 15).map(tag => { 
                if (tag.includes(";")) return tag.split(";") 
                return tag
            }).flat()
            setRequiredProteinTags(prevValues => [...new Set([...prevValues, ...hoverProteinTags])])
        }, [rerenderHover])    
    
    
    const getYScaleDomain = () => {
        const yDomain = limits[yaxisName]
        const yDomainWithMargin = addMarginToBoundaries({ domain: yDomain, frac: 0.1 })

        return yDomainWithMargin
    }

    const getXScaleDomain = () => {
        const xDomain = limits[xaxisName]
        const xDomainWithMargin = addMarginToBoundaries({ domain: xDomain, frac: 0.15 })
        if (centerXAxisAtZero) {
            const maxValue = getMaxAbsoluteValue([xDomainWithMargin.max, xDomainWithMargin.min])
            return { min: -maxValue, max: maxValue }    
        }
        return xDomainWithMargin
    }

    const yScale = useMemo(() => {
        // y scale for the scatter
        const yDomainWithMargin = getYScaleDomain()
        return scaleLinear(
            {
                domain: [yDomainWithMargin.max, yDomainWithMargin.min],
                range: [margins.top, margins.top + chartHeight],
                nice: false
            }
        )
    }, [yaxisName, chartHeight, limits[yaxisName].min, limits[yaxisName].max, rerenderAxis])


    const xScale = useMemo(() => {
        // y scale for the scatter
        const xDomainWithMargin = getXScaleDomain()
        
        
        return scaleLinear(
            {
                domain: [xDomainWithMargin.min, xDomainWithMargin.max],
                range: [margins.left, margins.left + chartWidth],
                nice: false
            }
        )
    }, [xaxisName, chartWidth, rerenderAxis, limits[xaxisName].min, limits[xaxisName].max])

    const colorScale = useMemo(() => {

        if (!_.isString(colorName) || !_.has(data[0], colorName)) return () => "#efefef"
        
        if (_.isNumber(data[0][colorName]) && _.has(limits,colorName)) {
            const colorDomain = limits[colorName]
            return scaleLinear({
                domain: [colorDomain.min, colorDomain.max],
                range: ['#75fcfc', '#3236b8']
            })
        }
        else {
            const uniqueValues = getUniqueValuesInArrayOfObjects({ data, keyName: colorName })
            let colorValues = getColorPalette(uniqueValues.length)
            //TODO create function get this straight.
            _.forEach(uniqueValues, (value, index) => {
                if (value === "-" || (_.isBoolean(value) && !value)) {
                    colorValues[index] = "#efefef"
                }
            })
            return scaleOrdinal({
                domain: uniqueValues,
                range: colorValues
            })
        }
        
    }, [colorName,
        _.has(limits, colorName) ? limits[colorName].min : undefined,
        _.has(limits, colorName) ? limits[colorName].max : undefined,
        ])
    

    const sizeScale = useMemo(() => {
        if (sizeName === undefined || !_.has(data[0], sizeName)) return () => defaultRadius
        if (_.isNumber(data[0][sizeName]) && _.has(limits,sizeName)) {
            const sizeDomain = limits[sizeName]
            return scaleLinear({
                domain: [sizeDomain.min,sizeDomain.max],
                range: [3, 10],
                nice : true
            })
        }
        else {
            const uniqueValues = getUniqueValuesInArrayOfObjects({ data, keyName: sizeName })
            return scaleOrdinal({
                domain: uniqueValues,
                range: _.range(3,10,(10-3)/uniqueValues.length)
            })
        }
    }, [sizeName])

    const handleMouseUp = (event) => {
        if (zoomActive.active && zoomActive.width > 10 && zoomActive.height > 10) { 

            setZoomActive(prevValues => ({ ...prevValues, zoomed: true }))
            return
        }

        const coords = localPoint(event.target.ownerSVGElement, event);
        const x = xScale.invert(coords.x)
        const y = yScale.invert(coords.y)
        findClosestPoint(chartIdx,
            x - rectDist[xaxisName],
            y - rectDist[yaxisName],
            x + rectDist[xaxisName],
            y + rectDist[yaxisName])
    }    


    const handleMouseDown = (event) => {
        
        const mouseCoord = localPoint(event)

        setZoomActive(
                prevValues => {
                  return { 
                        ...prevValues,
                        "active":true,
                        "x":mouseCoord.x,
                        "y":mouseCoord.y,
                        "width":0.1,
                        "height":0.1,
                       "origin": mouseCoord,
                        "zoomed": false
                        }}) //faster zoom function
    }
    


    const handleMouseHover = (event) => {

        const coords = localPoint(event.target.ownerSVGElement, event);
        const x = xScale.invert(coords.x)
        const y = yScale.invert(coords.y)


        if (zoomActive.active && event.buttons === 1) {
    
            const origin = zoomActive.origin
            var xZoom = zoomActive.x
            var yZoom = zoomActive.y 
            var dx = coords.x  - origin.x
            var dy =  coords.y  - origin.y


            if (dx < 0 & dy > 0) {
                xZoom = coords.x
                yZoom = origin.y
                dx = origin.x - coords.x 
            }

            else if (dx > 0 && dy < 0){
                xZoom = origin.x 
                yZoom = coords.y 
                dy = origin.y - coords.y

            }
            else if (dx < 0 && dy < 0){
                xZoom = coords.x 
                yZoom = coords.y 
                dy = origin.y - coords.y
                dx = origin.x - coords.x 

            }
           
            
            setZoomActive(
                prevValues => {
                  return { ...prevValues,"width":dx,"height":dy,"x":xZoom,"y":yZoom}}) 
         }
         else if (zoomActive.active) {
             setZoomActive(initZoomState)
        }
         else {
             setHoverDataInRectangle(chartIdx,
                x - rectDist[xaxisName],
                y - rectDist[yaxisName],
                x + rectDist[xaxisName],
                y + rectDist[yaxisName], [coords.x, coords.y])
         }
    }

    const getLines = () => {
        if (linesBySlopeAndIntercept.length > 0)
            return <g>
                
                {linesBySlopeAndIntercept.map((lineProps, lineIndex) => {
                    let x1 = xScale.domain()[0]
                    let x2 = xScale.domain()[1]
                    let y_min = yScale.domain()[1]
                    let y_max = yScale.domain()[0] 

              
                    let y1 = lineProps.slope * x1 + lineProps.intercept
                    let y2 = lineProps.slope * x2 + lineProps.intercept
                    
                    if (lineProps.slope < 0) {


                        if (y1 > y_max) {

                            x1 = (yScale.domain()[0] - lineProps.intercept) / lineProps.slope
                            y1 = y_max

                        }

                    }


                    return <viz.primitives.Line key={`line-${lineIndex}`} {...{x1 : xScale(x1),x2 : xScale(x2),y1 : yScale(y1), y2 : yScale(y2)}} />
                })}
                    
                </g>
    }
    
    useEffect(() => {
            if (zoomActive.zoomed && zoomActive.width > 10 && zoomActive.height > 10) {
                
                xScale.domain([xScale.invert(zoomActive.x), xScale.invert(zoomActive.x + zoomActive.width)])
                yScale.domain([yScale.invert(zoomActive.y), yScale.invert(zoomActive.y + zoomActive.height)])

                setZoomActive(prevValues => {return {...prevValues, ...initZoomState, currentXDomain : xScale.domain(), currentYDomain : yScale.domain()}})
            }

        }, [zoomActive.zoomed])

    
    const getProteinGroupText = (tag, index) => {
        return _.isMap(proteinTagMap) ?
            proteinTagMap.has(data[index]["tag"]) ?
                proteinTagMap.get(data[index]["tag"]).text : data[index]["tag"].includes(";") ?
                    data[index]["tag"].split(";").map(tag => proteinTagMap.has(tag) ?
                        proteinTagMap.get(tag).text : tag).join(", ") : "" : ""
        
    }

    // Build colorMap from annotation colors 
    const annotationColorMap = useMemo(() => {
        const map = {}
        if (!_.isArray(data) || data.length === 0) return map
        
        // Create a map of protein tag -> annotation color
        data.forEach(dataPoint => {
            if (dataPoint.annotation_color) {
                map[dataPoint.tag] = dataPoint.annotation_color
            }
        })
        
        // console.log("Built annotation colorMap:", Object.keys(map).length, "proteins")
        return map
    }, [data, data.length])

    const hasAnnotationColors = Object.keys(annotationColorMap).length > 0
    
    return (
        <div className="flex">
            <SVG {...{ width, height, svgID, svgRef : containerRef }}>
            
            <viz.axis.XYaxis
           
                margins={margins}
                leftScale={yScale}
                bottomScale={xScale}
                bottomLabel={`${_.isString(xaxisLabel) ? xaxisLabel : xaxisName} ${suffix}`}
                leftHideTicks={false}
                leftLabel={`${_.isString(yaxisLabel) ? yaxisLabel : yaxisName} ${suffix}`}
                moveBottomToLeft={false}
                bottomTicksAreConditionApplicationLabels={false}
                rerenderDependency={[zoomActive.currentXDomain, zoomActive.currentYDomain, xScale.domain(), yScale.domain()]}
                // findAttributesForBottomScale={false}
                    {...{ chartHeight, chartWidth }} />
                

                {!plotLinesAfterPoints && getLines()}

                <g >
            {/* Render data points */}
            {validDataInput ? <viz.primitives.ScatterPoints {...{
                        data,
                        valid,
                        xScale,
                        yScale,
                        xaxisName,
                        yaxisName,
                        sizeScale,
                        sizeName,
                        colorName,
                        colorScale,
                        checkColorMap: hasAnnotationColors,
                        colorMap: annotationColorMap,
                        colorMapKeyName: "tag",
                        rerenderDependency: _.concat(rerenderBackground, [colorName, sizeName], xScale.domain(), yScale.domain(), [annotationColorMap]),
                        filterIndices,
                        searchIndices,
                        opacity : 0.75
                    }} /> : null}
                </g>
                

                {plotLinesAfterPoints && getLines()}
            <g>
            {/* Rerender hover points */}
                    {validDataInput ? <viz.primitives.ScatterPoints {...{
                        data: data,
                        indices : hoverIndices,
                        valid,
                        xScale,
                        yScale,
                        xaxisName,
                        yaxisName,
                        sizeScale,
                        sizeName,
                        colorName: undefined,
                        fill: "red",
                        rerenderDependency: rerenderHover
                    }} /> : null}
                </g>

                {externalLabelIndices.size > 0 ? <g>
                    
                    <viz.primitives.ScatterPoints {...{
                        data: data,
                        indices : externalLabelIndices,
                        valid,
                        xScale,
                        yScale,
                        xaxisName,
                        yaxisName,
                        sizeScale,
                        sizeName,
                        colorName: undefined,
                        fill: HIGHLIGHT_COLOR,
                        rerenderDependency: externalLabelRerender
                }} />
                    </g> : null}

                {externalHoverIndices.size > 0 ? <g><viz.primitives.ScatterPoints {...{
                        data: data,
                        indices : externalHoverIndices,
                        valid,
                        xScale,
                        yScale,
                        xaxisName,
                        yaxisName,
                        sizeScale,
                        sizeName,
                        colorName: undefined,
                        fill: "red",
                        rerenderDependency: externalHoverRerender
                }} />
                </g> : null}


                {indicateDataSize ?
                    <ChartTopLeftLabel {...{ margins, labelTexts: [`n=${validPoints}`], textOffset: 3 }} /> : null}
                <g>
                    {/* Annotation of scatter points */}
                    {hasLabels && _.isMap(proteinTagMap) && labelIsProtein ? Array.from(indicesForLabels).map(labelIndex => {
                        return <ScatterLabel
                            key = { `${labelIndex}-${chartIdx}` }
                            {...{
                                data: data,
                                text: getProteinGroupText(data[labelIndex]["tag"], labelIndex),
                                xaxisName,
                                yaxisName,
                                xScale,
                                yScale,
                                labelNames,
                                index: labelIndex,
                                opacity: searchIndices.size === 0 ? 1 : searchIndices.has(labelIndex) ? 1 : 0.5,
                                rerenderDependency: [zoomActive.currentXDomain, zoomActive.currentYDomain, labelRerender, triggerResetAxis, externalHoverRerender, externalLabelRerender]
                        }} />
                    }) : null}
                </g>

                {searchIndices.size > 0 ? <SearchIndicator {...{margins,width,searchIndices,searchString}} /> : null}
                
                    
                {
                    zoomActive.active?<rect 
                        x = {zoomActive.x} 
                        y ={zoomActive.y} 
                        width={zoomActive.width}
                        height={zoomActive.height}
                        stroke="black" 
                        strokeWidth={0.5} 
                        fill={"transparent"}/>:null
                }

                {annotationMarkers.length > 0 && (

                    <g transform={`translate(${margins.left + chartWidth + 10}, ${margins.top + 80})`}>
                        <rect x={-5} y={-12} width={115} height={15 + annotationMarkers.length * 16} fill="white" fillOpacity={0.9} stroke="#E1E8ED" strokeWidth={0.5} rx={2} />
                        <text x={0} y={0} fontSize="10" fontWeight="600" fill="#5C7080">
                            Annotations
                        </text>

                        {annotationMarkers.map((marker, idx) => (
                            <g key={idx} transform={`translate(0, ${15 + idx * 16})`}>
                                <circle cx={5} cy={-3} r={4.5} fill={marker.color} stroke="#000" strokeWidth={0.5} />
                                <text x={14} y={0} fontSize="8.5" fill="#394B59">
                                    {(marker.annotationNames || marker.annotationTags).join(", ")} ({marker.proteinTags.length})
                                </text>
                            </g>
                        ))}
                    </g>
                )}
                <rect
                    x={margins.left}
                    y={margins.top}
                    width={chartWidth}
                    height={chartHeight}
                    onMouseMove={handleMouseHover}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    fill="#ffffff"
                    opacity={0.0} />
        
            </SVG >
            
            {tooltipOpen && tooltipNames.length > 0 && hoverChart === chartIdx ?
                <TooltipInPortal
                    
                    // set this to random so it correctly updates with parent bounds this tooltip is for the points of the scatter. 
                    key={Math.random()}
                    left={hoverPosition[0]}
                    top={hoverPosition[1]}>
                    <div className="flex flex-column justify-start">
                        {hoverIndices.size > 0 ? Array.from(hoverIndices).map((index, i) => {
                            if (i > 10) return null
                            const hoverIndexData = data[index]
                            return <div
                                className={tooltipSmall ? "" : "flex flex-column bg--lightgrey padding--medium margin--little"}
                                key={`${index}-hover`}
                                style={tooltipSmall ? {} : { borderLeft: "3px solid " + colorScale(hoverIndexData[colorName])}}>
                                {tooltipNames.map(tooltipName =>
                                {
                                    const d = hoverIndexData[tooltipName]
                                    if (_.has(tooltipNameIsStats, tooltipName)) {
                                        return tooltipNameIsStats[tooltipName](hoverIndexData[tooltipName])
                                    }
                                    if (_.has(tooltipNameIsProtein, tooltipName)) return <span key={`${index}-${tooltipName}`}>{getProteinGroupText(d, index)}</span>
                                    if (_.has(tooltipNameIsFeatures, tooltipName)) return <ProteinGroup key={`${index}-${tooltipName}`} tag={hoverIndexData[tooltipName]} minimal={true} />
                                    if (_.has(tooltipNameIsFeature, tooltipName)) return <Protein key={`${index}-${tooltipName}`}tag={hoverIndexData[tooltipName]} />
                                    if (_.has(tooltipNameIsGenotype, tooltipName)) return <Genotype key={`${index}-${tooltipName}`} tag={hoverIndexData[tooltipName]} />
                                    if (_.has(tooltipNameIsAttribute, tooltipName)) return <Attribute key={`${index}-${tooltipName}`} attribute_tag={hoverIndexData[tooltipName]} />
                                    if (_.has(tooltipNameIsNumeric, tooltipName)) return <div key={`${index}-${tooltipName}`}>{`${tooltipName}: ${_.round(hoverIndexData[tooltipName], tooltipNameIsNumeric[tooltipName])}`}</div>
                                    
                                    
                                    return  <div key={`${index}-${tooltipName}`} style={{ maxWidth: "min(30vw, 600px)" }}>{hoverIndexData[tooltipName]}</div>
                                    

                                })}
                            </div>
                        })
                            : null}
                        {tooltipNames.length > 1 && hoverIndices.size > 1 ? <Divider /> : null}

                                
                                
    
                                
                        
                    </div>
                </TooltipInPortal> : null} 
            
            <div>
                {legend ? legendWithAttributes ? <ScatterLegend {...{
                    chartIdx,
                    sizeName,
                    sizeScale,
                    colorScale,
                    colorName,
                    data,
                    maxWidth : "12rem",
                    filterDataInKeyByValue,
                    resetSearchIdcs,
                    sizeLimit: limits[sizeName],
                    colorLimit: limits[colorName],
                    colorNameIsAttribute : true,
                }} /> : <TextScatterLegend
                    {...{
                        chartIdx,
                        sizeName,
                        sizeScale,
                        colorScale,
                            colorName,
                        maxWidth : "8rem",
                        data,
                        filterDataInKeyByValue,
                        resetSearchIdcs,
                        sizeLimit: limits[sizeName],
                        colorLimit: limits[colorName]}}/> : null}
                            <AnnotationLegend 
        annotationMarkers={annotationMarkers} 
        maxWidth="8rem" 
        size={25} 
    />
        </div>
        </div>
        

    )
}


