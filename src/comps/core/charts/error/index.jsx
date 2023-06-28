import { getAxisStrokeColor } from "../../colors/colorPalette"
import _ from "lodash"


function ErrorBar({x = 20, y0 = 20, y1 = 5, width = 5, cap=true, stroke,  ...rest}) {
    const halfWidth = width / 2 
    const strokeColor = stroke===undefined?getAxisStrokeColor():stroke
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