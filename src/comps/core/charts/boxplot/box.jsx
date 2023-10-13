import React from "react"
import _ from "lodash"
import { areAllValuesNumbers } from "../../../../services/arrays/checks"

function Box({x, width, median, min, max, q25, q75, fill = "#efefef", stroke="black", strokeWidth = 0.5, showWhiskers = true, opacity = 1, whiskerScale = 0.5}) {
    // provide box coordinates in pixel 
    const whishkerWidth = width * whiskerScale
    const halfWidth = width / 2
    if (!areAllValuesNumbers([x,width,median,min,max,q25,q75])) return null
    return (
        <g {...{opacity}}>
            <rect x={x - halfWidth} y={q75} height={q25 - q75} {...{ width, fill, stroke, strokeWidth }} />
            {/* Min-Max Lines */}
            {[{ y1: min, y2: q25 }, { y1: max, y2: q75 }].map(((lineCoords, lineIdx) => {
                return (
                    <line key={`minMaxBox-${lineIdx}`} x1={x} x2={x} {...{ stroke, strokeWidth }} {...lineCoords} />
                )
            }))}
            {/* Whiskers */}
            {showWhiskers?[
                { y1: min, y2: min, x1: x - whishkerWidth / 2, x2: x + whishkerWidth / 2 },
                { y1: max, y2: max, x1: x - whishkerWidth / 2, x2: x + whishkerWidth / 2 }].map(((lineCoords, lineIdx) => {
                return (
                    <line key={`whiskerBox-${lineIdx}`} x1={x} x2={x} {...{ stroke, strokeWidth }} {...lineCoords} />
                )
                })) : null}
            {/* Median Line Gets a 1.2 strokewidth by default*/}
            <line x1={x - halfWidth} x2={x+halfWidth} y1={median} y2={median} {...{ stroke, strokeWidth : strokeWidth * 1.2 }}/>
        </g>
    )
}


function areEqual(prevProps, nextProps) {
    /*
    return true if passing nextProps to render would return
    the same result as passing prevProps to render,
    otherwise return false
    */
    const prevPropsSum = prevProps.x + prevProps.q25 + prevProps.q75 + prevProps.width + prevProps.min + prevProps.max + prevProps.median
    const nextPropsSum = nextProps.x + nextProps.q25 + nextProps.q75 + nextProps.width + nextProps.min + nextProps.max + nextProps.median
    
    if (prevPropsSum !== nextPropsSum) return false 
    if (prevProps.opacity!== nextProps.opacity) return false
    if (prevProps.fill !== nextProps.fill) return false
    if (prevProps.showWhiskers!== nextProps.showWhiskers) return false
    return true

  }
  
  export default React.memo(Box, areEqual);