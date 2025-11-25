import { Group } from "@visx/group"
import _ from "lodash"
import ErrorBar from "../../error"
import { areAllValuesNumbers } from "../../../../../services/arrays/checks"


function CircleWithError({ cx, cy, yValue, errorValue, yScale, fill, left, handleMouseOver, getTooltipData, hideTooltip, pointRadius, dataArray }) {
    
    if (!areAllValuesNumbers([cx,cy,yValue])) return 
    return (
        <Group left={left}
                onMouseEnter={e => handleMouseOver(e, getTooltipData(yValue, errorValue, dataArray))}
                onMouseLeave={hideTooltip}>
            {_.isNumber(errorValue) && !_.isNaN(errorValue) && errorValue !== 0?
            <g>
                <ErrorBar x={cx} y0={cy} y1={yScale(yValue + errorValue)} stroke={fill} cap={false} /> 
                <ErrorBar x={cx} y0={cy} y1={yScale(yValue - errorValue)} stroke={fill}  cap={false} /> 
                </g> :
            null}
            
            <circle cx={cx} cy={cy} r={pointRadius} fill={fill} />
    
    </Group>
    )
}


export default CircleWithError