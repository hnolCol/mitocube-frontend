import PropTypes, { array } from "prop-types"
import _ from "lodash"
import React from "react"
import { LinePath } from "@visx/shape"
import Bar from "../barplot/Bar"
import { getStandardDeviationAndAverage } from "../../../../services/statistics/average"
import { getAverageAndErrorForKeysInArrayOfObject } from "../../../../services/arrays/groupby"
import ErrorBar from "../error"

ProfileBars.propTypes = {
    data : PropTypes.array.isRequired,
    valid : PropTypes.arrayOf(PropTypes.bool).isRequired, // boolean
    xaxisName : PropTypes.string.isRequired,
    yaxisName : PropTypes.arrayOf(PropTypes.string).isRequired,
    xScale : PropTypes.func.isRequired,
    yScale : PropTypes.func.isRequired,
    rerenderDependency : PropTypes.array.isRequired
}


function ProfileBars({
    data = [], 
    valid = [], 
    xaxisName, 
    yaxisName,
    sizeName,
    colorName, 
    xScale, 
    yScale, 
    sizeScale, 
    colorScale, 
    fill = "none",
    stroke = "#000000", 
    strokeWidth = 1.5, 
    rerenderDependency = [], 
    searchIndices = new Set() ,
    filterIndices =  new Set()}){
    // Scatter points that have a rerenderDependcy and are only rerendered if the dependency changes
    // Hence, it requires to be checked outside if the scatter point should rerender 
    const filterByIdx = filterIndices.size !== 0
    const oapcityBySearch = searchIndices.size !== 0

    if (data.length === 0) return null 
    const dataMerged = getAverageAndErrorForKeysInArrayOfObject(data, yaxisName)
    return(
        <g>
            {_.map(yaxisName, yaxisName => {
                const { [yaxisName]: mean, e: errorValue } = dataMerged[yaxisName]
                const barWidth = xScale.bandwidth()
                const barX = xScale(yaxisName)
                if (!_.isNumber(mean)) return null 
                return <g>
                    <Bar x={barX} y0={yScale(0)} width={barWidth} y1={yScale(mean)} />
                    {_.isNumber(errorValue) ? <ErrorBar
                        x={barX+barWidth/2}
                        y0={yScale(mean)} //bar start 
                        y1={mean > 0 ? yScale(mean + errorValue) : yScale(mean - errorValue)}
                        width={barWidth*0.5} /> : null}
                </g>
            })}
            

            {/* {data.filter((d,idx) => valid[idx]).map((d,idx) => {
                //filter data first and then map over it 
                if (filterByIdx && !filterIndices.has(idx)) return null 
                
                return <circle 
                    //dont use opacity, very very slow on safari 
                    key={`${idx}-${d[xaxisName]}`}
                    cx={xScale(d[xaxisName])} 
                    cy={yScale(d[yaxisName])} 
                    r={sizeScale(d[sizeName])} 
                    fillOpacity={oapcityBySearch?searchIndices.has(idx)?1.0:0.2:1.0}
                    strokeOpacity={oapcityBySearch?searchIndices.has(idx)?1.0:0.2:1.0}
                    {...{fill : colorName===undefined?fill:colorScale(d[colorName]),
                        stroke,strokeWidth}}/>
            })} */}

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
  export default React.memo(ProfileBars, areEqual);