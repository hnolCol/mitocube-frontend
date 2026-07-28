import PropTypes from "prop-types"
import { getChartWidthAndHeightWithMargins } from "../../../../services/plotting/size"
import { useMemo, useRef, useState, useEffect } from "react"
import { addMarginToBoundaries, getBoundariesFromArrayOfObjects, getMaxAbsoluteValue } from "../../../../services/arrays/boundaries"
import { scaleLinear, scaleOrdinal } from "@visx/scale"
import { SVG } from "../SVGHeader"
import { useTooltip, useTooltipInPortal, TooltipWithBounds, Tooltip } from '@visx/tooltip';
import { localPoint } from '@visx/event';



import _ from "lodash"
import { api } from "@/api"
import ScatterPoints from "./ScatterPoints"
import { getUniqueValuesInArrayOfObjects } from "../../../../services/arrays/unique"
import { getColorPalette } from "@mitocube/viz/src/colors/palette";
import { Divider, H4 } from "@blueprintjs/core"
import { LegendItem, LegendLabel, LegendLinear, LegendOrdinal, LegendSize } from "@visx/legend"
import { roundNumber } from "../../../../services/format/number"
import { ScatterLegend, TextScatterLegend } from "./Legend"
import { ScatterLabel } from "./Label"
import { SearchIndicator } from "../annotations/Search"
import { ChartTopLeftLabel } from "../profiles/ProfileChart"
import { NetworkLinks } from "./Links"
import { Subsetboxplot } from "../boxplot/Subsetboxplot"
import { Protein, ProteinGroup } from "../../base/protein/Protein"
import { Genotype } from "../../base/genotype/Genotype"
import { Attribute } from "../../base/attributes/Attribute"
import { AnnotationGroup } from "../../base/annotations/AnnotationGroup"
import { Annotation } from "../../base/annotations/Annotation"

import { AnnotationMapDistribution } from "@/comps/analysis/mitomap/AnnotationMapDistribution"

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

