import PropTypes from "prop-types"
import { getChartWidthAndHeightWithMargins } from "../../../../services/plotting/size"
import { useMemo, useRef } from "react"
import { addMarginToBoundaries, getBoundariesFromArrayOfObjects, getMaxAbsoluteValue } from "../../../../services/arrays/boundaries"
import { scaleLinear, scaleOrdinal } from "@visx/scale"
import { SVG } from "../SVGHeader"
import { useTooltip, useTooltipInPortal, TooltipWithBounds, Tooltip } from '@visx/tooltip';
import { localPoint } from '@visx/event';

import _ from "lodash"
import ScatterPoints from "./ScatterPoints"
import { getUniqueValuesInArrayOfObjects } from "../../../../services/arrays/unique"
import { getColorPalette } from "../../colors/colorPalette"
import { Divider, H4 } from "@blueprintjs/core"
import { LegendItem, LegendLabel, LegendLinear, LegendOrdinal, LegendSize } from "@visx/legend"
import { roundNumber } from "../../../../services/format/number"
import { ScatterLegend, TextScatterLegend } from "./Legend"
import { ScatterLabel } from "./Label"
import { SearchIndicator } from "../annotations/Search"
import { ChartTopLeftLabel } from "../profiles/ProfileChart"
import { NetworkLinks } from "./Links"
import { Subsetboxplot } from "../boxplot/Subsetboxplot"


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
    genotypesByLabel = {}
}) {
    //console.log(colorName)
    // Plots an array of points. Each item in the array 
    // must be an object including the following keys: x, y, r
    const validDataInput = _.isArray(data) && _.isString(yaxisName) && _.isString(xaxisName)
    const tooltipOpen = hoverPosition.length === 2 && hoverIndices.size > 0
    const linkMaps = useMemo(() => _.fromPairs(Array.from(hoverIndices).map(hoverIdc => [hoverIdc,_.filter(linkIdcs, linkIdc => linkIdc[0] === hoverIdc || linkIdc[1] === hoverIdc)])),[rerenderBackground,svgID,hoverIndices])
    useMemo( () => _.forEach(_.values(linkMaps), linkIdcs => _.forEach(linkIdcs, linkIdc => _.forEach(linkIdc, idx => hoverIndices.add(idx)))), [linkMaps])
    
    const hoverIndcsArray = Array.from(hoverIndices)
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
    const yScale = useMemo(() => {
        // y scale for the scatter
    
        const yDomain = limits[yaxisName]
        const yDomainWithMargin = addMarginToBoundaries({ domain: yDomain, frac: 0 })
        return scaleLinear(
            {
                domain: [yDomainWithMargin.max, yDomainWithMargin.min],
                range: [margins.top, margins.top + chartHeight],
                nice: true
            }
        )
    }, [yaxisName, chartHeight, svgID])


    const xScale = useMemo(() => {
        // y scale for the scatter
        const xDomain = limits[xaxisName]
        const xDomainWithMargin = addMarginToBoundaries({ domain: xDomain, frac : 0 })
        const maxValue = getMaxAbsoluteValue([xDomainWithMargin.max, xDomainWithMargin.min])
        
        return scaleLinear(
            {
                domain: centerXAxisAtZero ? [-maxValue, maxValue] : [xDomainWithMargin.min, xDomainWithMargin.max],
                range: [margins.left, margins.left + chartWidth],
                nice: true
            }
        )
    }, [xaxisName, chartWidth,svgID])

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
    }, [sizeName,svgID])

    const handleMouseUp = (event) => {
        const coords = localPoint(event.target.ownerSVGElement, event);
        const x = xScale.invert(coords.x)
        const y = yScale.invert(coords.y)
        findClosestPoint(chartIdx,
            x - rectDist[xaxisName],
            y - rectDist[yaxisName],
            x + rectDist[xaxisName],
            y + rectDist[yaxisName])
    }    
    const handleMouseHover = (event) => {

        const coords = localPoint(event.target.ownerSVGElement, event);
        const x = xScale.invert(coords.x)
        const y = yScale.invert(coords.y)
        setHoverDataInRectangle(chartIdx,
            x - rectDist[xaxisName],
            y - rectDist[yaxisName],
            x + rectDist[xaxisName],
            y + rectDist[yaxisName], [coords.x, coords.y])
        //const findDataInRectangle = (chartIdx,minX,minY,maxX,maxY) => {
    }
    return (
        <div className="flex" ref={containerRef}>
        <SVG {...{ width, height, svgID}}>
            {/* <AxisWithBackground
                margins={margins}
                leftScale={yScale}
                bottomScale={xScale}
                bottomLabel={`${xaxisName} ${suffix}`}
                leftHideTicks={false}
                leftLabel={`${yaxisName} ${suffix}`}
                moveBottomToLeft={false}
                findAttributesForBottomScale={false}
                    {...{ chartHeight, chartWidth }} /> */}
            
                {_.isArray(linkIdcs) ? <NetworkLinks nodes={data} {...{ linkIdcs, xScale, yScale, rerenderDependency: _.concat(rerenderBackground, [colorName, sizeName]), }} /> : null}
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
                        glyphMap : { "pathway": "rect", "localization" : "rect"},
                        checkPolyMap : true,
                        polyMapKeyName : "node_type",
                        fill : "#efefef",
                        rerenderDependency: _.concat(rerenderBackground, [sizeName]),
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
                        colorMap : { "pathway": "#e6d7ba", "localization" : "#e6d7ba","main" : "#e7ad00"}, // "feature" : "#79c29e""#466688"#79c29e#e7ad00#79c29e
                        colorMapKeyName : "node_type",
                        colorScale,
                        glyphMap : { "pathway": "rect", "localization" : "rect"},
                        checkPolyMap : true,
                        polyMapKeyName : "node_type",
                        rerenderDependency: _.concat(rerenderBackground, [colorName, sizeName]),
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
                        glyphMap : { "pathway": "rect", "localization" : "rect" },
                        checkPolyMap : true,
                        polyMapKeyName : "node_type",
                        fill: "red",
                        rerenderDependency: rerenderHover
                    }} /> : null}
                </g>
                {indicateDataSize ? <ChartTopLeftLabel {...{ margins, labelTexts: [`n=${data.length}`,colorName], textOffset: 3 }} /> : null}
                <g>
                    {labelIndices.size > 0 ? Array.from(labelIndices).map(labelIndex => <ScatterLabel {...{
                        key: `${labelIndex}-${chartIdx}`,data: data, xaxisName, yaxisName, xScale, yScale, labelNames, index: labelIndex, split : data[labelIndex]["node_type"] === "feature",
                        opacity: searchIndices.size === 0 ? 1 : searchIndices.has(labelIndex) ? 1 : 0.5}} />) : null}
                </g>

                {searchIndices.size > 0 ? <SearchIndicator {...{margins,width,searchIndices,searchString}} /> : null}
                <rect x={margins.left} y={margins.top} width={chartWidth} height={chartHeight} onMouseMove={handleMouseHover} onMouseUp = {handleMouseUp} fill="#ffffff" opacity={0.0}/>
            
            </SVG >
            {tooltipOpen && tooltipNames.length > 0 && hoverChart === chartIdx ?
                <TooltipInPortal
                    // set this to random so it correctly updates with parent bounds this tooltip is for the points of the scatter. 
                    key={Math.random()}
                    
                    left={hoverPosition[0]}
                    top={hoverPosition[1]}>
                    <div className="flex flex-column justify-start" >
                        {hoverIndcsArray.map((idx, ii) => _.isObject(data[idx]) ? <div key={`${idx}-hover`}>
                            {<div>
                                {ii === 0 ? <h4>{data[hoverIndcsArray[ii]][tooltipNames[0]]} {_.isNumber(data[idx][colorName]) ? `(${_.round(data[idx][colorName], 2)})` : null} ({hoverIndcsArray.length} links)</h4> : 
                                    ii > 10 ? null : ii === 10 ? <div>...</div> : 
                                    tooltipNames.map(tooltipName => <div key={`${idx}-${tooltipName}`}
                                        style={{ maxWidth: "min(30vw, 600px)" }}>
                                        {data[idx][tooltipName]} {_.isNumber(data[idx][colorName]) ? `(${_.round(data[idx][colorName], 2)})`: ""}
                                    </div>)
                                }
                                {_.isString(colorName) && _.has(data[0],colorName) && ii === hoverIndcsArray.length - 1 && data[hoverIndcsArray[0]]["node_type"] !== "feature" ? <Subsetboxplot {...{data, yaxisName : colorName , subsetIndices : [hoverIndcsArray], subsetNames : [data[hoverIndcsArray[0]]["id"]]}} /> : null}
                                {tooltipNames.length > 1 && hoverData.length > 1 ? <Divider /> : null}
                            </div>
                            }
                        </div> : null)}
                        
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


