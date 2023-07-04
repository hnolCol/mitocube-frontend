import React from "react"
import _ from "lodash"
import { areAllValuesNumbers } from "../../../../services/arrays/checks"

function Bar({
    x,
    width,
    y1, // the actual height of the bar
    y0, // the baseline of the bar
    fill = "#efefef",
    stroke = "black",
    strokeWidth = 0.5,
    opacity = 1 }) {
    // provide box coordinates in pixel 
    const barHeight = y0 > y1 ? y0-y1 : y1-y0
    const barBaseLine = y0 > y1 ? y1 : y0
    if (!areAllValuesNumbers([x,width,y1,y0])) return null 
    return (
        <g {...{opacity}}>
            {barHeight === 0 ? <line x1={x} x2={x + width} y1={barBaseLine} y2={barBaseLine} {...{ stroke, strokeWidth }} /> :
                <rect x={x} y={barBaseLine} height={barHeight} {...{ width, fill, stroke, strokeWidth }} />}
        </g>
    )
}


function areEqual(prevProps, nextProps) {
    /*
    return true if passing nextProps to render would return
    the same result as passing prevProps to render,
    otherwise return false
    */
    if (prevProps.y0 !== nextProps.y0) return false
    if (prevProps.y1 !== nextProps.y1) return false
    if (prevProps.x!== nextProps.x) return false
    if (prevProps.opacity!== nextProps.opacity) return false
    if (prevProps.fill !== nextProps.fill) return false
    return true

  }
  
  export default React.memo(Bar, areEqual);