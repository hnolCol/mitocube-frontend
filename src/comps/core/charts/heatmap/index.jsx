import PropTypes from "prop-types"
import _ from "lodash"
import { getUniqueValuesInArrayOfObjects } from "../../../../services/arrays/unique"
import { useMemo } from "react"
import { scaleLinear, scaleOrdinal } from "@visx/scale"
import { getColorPalette, getRedBlueColorScale } from "../../colors/colorPalette"
import { SVG } from "../SVGHeader"
import { getQuantiles } from "../../../../services/statistics/quantiles"
import { Text } from "@visx/text"


Heatmap.propTypes = {
    width : PropTypes.number,
    data: PropTypes.arrayOf(PropTypes.object),
    valueNames: PropTypes.arrayOf(PropTypes.string),
    clusterName: PropTypes.string,
    colorNames: PropTypes.arrayOf(PropTypes.string), // columns that are plotted next to the right of the value 
    binHeight : PropTypes.number
}


function Rect({x,y,width,height,fill,stroke = "#000000", strokeWidth = 0.5, opacity = 1}) {
    return (
        <rect 
            {...{x,y,width,height,stroke,fill,strokeWidth,opacity}}/>
    )
}


function RowLabel({ x, y, text, dx = 5, fontSize = 12, verticalAnchor = "middle", textAnchor = "start"}) {
    return (
        <Text {...{x,y,dx,textAnchor, verticalAnchor, fontSize}}>{text}</Text>
    )
}



function Heatmap({
    width = 500,
    data = [{v : 2, v1 : 4, B : "+", C : "-"},{v : 2, v1 : 4, B : "+", C : "-"},{v : 2, v1 : 4, B : "+", C : "-"},{v : -2, v1 : 2, B : "-", C : "+"}, {v : 0, v1 : 1.2, B : "-", C : "+"}],
    valueNames = ["v","v1"],
    clusterName = "c",
    colorNames = ["B", "C"],
    labelNames = ["B"],
    binHeight = 30,
    
}) {

    const uniqueColorValues = useMemo(() => colorNames.length > 0 ? getUniqueValuesInArrayOfObjects({data, keyName : colorNames}) : [], [colorNames, data])
    const uniqueClusterValues = useMemo(() => getUniqueValuesInArrayOfObjects({ data, clusterName }), [clusterName, data])
    const heatmapValues = useMemo(() => _.map(data, d => _.map(valueNames, valueName => d[valueName])), [data, valueNames])
    const minMax = useMemo(() => getQuantiles(_.flatten(heatmapValues), [0, 1], 1.5, false, "valueRange", ["min", "max"]).valueRange, [heatmapValues])
    const labels = useMemo(() => { return labelNames.length > 0?_.map(data, d => _.join(_.map(labelNames, labelName => d[labelName])," | ")) : undefined}, [labelNames])
    const labelsExist = _.isArray(labels)
    const colorValuesExist = uniqueColorValues.length > 0
    const numberRows = data.length
    const heatmapSVGHeight = numberRows * binHeight
    const heatmapSVGWidth = valueNames.length * binHeight + colorNames * binHeight + binHeight


    //value scale 
    const valueScale = useMemo(() => {
        return scaleLinear({
            domain: [minMax[0],0,minMax[1]],
            range : getRedBlueColorScale()
    })},[minMax,heatmapValues])

    //color that indicates different clusters 
    const clusterColorScale = useMemo(() => {
        if (uniqueClusterValues.length === 0) return () => "#fafafa"

        return scaleOrdinal({
            domain: uniqueClusterValues,
            range : getColorPalette(uniqueClusterValues.length)
        })
    })

    //color that indicates extra values (plotted next to the value heatmap) 
    const extraColorScale = useMemo(() => {
        if (uniqueColorValues.length === 0) return ( ) => "#fafafa"
        return scaleOrdinal({
            domain: uniqueColorValues,
            range: getColorPalette(uniqueColorValues.length),
        })
    }, [uniqueColorValues])

    //
    return (
        
        <div>
            {/* The actual heatmap with values */}
            <SVG {...{width, height : heatmapSVGHeight}}>
                {_.range(numberRows).map(rowNumber => {
                    var rowValues = heatmapValues[rowNumber]
                    var y = rowNumber * binHeight
                    var xValuesEnd = rowValues.length * binHeight
                    var marginBetweenValuesAndColors = colorValuesExist ? binHeight : 0
                    var marginBetweenValuesAndLabels = colorValuesExist ?  colorNames.length * binHeight  + marginBetweenValuesAndColors : marginBetweenValuesAndColors 
                    return (
                        <g>
                            {rowValues.map((value, valueIdx) =>
                                <Rect
                                    x={valueIdx * binHeight}
                                    y={y}
                                    width={binHeight}
                                    height={binHeight}
                                    fill={value===undefined ? "#fafafa" : valueScale(value)}
                                />)}
                            {colorValuesExist ?
                                colorNames.map((colorName, colorIdx) => {
                                    return (
                                        <Rect
                                            x={xValuesEnd + marginBetweenValuesAndColors + colorIdx * binHeight}
                                            width={binHeight}
                                            height={binHeight}
                                            y={y}
                                            fill = {extraColorScale(data[rowNumber][colorName])} />)
                                })
                            : null}
                            {labelsExist ?
                                <RowLabel
                                    x={xValuesEnd + marginBetweenValuesAndLabels}
                                    fontSize={binHeight/2}
                                    y={y + binHeight / 2} text={labels[rowNumber]} /> : null}
                        </g>
                    )
                })}
                


            </SVG>

        </div>
    )
}

export default Heatmap