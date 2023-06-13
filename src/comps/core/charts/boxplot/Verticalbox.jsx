import React from "react"


function VerticalBox({center = 10, width = 15, median = 160, min = 220, max = 20, q25 = 185, q75 = 22, fill = "#efefef", stroke="black", strokeWidth = 0.5, showWhiskers = true, opacity = 1, scaleWhishkers = 0.65, handleBoxMouseEnter = undefined, ref = undefined}) {
    // provide box coordinates in pixel 
    const whishkerWidth = width * scaleWhishkers
    const halfWidth = width / 2
    console.log(q75,q25)
    return (
        <g {...{opacity, ref}}>
            <rect
                y={center - halfWidth}
                x={q25}
                width={q75 - q25}
                height={width}
                onMouseEnter={handleBoxMouseEnter}
                {...{ fill, stroke, strokeWidth }} />
            {/* Min-Max Lines */}
            {[{ x1: min, x2: q25 }, { x1: q75, x2: max }].map(((lineCoords, lineIdx) => {
                return (
                    <line key={`minMaxBox-${lineIdx}`} y1={center} y2={center} {...{ stroke, strokeWidth }} {...lineCoords} />
                )
            }))}
            {/* Whiskers */}
            {showWhiskers?[
                { y1: center-halfWidth, y2: center+halfWidth, x1: min, x2: min },
                { y1: center-halfWidth, y2: center+halfWidth, x1: max, x2: max }].map(((lineCoords, lineIdx) => {
                return (
                    <line key={`whiskerBox-${lineIdx}`} {...{ stroke, strokeWidth }} {...lineCoords} />
                )
                })) : null}
            {/* Median Line Gets a 1.2 strokewidth by default*/}
            <line x1={median} x2={median} y1={center-halfWidth} y2={center+halfWidth} {...{ stroke, strokeWidth : strokeWidth * 1.2 }}/>
        </g>
    )
}


function areEqual(prevProps, nextProps) {
    /*
    return true if passing nextProps to render would return
    the same result as passing prevProps to render,
    otherwise return false
    */
    const prevPropsSum = prevProps.center + prevProps.q25 + prevProps.q75 + prevProps.width + prevProps.min + prevProps.max + prevProps.median
    const nextPropsSum = prevProps.center + nextProps.q25 + nextProps.q75 + nextProps.width + nextProps.min + nextProps.max + nextProps.median
    
    if (prevPropsSum !== nextPropsSum) return false 
    if (prevProps.opacity!== nextProps.opacity) return false
    if (prevProps.fill !== nextProps.fill) return false
    if (prevProps.showWhiskers!== nextProps.showWhiskers) return false
    return true

  }
  
  export default React.memo(VerticalBox, areEqual);