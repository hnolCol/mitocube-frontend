import PropTypes from "prop-types"
import _ from "lodash"
import { getUniqueValuesInArrayOfObjects } from "../../../../services/arrays/unique"
import { useMemo } from "react"
import { scaleLinear, scaleOrdinal } from "@visx/scale"
import { getColorPalette, getRedBlueColorScale } from "../../colors/colorPalette"
import { SVG } from "../SVGHeader"
import { getQuantiles } from "../../../../services/statistics/quantiles"
import { Text } from "@visx/text"
import HeatmapRow from "./Row"

Heatmap.propTypes = {
    width : PropTypes.number,
    data: PropTypes.arrayOf(PropTypes.object),
    valueNames: PropTypes.arrayOf(PropTypes.string),
    clusterName: PropTypes.string,
    colorNames: PropTypes.arrayOf(PropTypes.string), // columns that are plotted next to the right of the value 
    binHeight : PropTypes.number
}

function Heatmap({
    data = [{v : 2, v1 : 4, B : "+", C : "-"},{v : 2, v1 : 4, B : "+", C : "-"},{v : 2, v1 : 4, B : "+", C : "-"},{v : -2, v1 : 2, B : "-", C : "+"}, {v : 0, v1 : 1.2, B : "-", C : "+"}],
    valueNames = ["v","v1"],
    clusterName = "c",
    colorNames = ["B", "C"],
    labelNames = ["B"],
    binHeight = 15
}) {
    //updates only on datalength. can be dangerous
    const uniqueColorValues = useMemo(() => colorNames.length > 0 ? getUniqueValuesInArrayOfObjects({data, keyName : colorNames}) : [], [_.join(colorNames),data.length])
    const uniqueClusterValues = useMemo(() => getUniqueValuesInArrayOfObjects({ data, clusterName }), [clusterName])
    const heatmapValues = useMemo(() => _.map(data, d => _.map(valueNames, valueName => d[valueName])), [_.join(valueNames),data.length])
    const minMax = useMemo(() => getQuantiles(_.flatten(heatmapValues), [0, 1], 1.5, false, "valueRange", ["min", "max"]).valueRange, [heatmapValues])
    const labels = useMemo(() => { return labelNames.length > 0?_.map(data, d => _.join(_.map(labelNames, labelName => d[labelName])," | ")) : undefined}, [_.join(labelNames)])
    const labelsExist = _.isArray(labels)
    const colorValuesExist = uniqueColorValues.length > 0
    const numberRows = data.length
    const heatmapSVGHeight = numberRows * binHeight
    const heatmapSVGWidth = valueNames.length * binHeight + colorNames.length * binHeight + 300

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
        if (uniqueColorValues.length === 0) return () => "#fafafa"
        var colorPalette = getColorPalette(uniqueColorValues.length)
        const idx = uniqueColorValues.indexOf("-")
        colorPalette[idx] = "#fafafa"
        return scaleOrdinal({
            domain: uniqueColorValues,
            range: colorPalette,
        })
    }, [uniqueColorValues])

    //
    return (
        
        <div style={{overflowY:"scroll",maxHeight:"70vh"}}>
            {/* The actual heatmap with values */}
            <SVG {...{width : heatmapSVGWidth, height : heatmapSVGHeight}}>
                {_.range(numberRows).map(rowNumber => {
                    var rowValues = heatmapValues[rowNumber]
                    var y = rowNumber * binHeight
                    var xValuesEnd = rowValues.length * binHeight
                    var marginBetweenValuesAndColors = colorValuesExist ? binHeight : 0
                    var marginBetweenValuesAndLabels = colorValuesExist ? colorNames.length * binHeight + marginBetweenValuesAndColors : marginBetweenValuesAndColors 
                    var labelString = labelsExist ? labels[rowNumber] : undefined
                    return (
                        <HeatmapRow {...{
                            key: `${rowNumber}-${labelString}`,
                            data : data[rowNumber],
                            valueNames,
                            y,
                            binHeight,
                            valueScale,
                            xValuesEnd,
                            extraColorScale,
                            marginBetweenValuesAndColors,
                            marginBetweenValuesAndLabels,
                            colorValuesExist,
                            colorNames,
                            labelsExist,
                            labelString
                        }} />
                    )
                })}
                


            </SVG>

        </div>
    )
}

export default Heatmap