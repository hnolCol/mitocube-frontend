import PropTypes from 'prop-types';
import React from "react"
import _ from "lodash"
import { Text } from "@visx/text"


function Rect({x,y,width,height,fill,stroke = "#000000", strokeWidth = 0.5, opacity = 1}) {
    return (
        <rect 
            {...{x,y,width,height,stroke,fill,strokeWidth,opacity}}/>
    )
}

function RowLabel({ x, y, text, dx = 5, fontSize = 12, verticalAnchor = "middle", textAnchor = "start" }) {

    return (
        <Text {...{x,y,dx,textAnchor, verticalAnchor, fontSize}}>{text}</Text>
    )
}
HeatmapRow.propTypes = {
    data : PropTypes.array,
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
    labelString = ""
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
    
    return(
        
        <g 
            opacity={opacity} >
            {/* onMouseEnter = {focusView?() => handleHighlightedItems(rowData[nColumns]):undefined}> */}
        {/* Add cluster color rectangle */}
            {/* <rect 
                key = {`cluster-${index}`}
                x = {0} 
                y={index*size} 
                width={size} 
                height = {size} 
                fill = {clusterIndexColor}
                stroke={stroke}
                strokeWidth={strokeWidth} /> */}
            
            {valueNames.map((valueName, valueIdx) =>
               
                <Rect
                        x={valueIdx * binHeight}
                        y={y}
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
                                x={xValuesEnd + marginBetweenValuesAndLabels}
                                fontSize={binHeight/2}
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
   
   // check opacity change
  
      
   return true

  }
  
  export default React.memo(HeatmapRow, areEqual);

