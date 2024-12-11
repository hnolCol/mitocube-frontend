import PropType from 'prop-types'
import { areAllValuesNumbers } from "../../../../services/arrays/checks"
import { getAxisStrokeColor } from "../../colors/colorPalette"
import _ from "lodash"
import { isPropHexColorString } from '../../types/checks/color'

/**
 * @description Plots an error bar with optional caps (horizontal lines). 
 * @param {Object} props
 * @param {Number} props.x The x coordinate in pixel 
 * @param {Number} props.y0 The low error boundary 
 * @param {Number} props.y1 The high boundary error in pixels 
 * @param {String} props.stroke Color *must* be in hex code. 
 * @param {Number} props.width The width of the error cap. Defaults to 0 (no cap).  
 * @param {Boolean} props.cap If a cap should be added to the error. 
 * @returns 
 */
function ErrorBar({ x, y0, y1, width, cap, stroke, ...rest }) {
    
    if (!areAllValuesNumbers([x,y0,y1])) return null 
    return (
        
        <g>
            {/* error vertical line */}

            <line
                x1={x}
                x2={x}
                y1={y0}
                y2={y1}
                stroke={stroke}
                {...rest} />
            
            {/* cap line */}

            {cap && _.isNumber(width)?
                <line
                    x1={x - width / 2 }
                    x2={x + width / 2 }
                    y1={y1}
                    y2={y1}
                    stroke={stroke}
                    {...rest} /> : null}
        </g>
    )
}


ErrorBar.defaultProps = {
    cap: true,
    stroke: getAxisStrokeColor(),
    width: 0
}

ErrorBar.propTypes = {
    x: PropType.number.isRequired,
    y0: PropType.number.isRequired,
    y1: PropType.number.isRequired,
    width: PropType.number,
    cap: PropType.bool,
    stroke: isPropHexColorString
}

export default ErrorBar