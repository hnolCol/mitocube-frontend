import PropTypes from "prop-types"
import AxisWithBackground from "../axis"
import { getChartWidthAndHeightWithMargins } from "../../../../services/plotting/size"
import { useMemo } from "react"
import { addMarginToBoundaries, getMaxAbsoluteValue } from "../../../../services/arrays/boundaries"
import { scaleLinear, scaleOrdinal } from "@visx/scale"
import { SVG } from "../SVGHeader"
import { useTooltipInPortal } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import ScatterPoints from "./ScatterPoints"
import { getUniqueValuesInArrayOfObjects } from "../../../../services/arrays/unique"
import { getColorPalette } from "../../colors/colorPalette"
import { Divider, H4 } from "@blueprintjs/core"
import { ScatterLegend, TextScatterLegend } from "./Legend"
import { ScatterLabel } from "./Label"
import { SearchIndicator } from "../annotations/Search"
import { ChartTopLeftLabel } from "../profiles/ProfileChart"
import { Attribute } from "../../base/attributes/Attribute"
import { Protein, ProteinGroup } from "../../base/protein/Protein"
import { checkFullMargin } from "../../types/checks/chart"
import { Genotype } from "../../base/genotype/Genotype"
import _ from "lodash"

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
    tooltipNameIsFeatures: PropTypes.object
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
 * 
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
    tooltipNameIsNumeric = {},
    tooltipNameIsFeatures = {}//give number to be rounded to.
}) {

    // Plots an array of points. Each item in the array 
    // must be an object including the following keys: x, y, r
    const validDataInput = _.isArray(data) && _.isString(yaxisName) && _.isString(xaxisName)
    const tooltipOpen = hoverPosition.length === 2 && hoverIndices.size > 0
    const rectDist = Object.fromEntries([xaxisName, yaxisName].map(keyName => {
        let keyNameLimits = limits[keyName]
        let dist = Math.sqrt(Math.pow(keyNameLimits.max - keyNameLimits.min, 2)) * 0.02
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
    const yScale = useMemo(() => {
        // y scale for the scatter
    
        const yDomain = limits[yaxisName]
        const yDomainWithMargin = addMarginToBoundaries({ domain: yDomain })
        return scaleLinear(
            {
                domain: [yDomainWithMargin.max, yDomainWithMargin.min],
                range: [margins.top, margins.top + chartHeight],
                nice: true
            }
        )
    }, [yaxisName, chartHeight, limits[yaxisName].min, limits[yaxisName].max])


    const xScale = useMemo(() => {
        // y scale for the scatter
        const xDomain = limits[xaxisName]
        const xDomainWithMargin = addMarginToBoundaries({ domain: xDomain })
        const maxValue = getMaxAbsoluteValue([xDomainWithMargin.max, xDomainWithMargin.min])
        
        return scaleLinear(
            {
                domain: centerXAxisAtZero ? [-maxValue, maxValue] : [xDomainWithMargin.min, xDomainWithMargin.max],
                range: [margins.left, margins.left + chartWidth],
                nice: true
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
        
    }, [colorName])

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
            <AxisWithBackground
                margins={margins}
                leftScale={yScale}
                bottomScale={xScale}
                bottomLabel={`${_.isString(xaxisLabel) ? xaxisLabel : xaxisName} ${suffix}`}
                leftHideTicks={false}
                leftLabel={`${_.isString(yaxisLabel) ? yaxisLabel : yaxisName} ${suffix}`}
                moveBottomToLeft={false}
                findAttributesForBottomScale={false}
                {...{ chartHeight, chartWidth }} />
            <g >
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
                        colorScale,
                        rerenderDependency: _.concat(rerenderBackground, [colorName, sizeName]),
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
                        fill: "red",
                        rerenderDependency: rerenderHover
                    }} /> : null}
                </g>
                {indicateDataSize ? <ChartTopLeftLabel {...{ margins, labelTexts: [`n=${validPoints}`], textOffset: 3 }} /> : null}
                <g>
                    {labelIndices.size > 0 ? Array.from(labelIndices).map(labelIndex => <ScatterLabel {...{
                        key: `${labelIndex}-${chartIdx}`,data: data, xaxisName, yaxisName, xScale, yScale, labelNames, index: labelIndex,
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
                                    if (_.has(tooltipNameIsFeatures, tooltipName)) return <ProteinGroup tag={hoverIndexData[tooltipName]} minimal={true} />
                                                if (_.has(tooltipNameIsFeature, tooltipName)) return <Protein tag={hoverIndexData[tooltipName]} />
                                                else if (_.has(tooltipNameIsGenotype, tooltipName)) return <Genotype tag={hoverIndexData[tooltipName]} />
                                                else if (_.has(tooltipNameIsAttribute, tooltipName)) return <Attribute attribute_tag={hoverIndexData[tooltipName]} />
                                                else if (_.has(tooltipNameIsNumeric, tooltipName)) return <div>{`${tooltipName}: ${_.round(hoverIndexData[tooltipName],tooltipNameIsNumeric[tooltipName])}`}</div>
                                                else {
                                                    return  <div key={`${index}-${tooltipName}`} style={{ maxWidth: "min(30vw, 600px)" }}>{hoverIndexData[tooltipName]}</div>
                                                }

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
                    maxWidth : "8rem",
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
        </div>
        </div>
        

    )
}


