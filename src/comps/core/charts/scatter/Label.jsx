import React from "react";
import { LegendItem, LegendLabel, LegendLinear, LegendOrdinal, LegendSize } from "@visx/legend";
import { Tooltip, useTooltip } from "@visx/tooltip";
import _ from "lodash"
import { roundNumber } from "../../../../services/format/number";
import { Text } from "@visx/text";
import hooks from "@mitocube/api-hooks"
import { useGetFeatureByTag } from "../../../../hooks/queries/feature.hooks";
/**
 * @description Checks if the legend should rerender. basically only a change in colorName or sizeName causes a rerender. 
 * This might be important if the list of items is long.
 * @param {Object} prevProps 
 * @param {*} nextProps 
 * @returns 
 */
function areEqual(prevProps, nextProps) {
    const labelNamesEqual = _.every(prevProps.labelNames, (text, idx) => nextProps.labelNames[idx] === text)
    if (!labelNamesEqual) return false 
    if (prevProps.index !== nextProps.index) return false 
    if (prevProps.xaxisName !== nextProps.xaxisName) return false 
    if (prevProps.yaxisName !== nextProps.yaxisName) return false 
    if (prevProps.opacity !== nextProps.opacity) return false 
    if (prevProps.split !== nextProps.split) return false 
    return true
  }


const ScatterLabel = React.memo(
    /**
     * 
     * @param {Object} props 
     * @param {Object[]} props.data - The data as an array of objects. 
     * @param {Number} props.index - The index (e.g. item position in array) for which the label is made. 
     * @param {String} props.xaxisName - The xaxis name (x axis)
     * @param {String} props.yaxisName - The yaxis name (y axis)
     * @param {String[]} props.labelNames - The array of keyNames to the labels.
     * @param {Function} props.xScale - The scale to calculate the pixel position in the svg for the x-axis
     * @param {Function} props.yScale - The scale to calculate the pixel position in the svg for the y-axis
     * @param {Boolean} props.split - If the label should be split by the props.splitString and taking the desired props.splitIndex
     * @returns 
     */
    function ScatterLabel({
        data,
        index,
        xScale,
        yScale,
        xaxisName,
        yaxisName,
        labelNames,
        split = true,
        joinString = ",",
        splitString = " ",
        splitIndex = 0,
        offset = 5,
        opacity = 1,
        isFeature = true
    }) {
    
    const { data : feature, isLoading, isSuccess } = useGetFeatureByTag({tag : data[index]["tag"]}, {enabled : isFeature})
    console.log(feature)
    console.log(data[index]["tag"])
    const labelStrings = labelNames.map(labelName => data[index][labelName]).filter(text => _.isString(text))
    const labelText = _.join(labelStrings.map(labelString => split?_.split(labelString,splitString).at(splitIndex):labelString), joinString)
    const domainIsAroundZero = xScale.domain()[0] < 0 && xScale.domain()[1] > 0 
    if (labelStrings.length === 0) return null 
    if (!_.isNumber(data[index][xaxisName]) || !_.isNumber(data[index][yaxisName])) return null 

    const x = xScale(data[index][xaxisName])
    const y = yScale(data[index][yaxisName])
    const moveLeft = domainIsAroundZero && data[index][xaxisName] < 0

    return (
        <Text
            x={x}
            y={y}
            verticalAnchor="end"
            textAnchor={moveLeft ? "end" : "start"}
            dx={moveLeft ? - offset : offset}
            dy={-offset}
            fillOpacity={opacity}
        >
            {labelText}
            <span>hllo</span>
        </Text>
        
    )
    }, areEqual )

export { ScatterLabel }