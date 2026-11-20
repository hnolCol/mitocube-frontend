
import PropTypes from "prop-types"

CompareDashboardIcon.propTypes = {
    fillColor: PropTypes.string,
    strokeWidth: PropTypes.number,
    width: PropTypes.number
}

/**
 * @description Dashboard icon for the compare section: two horizontal arrows
 * pointing in opposite directions (top arrow right, bottom arrow left).
 */
function CompareDashboardIcon({
    fillColor = "#466688",
    strokeWidth = 3,
    width = 50 }) {

    const margin = width * 0.16
    const headLength = width * 0.24
    const headHeight = width * 0.16
    const topY = width * 0.32
    const bottomY = width * 0.68

    return (
        <g>
            <line x1={margin} y1={topY} x2={width - margin - headLength} y2={topY} stroke={fillColor} strokeWidth={strokeWidth} strokeLinecap="round" />
            <polygon
                points={`${width - margin},${topY} ${width - margin - headLength},${topY - headHeight} ${width - margin - headLength},${topY + headHeight}`}
                fill={fillColor} />
            <line x1={width - margin} y1={bottomY} x2={margin + headLength} y2={bottomY} stroke={fillColor} strokeWidth={strokeWidth} strokeLinecap="round" />
            <polygon
                points={`${margin},${bottomY} ${margin + headLength},${bottomY - headHeight} ${margin + headLength},${bottomY + headHeight}`}
                fill={fillColor} />
        </g>
    )
}

export default CompareDashboardIcon
