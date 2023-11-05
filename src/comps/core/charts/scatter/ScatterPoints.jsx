import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
ScatterPoints.propTypes = {
    data : PropTypes.array.isRequired,
    valid : PropTypes.arrayOf(PropTypes.bool).isRequired, // boolean
    xaxisName : PropTypes.string.isRequired,
    yaxisName : PropTypes.string.isRequired,
    xScale : PropTypes.func.isRequired,
    yScale : PropTypes.func.isRequired,
    rerenderDependency : PropTypes.array.isRequired
}


function ScatterPoints({data = [], valid = [], xaxisName, yaxisName, sizeName, xScale, yScale, sizeScale, fill = "#efefef", stroke = "#000000", strokeWidth = 0.5,  rerenderDependency = []}){
    // Scatter points that have a rerenderDependcy and are only rerendered if the dependency changes
    // Hence, it requires to be checked outside if the scatter point should rerender 

    return(
        <g>

            {data.filter((d,idx) => valid[idx]).map((d,idx) => {
                //filter data first and then map over it 
                return <circle 
                    cx={xScale(d[xaxisName])} 
                    cy={yScale(d[yaxisName])} 
                    r={sizeScale(d[sizeName])} 
                    {...{fill,stroke,strokeWidth}}/>
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
    if (_.some(prevProps.rerenderDependency, (value,idx) => nextProps.rerenderDependency[idx] !== value)) return false 
    return true
  }
  export default React.memo(ScatterPoints, areEqual);