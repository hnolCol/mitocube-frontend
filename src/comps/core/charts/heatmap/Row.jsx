import PropTypes from 'prop-types';
import React from "react"
import _ from "lodash"
import { Text } from "@visx/text"



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
    index,
    data,
    size,
    N,
    label,
    colorScale,
    opacity = 1,
    fontSize = 10,
    stroke = "black",
    clusterIndexColor = "red",
    strokeWidth = 0.4,
    annotationColor = "#bf3525" }) {
    
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
            <rect 
                key = {`cluster-${index}`}
                x = {0} 
                y={index*size} 
                width={size} 
                height = {size} 
                fill = {clusterIndexColor}
                stroke={stroke}
                strokeWidth={strokeWidth} />
            
        {/* Add heatmap data */}
            {_.range(N).map(columnIndex => {
                const v = data[columnIndex]
                return(
                    <rect 
                        key = {`${columnIndex}-${index}`}
                        x = {(columnIndex+1)*size+5} 
                        y={index*size} 
                        width={size} 
                        height = {size} 
                        fill = {colorScale(v)} 
                        stroke={stroke}
                        strokeWidth={strokeWidth}/>)
            })}
        {/* Add annotation to heatmap */}
            <Text  
                x = {(nColumns+(nExtraColumns+1))*(size)+8} 
                y={index*size+size/2} 
                fontSize={fontSize} 
                textAnchor={"start"} 
                verticalAnchor={"middle"}>
                {/* {`${rowData[nColumns+2]} (${rowData[nColumns]})`} */}
                    {label}
            </Text>
        {/* Add annotation data */}
            {_.range(nExtraColumns).map(iiExtra => {
                return(
                    <rect 
                        key = {`annotation-${index}-${iiExtra}`}
                        x = {(N+1+iiExtra)*size+8} 
                        y={index*size} 
                        width={size} 
                        height = {size} 
                        fill = {rowData[nColumns+(3+iiExtra)]!=="-"?annotationColor:"#efefef"}
                        stroke={stroke}
                        strokeWidth={strokeWidth}/>)})}
            </g>


    )
  }
  function areEqual(prevProps, nextProps) {
    /*
    return true if passing nextProps to render would return
    the same result as passing prevProps to render,
    otherwise return false
    */

   // check first if data changed 
   if (prevProps.rowData === undefined && nextProps.rowData !== undefined) {
    return false
   }
   // check if index changed
   if (prevProps.index !== nextProps.index) {
    return false
   }
   // check if column number changed
      if (prevProps.rowData[prevProps.nColumns] !== nextProps.rowData[nextProps.nColumns]) {
       
    return false
   }
   //deep comparision of data array
   if (!_.isEqual(prevProps.rowData,nextProps.rowData)){
    return false
   }
   // check opacity change
   if (prevProps.opacity !== nextProps.opacity) {
    return false
   }
      
   return true

  }
  
  export default React.memo(HeatmapRow, areEqual);

