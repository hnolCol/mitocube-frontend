/**
 * @description Magnifier icon glyph. Circle plus handle, used by the search icon.
 * @param {Number} props.width - The SVG width in pixels.
 * @param {Number} props.height - The SVG height in pixels.
 * @param {String} props.strokeColor - The hex color of the circle outline and handle.
 */
export function SearchSVG({ width, height, strokeColor}) {
    
    const circleX = width * 0.38
    const circleY = height * 0.38
    const circleR = width / 4.2
   
    return (
        <g>
            <line x1={circleX + circleR * 0.72} x2={width - width * 0.08} y1={circleY + circleR * 0.72} y2={height - height * 0.08} stroke={strokeColor} strokeWidth={2}/>
            <circle cx={circleX} cy={circleY} r = {circleR} fill="white" stroke={strokeColor} />
        </g>
    )
}
