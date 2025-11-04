
import { useMemo } from "react"
import PropTypes from "prop-types"
import _ from "lodash"

AIChatIcon.propTypes = {
    numberColumns: PropTypes.number,
    margin: PropTypes.number,
    betweenMargin: PropTypes.number,
    strokeWidth: PropTypes.number,
    fillColor: PropTypes.string,
    width: PropTypes.number
}

function AIChatIcon({
    numberColumns = 6,
    margin = 5,
    betweenMargin = 1,
    strokeWidth = 0.2,
    fillColor = "#466688",
    width = 50
}) {
   
    // chat bubble layout inside the square canvas
    const canvasSize = width
    const bubbleWidth = canvasSize * 0.64
    const bubbleHeight = canvasSize * 0.46
    const bubbleX = (canvasSize - bubbleWidth) / 2
    const bubbleY = (canvasSize - bubbleHeight) / 2
    const bubbleRx = Math.max(2, bubbleWidth * 0.08)


    // three dots positions (centered in bubble)
    const dotRadius = Math.max(1.2, bubbleHeight * 0.08)
    const dotsCenterY = bubbleY + bubbleHeight * 0.48
    const dotsStartX = bubbleX + bubbleWidth * 0.34
    const dotGap = bubbleWidth * 0.14

    return (
        <g>
            {/* chat bubble (foreground) */}
            <g>
                <rect
                    x={bubbleX}
                    y={bubbleY}
                    width={bubbleWidth}
                    height={bubbleHeight}
                    rx={bubbleRx}
                    ry={bubbleRx}
                    fill="#ffffff"
                    stroke={fillColor}
                    strokeWidth={strokeWidth}
                    vectorEffect="non-scaling-stroke"
                />
                {/* tail */}
                
                {/* three dots */}
                <circle cx={dotsStartX} cy={dotsCenterY} r={dotRadius} fill={fillColor} />
                <circle cx={dotsStartX + dotGap} cy={dotsCenterY} r={dotRadius} fill={fillColor} />
                <circle cx={dotsStartX + dotGap * 2} cy={dotsCenterY} r={dotRadius} fill={fillColor} />
            </g>
        </g>
    )
}


export default AIChatIcon