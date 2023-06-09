import Row from "./Row"
import PropTypes from 'prop-types';


RowWrapper.propTypes = {
    data: PropTypes.array,
    svgID: PropTypes.string,
    height: PropTypes.number,
    numberExpressionColumns : PropTypes.number,
    numberColumns : PropTypes.number,
    binSize: PropTypes.number,
    colorScale : PropTypes.func
}

export const RowWrapper = ({data,numberExpressionColumns,numberColumns,svgID, height, colorScale, binSize = 40}) => {

    return (
        <svg 
                width = {numberColumns*binSize+150} 
                id = {svgID} 
                height = {height}
                viewBox = {`0 0 ${numberColumns*binSize+150} ${height}`}>
            <g>
                {/* onMouseLeave = {() => handleHighlightedItems(undefined)} */}
                    
                    {
                        data.map((rowData,index) => {  
                            return (
                            
                                <Row
                                    key={`${index}-rowID`}
                                    size = {binSize}
                                    data = {rowData}
                                    index={index}
                                    N={numberExpressionColumns}
                                    label={"Gene 1"}
                                    colorScale={colorScale}
                                    // nColumns = {nColumns}
                                    // nExtraColumns = {nExtraColumns}
                                    // clusterColors={clusterColors}
                                    // focusView={focusView}
                                    // handleHighlightedItems = {handleHighlightedItems}
                                    // colorScale = {colorScale}
                                    // opacity = {!itemHighlighted?1:itemHighlighted&&rowData[nColumns] === highlightedItem?1:0.2}
                                    />
                            )
                        
                    })
                
                }
                </g>

            </svg>
    )
}