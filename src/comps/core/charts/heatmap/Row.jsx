import PropTypes from 'prop-types';
import React, { useRef } from "react"
import _ from "lodash"
import { Text } from "@visx/text"
import { useInView } from 'framer-motion';


function Rect({x,y,width,height,fill,stroke = "#000000", strokeWidth = 0.5, opacity = 1}) {
    return (
        <rect 
            {...{x,y,width,height,stroke,fill,strokeWidth,fillOpacity:opacity, strokeOpacity : opacity}}/>
    )
}

function RowLabel({ x, y, text, dx = 5, fontSize = 14, verticalAnchor = "middle", textAnchor = "start" }) {

    return (
        <Text {...{x,y,dx,textAnchor, verticalAnchor, fontSize}}>{text}</Text>
    )
}
HeatmapRow.propTypes = {
    data : PropTypes.object.isRequired,
    size: PropTypes.number, // pixels, rectangle height and witdh
    index: PropTypes.number,
    colorScale: PropTypes.func,
    opacity: PropTypes.number,
    N: PropTypes.number,
    label : PropTypes.string,
    stroke: PropTypes.string,
    strokeWidth: PropTypes.number,
    annotationColor: PropTypes.string,
    fontSize: PropTypes.number,
    clusterIndexColor: PropTypes.string
}
function HeatmapRow({
    valueScale,
    extraColorScale,
    xValuesEnd,
    rowNumber,
    index,
    y,
    data,
    valueNames,
    colorNames,
    colorValuesExist,
    labelsExist,
    opacity = 1,
    binHeight,
    marginBetweenValuesAndColors,
    marginBetweenValuesAndLabels,
    labelString = "",
    handleMouseEnter,
    handleMouseLeave,
    maxIdx,
    minIdx,
    clusterIndexColor
    // index,
    // data,
    // size,
    // N,
    // label,
    // colorScale,
    // opacity = 1,
    // fontSize = 10,
    // stroke = "black",
    // clusterIndexColor = "red",
    // strokeWidth = 0.4,
    // annotationColor = "#bf3525" 
}) {
    // const {
    //     binHeight,
    //     data,
    //     rowIndex,
    //     nColumns, // column numbers of expression columns - next is key
    //     nExtraColumns,
    //     clusterColors,
    //     handleHighlightedItems,
    //     focusView,
    //     colorScale,
    //     opacity } = props

    if (!_.inRange(rowNumber,minIdx,maxIdx)) return null 
    return(
        
        <g onMouseEnter={_.isFunction(handleMouseEnter) ? (e) => handleMouseEnter(e, index) : undefined}
            onMouseLeave={_.isFunction(handleMouseLeave) ? handleMouseLeave : undefined}>
            {/* onMouseEnter = {focusView?() => handleHighlightedItems(rowData[nColumns]):undefined}> */}
        {/* Add cluster color rectangle */}
            <Rect 
                key = {`cluster-${index}`}
                x = {0} 
                y={y} 
                width={binHeight} 
                opacity={opacity}
                height = {binHeight} 
                fill = {clusterIndexColor}
                />
            
            {valueNames.map((valueName, valueIdx) =>
                <Rect
                    key={`${valueName}-${valueIdx}`}
                    x={(valueIdx+1) * binHeight + binHeight/4}
                    y={y}
                    opacity={opacity}
                    width={binHeight}
                    height={binHeight}
                    fill={data[valueName]===undefined ? "#fafafa" : valueScale(data[valueName])}
                    />)}
                    {colorValuesExist ?
                        colorNames.map((colorName, colorIdx) => {
                            return (
                                <Rect
                                    x={xValuesEnd + marginBetweenValuesAndColors + colorIdx * binHeight}
                                    width={binHeight}
                                    height={binHeight}
                                    y={y}
                                    fill = {extraColorScale(data[colorName])} />)
                        })
                    : null}
                        {labelsExist ?
                            <RowLabel
                                x={xValuesEnd + binHeight/4 + marginBetweenValuesAndLabels + binHeight}
                                fontSize={binHeight*0.80}
                                y={y + binHeight / 2} text={labelString} /> : null}
                    </g>


    )
  }
  function areEqual(prevProps, nextProps) {
    /*
    return true if passing nextProps to render would return
    the same result as passing prevProps to render,
    otherwise return false
    */
    
    const prevInView = _.range(prevProps.rowNumber, prevProps.minIdx,prevProps.maxIdx)
    const nextInView = _.range(nextProps.rowNumber, nextProps.minIdx, nextProps.maxIdx)
      
    if (prevInView !== nextInView) return false 
    if (prevProps.labelString !== nextProps.labelString) {
        return false 
    }
    if (prevProps.opacity !== nextProps.opacity) {
        return false
    }
    if (prevProps.valueNames !== prevProps.valueNames) {
        return false
    }
    if (prevProps.y !== prevProps.y) {
        return false
    }
    if (prevProps.binHeight !== prevProps.binHeight) {
        return false
    }
      
   return true

  }
  
  export default React.memo(HeatmapRow, areEqual);

