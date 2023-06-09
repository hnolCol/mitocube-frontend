import PropTypes from "prop-types"
import Point from "./Point"



ScatterPlot.propTypes = {

    points : PropTypes.arrayOf(Object),
    defaultRadius : PropTypes.number
}


export function ScatterPlot({ points = [], defaultRadius = 5}) {
    // Plots an array of points. Each item in the array 
    // must be an object including the following keys: x, y, r 
    return (
        <g>
            {points.map((p, pIdx) => <Point r={defaultRadius} {...p}/>)}
        </g>

    )
}