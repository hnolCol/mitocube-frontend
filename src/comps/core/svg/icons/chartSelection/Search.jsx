/**
 * @description Magnifier icon glyph. Circle plus handle, used by the search icon.
 * @param {Number} props.width - The SVG width in pixels.
 * @param {Number} props.height - The SVG height in pixels.
 * @param {String} props.strokeColor - The hex color of the circle outline and handle.
 */
export function SearchSVG({ width, height, strokeColor}) {
    
    const circleX = width / 3
    const circleY = height / 3
    const marginY = height / 4.5 
   
    return (
        <g>
            <line x1={circleX} x2={circleX+width/2} y1={circleY} y2={circleY+height/2} stroke={strokeColor} strokeWidth={2}/>
            <circle cx={circleX} cy={circleY} r = {width/3.5} fill="white" stroke={strokeColor} />
        </g>
    )
}
