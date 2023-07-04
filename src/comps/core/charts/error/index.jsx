import { areAllValuesNumbers } from "../../../../services/arrays/checks"
import { getAxisStrokeColor } from "../../colors/colorPalette"
import _ from "lodash"


function ErrorBar({x, y0, y1, width = 0, cap=true, stroke,  ...rest}) {
    const halfWidth = width / 2 
    const strokeColor = stroke === undefined ? getAxisStrokeColor() : stroke
    
    if (!areAllValuesNumbers([x,y0,y1,width])) return null 
    return (
        
        <g>
            {/* error vertical line */}
            <line x1={x} x2={x} y1={y0} y2={y1} stroke={strokeColor} {...rest} />
            {/* cap line */}
            {cap ? <line x1={x - halfWidth} x2={x + halfWidth} y1={y1} y2={y1} stroke={strokeColor}{...rest} /> : null}
        </g>
    )
}


export default ErrorBar