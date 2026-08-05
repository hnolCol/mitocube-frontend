import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"

const isValidNumber = value => Number.isFinite(value)

function buildPolylineSegments(d, yaxisName, xScale, yScale, halfBandWidth) {
    const segments = []
    let current = []

    yaxisName.forEach(yName => {
        const x = xScale(yName)
        const y = yScale(d[yName])

        const valid = isValidNumber(x) && isValidNumber(y)

        if (valid) {
            current.push(`${x + halfBandWidth},${y}`)
        } else {
            if (current.length > 1) {
                segments.push(current.join(", "))
            }
            current = []
        }
    })

    if (current.length > 1) {
        segments.push(current.join(", "))
    }

    return segments
}
ProfileLine.propTypes = {
    data : PropTypes.array.isRequired,
    valid : PropTypes.arrayOf(PropTypes.bool).isRequired, // boolean
    xaxisName : PropTypes.string.isRequired,
    yaxisName : PropTypes.arrayOf(PropTypes.string).isRequired,
    xScale : PropTypes.func.isRequired,
    yScale : PropTypes.func.isRequired,
    rerenderDependency : PropTypes.array.isRequired
}


function ProfileLine({
    data = [], 
    valid = [], 
    xaxisName, 
    yaxisName,
    xScale, 
    yScale, 
    fill = "none",
    stroke = "#000000", 
    strokeWidth = 2, 
    rerenderDependency = [], 
    showPoints = true,
}) {
    const halfBandWidth = xScale.bandwidth() / 2
    return(
        <g>
            {data.map((d, idx) => {
                const segments = buildPolylineSegments(
                    d,
                    yaxisName,
                    xScale,
                    yScale,
                    halfBandWidth
                )

                return (
                    <g key={`${idx}-profile-line`}>
                        {segments.map((points, i) => (
                            <polyline
                                key={`${idx}-segment-${i}`}
                                points={points}
                                {...{ stroke, strokeWidth, fill }}
                            />
                        ))}

                        {showPoints &&
                            _.map(yaxisName, yName => {
                                const x = xScale(yName)
                                const y = yScale(d[yName])

                                if (!Number.isFinite(x) || !Number.isFinite(y)) {
                                    return null
                                }

                                return (
                                    <circle
                                        key={`${yName}-${idx}-profile-point`}
                                        cx={x + halfBandWidth}
                                        cy={y}
                                        r={5}
                                        fill="#fff"
                                        stroke={stroke}
                                    />
                                )
                            })}
        </g>
    )
})}



        </g>
    )
}

function areEqual(prevProps, nextProps) {
    /*
    return true if passing nextProps to render would return
    the same result as passing prevProps to render,
    otherwise return false
    */
    if (!_.isArray(prevProps.rerenderDependency)) return false
    if (prevProps.rerenderDependency.length !== nextProps.rerenderDependency.length) return false 
    if (_.some(prevProps.rerenderDependency, (value, idx) => nextProps.rerenderDependency[idx] !== value)) return false 

    return true
  }
  export default React.memo(ProfileLine, areEqual);