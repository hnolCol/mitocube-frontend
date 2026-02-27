import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
import { Text } from "@visx/text"

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
    sizeName,
    colorName, 
    labelNames = [],
    xScale, 
    yScale, 
    sizeScale, 
    colorScale, 
    fill = "none",
    stroke = "#000000", 
    strokeWidth = 2, 
    rerenderDependency = [], 
    searchIndices = new Set() ,
    filterIndices = new Set(),
    showPoints = true}) {

    const halfBandWidth = xScale.bandwidth() / 2
    return(
        <g>
            {data.map((d, idx) => <g key={`${idx}-profile-line`}>
                <polyline
                    points={_.join(_.map(yaxisName, yName => `${xScale(yName)+halfBandWidth},${yScale(d[yName])}`), ", ")}
                    {...{ stroke, strokeWidth, fill }} />
                {showPoints ? _.map(yaxisName, yName => <circle {...{
                    cx: xScale(yName) + halfBandWidth,
                    cy: yScale(d[yName]),
                    r: 5,
                    fill: "#fff",
                    stroke
                }} />) : null
                }
                {labelNames.length > 0 && yaxisName.length > 0 ?
                    <Text
                        x={xScale(yaxisName.at(-1))}
                        y={yScale(yScale.domain().at(-1))}
                        dy={-8}
                        textAnchor="end"
                        verticalAnchor="middle">
                        {_.join(_.map(labelNames, labelName => d[labelName]), ", ")}
                    </Text> : null}
            </g>)}



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
    if (_.some(prevProps.rerenderDependency, (value,idx) => nextProps.rerenderDependency[idx] !== value)) return false 
    return true
  }
  export default React.memo(ProfileLine, areEqual);