Network.propTypes = {

    points : PropTypes.arrayOf(Object),
    defaultRadius: PropTypes.number,
    limits : PropTypes.object,
    xaxisName: PropTypes.string,
    yaxisName: PropTypes.string,
    colorName: PropTypes.string,
    sizeName: PropTypes.string,
    data: PropTypes.arrayOf(PropTypes.object),
    centerXAxisAtZero : PropTypes.bool,
    findDataInRectangle : PropTypes.func
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
 * @returns 
 */
export function Network({
    chartIdx,
    width = 500,
    height = 500,
    margins = {
        left: 45,
        top: 10,
        right: 5,
        bottom: 50
    },
    data,
    valid,
    hoverData = [],
    linkIdcs,
    limits,
    rerenderAxis,
    xaxisName,
    yaxisName,
    colorName = "x",
    sizeName = undefined,
    svgID = "scatterplot-n",
    tooltipNames = ["label"],
    labelNames = [],
    findDataInRectangle,
    handleSearchByDataIndex,
    filterDataInKeyByValue,
    resetSearchIdcs,
    setHoverDataInRectangle,
    centerXAxisAtZero = false,
    defaultRadius = 6,
    rerenderHover,
    hoverPosition,
    hoverChart,
    rerenderBackground,
    filterIndices,
    searchIndices,
    tooltipSmall = true,
    findClosestPoint,
    legend = false,
    labelData = [],
    hoverIndices = new Set(),
    labelIndices = new Set(),
    labelRerender = [],
    labelChart = -1,
    searchString = "",
    attributeValuesByTag = {},
    attributesByTag = {},
    suffix = "",
    indicateDataSize = true,
    legendWithAttributes = false,
    genotypesByLabel = {},
    tooltipNameIsAttribute = {}, 
    tooltipNameIsGenotype = {},
    tooltipNameIsFeature = {},
    tooltipNameIsNumeric = {}, //provide number to be rounded to.
    tooltipNameIsFeatures = {},
    triggerResetAxis,
    setTriggerResetAxisZoom,
    submission_tag,
    activeAnnotationTag,
    activeTestParam,
    onHoverDistributionChange
}) {

    const [zoomActive, setZoomActive] = useState(initZoomState)    
    const validDataInput = _.isArray(data) && _.isString(yaxisName) && _.isString(xaxisName)
    const tooltipOpen = hoverPosition.length === 2 && hoverIndices.size > 0
    const originalHoveredIndices = Array.from(hoverIndices)
    const linkMaps = useMemo(() => _.fromPairs(Array.from(hoverIndices).map(hoverIdc => [hoverIdc,_.filter(linkIdcs, linkIdc => linkIdc[0] === hoverIdc || linkIdc[1] === hoverIdc)])),[rerenderBackground,svgID,hoverIndices])
        useMemo( () => _.forEach(_.values(linkMaps), linkIdcs => _.forEach(linkIdcs, linkIdc => _.forEach(linkIdc, idx => hoverIndices.add(idx)))), [linkMaps])
    
    const hoveredIndex = tooltipOpen && originalHoveredIndices.length === 1 ? originalHoveredIndices[0] : null
    const hoveredNode = _.isNumber(hoveredIndex) ? data[hoveredIndex] : null
    const hoveredProteinValue = hoveredNode?.type === "protein" && _.isNumber(hoveredNode[colorName]) ? hoveredNode[colorName] : undefined
    const hoveredProteinTag = hoveredNode?.type === "protein" ? hoveredNode.tag : undefined
    const { data: hoveredProteinFeature } = api.features.tag.useGetFeatureByTag(
        { tag: hoveredProteinTag },
        { enabled: _.isString(hoveredProteinTag), staleTime: Infinity }
    )
    const hoveredProteinGeneName = hoveredProteinFeature?.gene_name
    const hoveredProteinAnnotationTag = useMemo(() => {
        if (!hoveredNode || hoveredNode.type !== "protein" || !_.isArray(linkIdcs) || !_.isNumber(hoveredIndex)) return undefined
        const linkedPair = linkIdcs.find(linkIdc => linkIdc[0] === hoveredIndex || linkIdc[1] === hoveredIndex)
        if (!linkedPair) return undefined
        const otherIdx = linkedPair[0] === hoveredIndex ? linkedPair[1] : linkedPair[0]
        return data[otherIdx]?.type === "annotation" ? data[otherIdx].tag : undefined
    }, [hoveredNode, hoveredIndex, linkIdcs, data])
    const hoverDistributionTag = hoveredNode
    ? hoveredNode.type === "annotation" ? hoveredNode.tag : hoveredProteinAnnotationTag
    : undefined
    const hoverDistributionTagType = "annotation"
    const lastHoverDistributionRef = useRef(undefined)

    useEffect(() => {
        if (!_.isFunction(onHoverDistributionChange)) return

        const next = {
            tag: hoverDistributionTag,
            tagType: hoverDistributionTagType,
            markerValue: hoveredProteinValue,
            markerLabel: hoveredNode?.type === "protein" ? (hoveredProteinGeneName ?? hoveredNode.tag) : undefined
        }
        const prev = lastHoverDistributionRef.current

        const unchanged = prev
            && prev.tag === next.tag
            && prev.markerValue === next.markerValue
            && prev.markerLabel === next.markerLabel

        if (unchanged) return

        lastHoverDistributionRef.current = next
        onHoverDistributionChange(next)
    }, [hoverDistributionTag, hoveredProteinValue, hoveredNode, hoveredProteinGeneName])
    // console.log("hoveredNode:", hoveredNode, "hoveredProteinValue:", hoveredProteinValue, "hoverDistributionTag:", hoverDistributionTag)

    // const hoverIndcsArray = Array.from(hoverIndices)
    const rectDist = Object.fromEntries([xaxisName, yaxisName].map(keyName => {
        let keyNameLimits = limits[keyName]
        let dist = Math.sqrt(Math.pow(keyNameLimits.max - keyNameLimits.min, 2)) * 0.007
        return [keyName, dist]
    }))

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

    const colorScale = useMemo(() => {
        if (!_.isString(colorName) || !_.has(data[0], colorName)) return () => "#efefef"
        
        if (_.has(limits,colorName)) {
            const colorDomain = limits[colorName]
            const m = _.max([Math.abs(colorDomain.min), Math.abs(colorDomain.max)])
            return scaleLinear({
                domain: [-m, 0, m],
                range: ["#095786","#fafafa","#ae0000"] // "#0090ab", "#db4646",#e6cea0#db4646
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
        
    }, [colorName,svgID])

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
    }, [sizeName, svgID])
    

 const getYScaleDomain = () => {
        const yDomain = limits[yaxisName]
        const yDomainWithMargin = addMarginToBoundaries({ domain: yDomain, frac: 0.1 })

        return yDomainWithMargin
    }

    const getXScaleDomain = () => {
        const xDomain = limits[xaxisName]
        const xDomainWithMargin = addMarginToBoundaries({ domain: xDomain, frac: 0.1 })
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
        
        useEffect(() => {
            if (zoomActive.zoomed && zoomActive.width > 10 && zoomActive.height > 10) {
                
                xScale.domain([xScale.invert(zoomActive.x), xScale.invert(zoomActive.x + zoomActive.width)])
                yScale.domain([yScale.invert(zoomActive.y), yScale.invert(zoomActive.y + zoomActive.height)])

                setZoomActive(prevValues => {return {...prevValues, ...initZoomState, currentXDomain : xScale.domain(), currentYDomain : yScale.domain()}})
            }

        }, [zoomActive.zoomed])

        
    
    return (
        <div className="flex" ref={containerRef} style={{ position: "relative" }}>
            <SVG {...{ width, height, svgID }}>
                 <rect x={margins.left}
                    y={margins.top}
                    width={chartWidth}
                    height={chartHeight}
                    fill="#ffffff"
                    opacity={0.0} />
                {_.isArray(linkIdcs) ?
                    <NetworkLinks nodes={data}
                        {...{
                            linkIdcs,
                        xScale,
                        yScale,
                        rerenderDependency: _.concat(rerenderBackground, [colorName, sizeName], xScale.domain(), yScale.domain()),
                        }} /> : null}
                <g>
                    {/* Render background data points to hide link lines */}
                {validDataInput ? <ScatterPoints {...{
                        data,
                        valid,
                        xScale,
                        yScale,
                        sizeScale,
                        xaxisName,
                        yaxisName,
                        sizeName,
                        glyphMap : { "annotation": "rect"},
                        checkPolyMap : true,
                        polyMapKeyName : "type",
                        fill : "#efefef",
                        rerenderDependency: _.concat(rerenderBackground, [sizeName], xScale.domain(), yScale.domain()),
                    }} /> : null}
            {/* Render data points */}
                    {validDataInput ? <ScatterPoints {...{
                        data,
                        valid,
                        xScale,
                        yScale,
                        xaxisName,
                        yaxisName,
                        sizeScale,
                        sizeName,
                        colorName,
                        checkColorMap: true, 
                        colorMap : { "annotation": "#e6d7ba","main" : "#e7ad00"}, // "feature" : "#79c29e""#466688"#79c29e#e7ad00#79c29e
                        colorMapKeyName : "type",
                        colorScale,
                        glyphMap : { "annotation": "rect"},
                        checkPolyMap : true,
                        polyMapKeyName : "type",
                        rerenderDependency: _.concat(rerenderBackground, [colorName, sizeName], xScale.domain(), yScale.domain()),
                        searchStrokeWidth : 1.5,
                        filterIndices,
                        searchIndices
                    }} /> : null}
            </g>
            <g>
            {/* Rerender hover points */}
                    {validDataInput ? <ScatterPoints {...{
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
                        colorScale,
                        glyphMap : { "annotation": "rect"},
                        checkPolyMap : true,
                        polyMapKeyName : "type",
                        fill: "red",
                        rerenderDependency: rerenderHover
                    }} /> : null}
                </g>
                {indicateDataSize ? <ChartTopLeftLabel {...{ margins, labelTexts: [`n=${data.length}`,colorName], textOffset: 3 }} /> : null}
                <g>
                    {labelIndices.size > 0 ? Array.from(labelIndices).map(labelIndex => <ScatterLabel {...{
                        key: `${labelIndex}-${chartIdx}`,data: data, xaxisName, yaxisName, xScale, yScale, labelNames, index: labelIndex, split : data[labelIndex]["node_type"] === "feature",
                        opacity: searchIndices.size === 0 ? 1 : searchIndices.has(labelIndex) ? 1 : 0.5
                    }}
                    rerenderDependency={[zoomActive.currentXDomain, zoomActive.currentYDomain]}/>) : null}
                </g>

                {searchIndices.size > 0 ? <SearchIndicator {...{margins,width,searchIndices,searchString}} /> : null}
            
                {zoomActive.active ? <rect  
                        x = {zoomActive.x} 
                        y ={zoomActive.y} 
                        width={zoomActive.width}
                        height={zoomActive.height}
                        stroke="black" 
                        strokeWidth={0.5} 
                        fill={"transparent"}/>:null
                }
               
                <rect x={margins.left}
                    y={margins.top}
                    width={chartWidth}
                    height={chartHeight}
                    onMouseMove={handleMouseHover}
                    onMouseUp={handleMouseUp}
                    onMouseDown={handleMouseDown}
                    fill="transparent"
                    opacity={0.0} />
            </SVG >
            {tooltipOpen && tooltipNames.length > 0 && hoverChart === chartIdx ?
                <TooltipInPortal
                    // set this to random so it correctly updates with parent bounds this tooltip is for the points of the scatter. 
                    key={Math.random()}
                    
                    left={hoverPosition[0]}
                    top={hoverPosition[1]}>
                    <div className="flex flex-column justify-start" style={{gap : "0.5px"}}>
                    {hoverIndices.size > 0 ? _.sortBy(Array.from(hoverIndices), index => data[index]?.type === "annotation" ? 0 : 1).map((index, i) => {
                            if (i == 10) return <div>...</div>
                            if (i > 10) return null

                            const hoverIndexData = data[index]
                                return <div
                                    className={tooltipSmall ? "" : "flex flex-column bg--lightgrey padding--medium margin--little"}
                                    key={`${index}-hover`}
                                    style={tooltipSmall ? {} : { borderLeft: "3px solid " + colorScale(hoverIndexData[colorName])}}>
                                    {_.has(hoverIndexData, "type") && hoverIndexData["type"] === "annotation" ? <h3><Annotation tag={hoverIndexData["tag"]} indicateNumberProteins={true} /></h3> : null}
                                        
                                {tooltipNames.map(tooltipName =>
                                {
                                    if (_.has(tooltipNameIsFeatures, tooltipName) && hoverIndexData.type !== "annotation") return <ProteinGroup tag={hoverIndexData[tooltipName]} minimal={true} showFavorite={true} />
                                    if (_.has(tooltipNameIsFeature, tooltipName) && hoverIndexData.type !== "annotation") return <Protein tag={hoverIndexData[tooltipName]} minimal={true} showFavorite={false} />
                                    else if (_.has(tooltipNameIsGenotype, tooltipName)) return <Genotype tag={hoverIndexData[tooltipName]} />
                                    else if (_.has(tooltipNameIsAttribute, tooltipName)) return <Attribute attribute_tag={hoverIndexData[tooltipName]} />
                                    else if (_.has(tooltipNameIsNumeric, tooltipName)) return <div key={`${index}-${tooltipName}`}>{`log2FC: ${_.round(hoverIndexData[tooltipName], tooltipNameIsNumeric[tooltipName])}`}</div>
                                    else {
                                        return  <div key={`${index}-${tooltipName}`} style={{ maxWidth: "min(30vw, 600px)" }}>{hoverIndexData[tooltipName]}</div>
                                    }

                                })}

                            </div>
                        })
                    : null}
                
                        
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
                    filterDataInKeyByValue,
                    resetSearchIdcs,
                    sizeLimit: limits[sizeName],
                    colorLimit: limits[colorName],
                    attributesByTag,
                    attributeValuesByTag,
                    genotypesByLabel
                }} /> : <TextScatterLegend
                    {...{
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
                        colorLimit: limits[colorName]}}/> : null}
                <div>
                    <h4>Network Legend</h4>
                    <div className="flex center-items"><svg width={20} height={20}><rect x={2} y={2} rx={3} width={18} height={18} fill={"#e6d7ba"} stroke="#000" strokeWidth={0.5} /></svg> <LegendLabel margin={5}>Pathway/Localization</LegendLabel></div>

                    <div className="flex center-items">
                    <svg width={20} height={20}><circle cx={10} cy={10} r={8} fill={"#fafafa"} stroke="#000" strokeWidth={0.5} /></svg> <LegendLabel margin={5}>Protein</LegendLabel></div>
                </div>
        </div>
        </div>
        

    )
}


