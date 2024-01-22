import PropTypes from "prop-types"
import _ from "lodash"
import { getUniqueValuesInArrayOfObjects } from "../../../../services/arrays/unique"
import React, { useMemo, useState, useRef } from "react"
import { scaleLinear, scaleOrdinal } from "@visx/scale"
import { getColorPalette, getRedBlueColorScale } from "../../colors/colorPalette"
import { SVG } from "../SVGHeader"
import { getQuantiles } from "../../../../services/statistics/quantiles"
import HeatmapRow from "./Row"
import { useTooltip, useTooltipInPortal } from "@visx/tooltip"
import { LegendItem, LegendLabel, LegendLinear } from "@visx/legend"
import { roundNumber } from "../../../../services/format/number"
import useDebounce from "../../../../hooks/useDebounce"

Heatmap.propTypes = {
    width : PropTypes.number,
    data: PropTypes.arrayOf(PropTypes.object),
    valueNames: PropTypes.arrayOf(PropTypes.string),
    clusterName: PropTypes.string,
    colorNames: PropTypes.arrayOf(PropTypes.string), // columns that are plotted next to the right of the value 
    binHeight : PropTypes.number
}
/**
 * 
 * @param {Object} props 
 * @param {Object[]} props.data - The data for the heatmap 
 * @param {String[]} props.valueNames - The keyNames in data items that should be shown in the heatmap 
 * @param {String[]} props.colorNames - The keyNames in data items that should be used for an extra color column in the heatmap
 * @param {Number} props.binHeight - The pixel height of rectangle in the heatmap 
 * @param {Boolean} props.matchWidth - If the width of the SVG should be matched. If enabled the binHeight will not be used for the width of the rectangle. Which is otherwise done to
 * achieve rectangles.
 * @returns {React.ReactElement} - THe heatmap JSX Element.
 */
