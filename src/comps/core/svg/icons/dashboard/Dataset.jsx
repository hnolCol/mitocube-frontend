
import { useMemo } from "react"
import PropTypes from "prop-types"
import _ from "lodash"

DatasetDashboardIcon.propTypes = {
    numberColumns: PropTypes.number,
    margin: PropTypes.number,
    betweenMargin: PropTypes.number,
    strokeWidth: PropTypes.number,
    fillColor: PropTypes.string,
    width : PropTypes.number
}


function DatasetDashboardIcon({
        numberColumns = 6,
        margin = 5,
        betweenMargin = 1,
        strokeWidth = 0.2,
        fillColor = "#466688",
        width = 50 }) {
    
    const columnWidth = (width - margin * 2 - betweenMargin * numberColumns) / (numberColumns)
    const numberRows = numberColumns 
    const constOpacities = useMemo(() => {
        //get list of lists of random opacities.
        return _.range(numberRows).map(() => _.range(numberColumns).map(() => _.random(0.1, 1, true)))
    },
        [numberColumns, numberRows])

    return (
    <g>
            {_.range(numberRows).map(rowIdx => {
                return (_.range(numberColumns).map(colIdx => {
                    return (
                        <rect
                            key={`mrow-${colIdx}-${rowIdx}`}
                            x={margin + colIdx * (betweenMargin + columnWidth)}
                            y={margin + rowIdx * (columnWidth+betweenMargin)}
                            stroke="white"
                            opacity={constOpacities[rowIdx][colIdx]}
                            width={columnWidth}
                            height={columnWidth}
                            fill={fillColor}
                            strokeWidth={strokeWidth} />
                    )
                }))})}

    </g>
    )
}


export default DatasetDashboardIcon