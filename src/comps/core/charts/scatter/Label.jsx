import React, { useEffect } from "react";
import _ from "lodash"
import { Text } from "@visx/text";


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
    const xDomain = prevProps.xScale.domain()
    const yDomain = prevProps.yScale.domain()
    if (prevProps.text !== nextProps.text) return false
    const prevTag = prevProps.data[prevProps.index]["tag"]
    const nextTag = nextProps.data[nextProps.index]["tag"]
    if (prevTag !== nextTag) return false 
   
    if (_.some(prevProps.rerenderDependency, (value, idx) => nextProps.rerenderDependency[idx] !== value)) return false 
    if (xDomain[0] !== nextProps.xScale.domain()[0] || xDomain[1] !== nextProps.xScale.domain()[1]) return false 
    if (yDomain[0] !== nextProps.yScale.domain()[0] || yDomain[1] !== nextProps.yScale.domain()[1]) return false

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
     * @param {String[] props.rerenderDependency - The list of props that should trigger a rerender if they change. This is important for performance reasons, because calculating the label can be expensive if there are many items.}
     * @returns 
     */
    function ScatterLabel({
        data,
        index,
        xScale,
        yScale,
        xaxisName,
        yaxisName,
        text,
        // labelNames,
        // split = true,
        // joinString = ",",
        // splitString = " ",
        // splitIndex = 0,
        offset = 5,
        opacity = 1,
        // isFeature = true,
        rerenderDependency = [],
        setRequiredProteinTags,

    }) {
    
       
    const domainIsAroundZero = xScale.domain()[0] < 0 && xScale.domain()[1] > 0 
    // if (labelStrings.length === 0) return null 
    if (!_.isNumber(data[index][xaxisName]) || !_.isNumber(data[index][yaxisName])) return null 
    
    const x = xScale(data[index][xaxisName])
    const y = yScale(data[index][yaxisName])
    if (!_.inRange(data[index][xaxisName], xScale.domain()[0], xScale.domain()[1]) || !_.inRange(data[index][yaxisName], yScale.domain()[1], yScale.domain()[0])) return null


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
            {text}
        </Text>
        
    )
    }, areEqual )

export { ScatterLabel }