function Heatmap({
    data = [{v : 2, v1 : 4, B : "+", C : "-"},{v : 2, v1 : 4, B : "+", C : "-"},{v : 2, v1 : 4, B : "+", C : "-"},{v : -2, v1 : 2, B : "-", C : "+"}, {v : 0, v1 : 1.2, B : "-", C : "+"}],
    valueNames = ["v","v1"],
    clusterName = "c",
    colorNames = ["B", "C"],
    labelNames = ["B"],
    binHeight = 15,
    legendElementSize = 20,
    matchWidth = true,
    handleSearchByDataIndex,
    resetSearchIdcs,
    searchIndices = new Set(),
    hoverIndices = new Set(),
    setHoverDataByDataIndex
}) {
 
    //updates only on datalength. can be dangerous
    const [scrollPos, setScrollPos] = useState(0)
    const uniqueColorValues = useMemo(() => colorNames.length > 0 ? getUniqueValuesInArrayOfObjects({data, keyName : colorNames}) : [], [_.join(colorNames),data.length])
    const uniqueClusterValues = useMemo(() => getUniqueValuesInArrayOfObjects({ data, clusterName }), [clusterName])
    const heatmapValues = useMemo(() => _.map(data, d => _.map(valueNames, valueName => d[valueName])), [_.join(valueNames),data.length])
    const minMax = useMemo(() => getQuantiles(_.flatten(heatmapValues), [0, 1], 1.5, false, "valueRange", ["min", "max"]).valueRange, [heatmapValues])
    const labels = useMemo(() => { return labelNames.length > 0?_.map(data, d => _.join(_.map(labelNames, labelName => d[labelName])," | ")) : undefined}, [_.join(labelNames),data.length])
    const labelsExist = _.isArray(labels)
    const colorValuesExist = uniqueColorValues.length > 0
    const numberRows = data.length
    const heatmapSVGHeight = numberRows * binHeight
    const heatmapSVGWidth = valueNames.length * binHeight + colorNames.length * binHeight + 300
    const { tooltipData, tooltipOpen, tooltipLeft, tooltipTop, hideTooltip, showTooltip } = useTooltip()
    const refScrollContainer = useRef(null)
    let minIdx = 0
    let maxIdx = 20
    useDebounce()

    const { containerRef, TooltipInPortal } = useTooltipInPortal({
        // use TooltipWithBounds
        detectBounds: true,
        // when tooltip containers are scrolled, this will correctly update the Tooltip position
        scroll: true,
    })



    //value scale 
    /**
     * @description Calculates the colorScale to visualize the values. The function is memorized 
     * and only recalculated if minMax or the heatmapValues changes.
     * @returns {Function} 
     */
    const valueScale = useMemo(() => {
        return scaleLinear({
            domain: [minMax[0],0,minMax[1]],
            range : getRedBlueColorScale()
    })},[minMax,heatmapValues])

    /**
     * @description The colorScale for the individual clusters. 
     */
    const clusterColorScale = useMemo(() => {
        if (uniqueClusterValues.length === 0) return () => "#fafafa"
        return scaleOrdinal({
            domain: uniqueClusterValues,
            range : getColorPalette(uniqueClusterValues.length)
        })
    })

    //color that indicates extra values (plotted next to the value heatmap) 
    /**
     * @description Calculates the colorScale for the extraColor (keyNames)
     */
    const extraColorScale = useMemo(() => {
        if (uniqueColorValues.length === 0) return () => "#fafafa"
        var colorPalette = getColorPalette(uniqueColorValues.length)
        const idx = uniqueColorValues.indexOf("-")
        if (_.isNumber(idx)) colorPalette[idx] = "#fafafa"
        return scaleOrdinal({
            domain: uniqueColorValues,
            range: colorPalette,
        })
    }, [uniqueColorValues])


    const handleMouseEntersRow = (event, index) => {
        hoverIndices.clear()
        hoverIndices.add(index)
        setHoverDataByDataIndex(undefined,hoverIndices)
        //setHoverRowNumber(rowNumber)
        // const coords = localPoint(event.target.ownerSVGElement, event);
        // console.log(coords)
    }
    const handleMouseLeavesRow = () => {
        hoverIndices.clear()
        setHoverDataByDataIndex(undefined,hoverIndices)
    }
    //


    const dataIdcs = searchIndices.size > 0 ? _.range(numberRows).filter(idx => searchIndices.has(idx)) : _.range(numberRows)
    //console.log(dataIdcs)
    if (refScrollContainer.current !== null){
    //console.log(refScrollContainer.current.clientHeight)
      //  console.log(scrollPos)
        minIdx = scrollPos / binHeight
        maxIdx = minIdx + refScrollContainer.current.clientHeight / binHeight

    }
    return (
        
        <div className="flex">
            <div>
                <LegendLinear scale={valueScale}>
                    {(labels) => labels.map(label => {
                            return <LegendItem>
                                <svg width={legendElementSize} height={legendElementSize}><rect width={legendElementSize} height={legendElementSize} fill={label.value} /></svg>
                                <LegendLabel>{roundNumber({ number: label.datum, limit : {min : minMax[0], max : minMax[1]}})}</LegendLabel>
                        </LegendItem>
                    })}
                </LegendLinear>
            </div>
            {/* The actual heatmap with values */}
            <div style={{ overflowY: "scroll", maxHeight: "70vh" }} onScroll={(e) => setScrollPos(e.target.scrollTop)} ref={refScrollContainer}>
            <SVG {...{ width: heatmapSVGWidth, height: heatmapSVGHeight, svgRef: containerRef }}>
                
                {dataIdcs.map((index,rowNumber) => {
                   // if (searchIndices.size > 0 && !searchIndices.has(rowNumber)) return null 
                    var rowValues = heatmapValues[index]
                    var y = rowNumber * binHeight
                    var xValuesEnd = rowValues.length * binHeight
                    var marginBetweenValuesAndColors = colorValuesExist ? binHeight : 0
                    var marginBetweenValuesAndLabels = colorValuesExist ? colorNames.length * binHeight + marginBetweenValuesAndColors : marginBetweenValuesAndColors 
                    var labelString = labelsExist ? labels[index] : undefined
                    return (
                        <HeatmapRow {...{
                            key: `${index}-${rowNumber}-${labelString}`,
                            data : data[index],
                            valueNames,
                            rowNumber,
                            index,
                            minIdx,
                            maxIdx,
                            y,
                            binHeight,
                            valueScale,
                            xValuesEnd,
                            extraColorScale,
                            marginBetweenValuesAndColors,
                            marginBetweenValuesAndLabels,
                            colorValuesExist,
                            colorNames,
                            labelsExist,
                            labelString,
                            opacity : hoverIndices.size === 0 ? 1 : hoverIndices.has(index) ? 1 : 0.4,
                            handleMouseEnter: handleMouseEntersRow,
                            handleMouseLeave : handleMouseLeavesRow
                        }} />
                    )
                })}

                </SVG>
                </div>
            {tooltipOpen ? <TooltipInPortal left={tooltipLeft} top={tooltipTop} key={Math.random()}>
                <p>BUM</p>

            </TooltipInPortal> : null}
        </div>
    )
}

export default Heatmap