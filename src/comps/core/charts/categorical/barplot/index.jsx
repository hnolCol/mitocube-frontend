import { Group } from "@visx/group"
import MultiCategoricalChart from "../multiple"
import { Text } from "@visx/text"
import Bar from "../../barplot/Bar"
import { AxisBottom, AxisLeft } from "@visx/axis"
import { ChartLegend } from "../../legend"
import _ from "lodash"
import { getAxisStrokeColor, getColorPalette } from "../../../colors/colorPalette"
import { getNumberTicks } from "../../../../../services/plotting/ticks"
import ErrorBar from "../../error"
import SingleCategoricalChart from "../single"
import AxisBackground from "../../background"
import AxisWithBackground from "../../axis"
import SubplotName from "../../annotations/subplotName"


function getNamesFromCategories({ categoricalNames, data, labels = ["colorName","splitName","subplotName"] }) {

    const checkedNames = categoricalNames.filter(catName => _.has(data[0], catName))
    return Object.fromEntries(checkedNames.map((checkedName,idx) => [labels[idx],checkedName]))
}

function CategoricalBarplot({
    width = 400,
    height = 300,
    data = [
    
        { y: 5, T: "A", G: "WT", O : "0.5h", e : 0.2},
        { y: 4, T: "B", G: "WT", O : "0.5h", e : 0.4 },
        { y: 10, T: "C", G: "WT", O: "0.5h", e : 1.2 },
        { y: 5, T: "A", G: "WT", O : "0.5h", e : 0.2 },
        { y: 4, T: "B", G: "WT", O : "0.5h", e : 0.2 },
        { y: 10, T: "C", G: "WT", O : "0.5h", e : 0.2 },
        { y: 5, T: "A", G: "KO", O : "0.5h", e : 0.2 },
        { y: 40, T: "B", G: "KO", O : "0.5h", e : 0.2 },
        { y: -20, T: "C", G: "KO", O : "0.5h", e : 0.2 },
        { y: 5, T: "A", G: "WT", O : "10h", e : 3.2 },
        { y: 4, T: "B", G: "WT", O : "10h", e : 0.2 },
        { y: 2, T: "C", G: "WT", O : "10h", e : 0.2 },
        { y: 5, T: "A", G: "KO", O : "10h", e : 0.8 },
        { y: 4, T: "B", G: "KO", O : "10h", e : 0.2 },
        { y: 2, T: "C", G: "KO", O : "10h", e : 6.2 }
    ],
    
    margins = {
        left: 30,
        right: 5,
        bottom: 35,
        top: 5
    },
    yaxisName = "y",
    categoricalNames = ["O","T","G"],
    errorName = "e",
    colorPalette = [],
    innerSubplotPadding = 0.05,
    outerSubplotPadding = 0.1,
    innerSplitPadding = 0.2,
    innerColorPadding = 0.0,
    svgID = undefined}) {
    
    const { colorName, splitName, subplotName } = getNamesFromCategories({categoricalNames,data})
    
    const uniqueColorValuesFromData = _.uniqBy(data, colorName)
    const colorValues =  colorPalette.length === 0 ? getColorPalette(uniqueColorValuesFromData.length) : colorPalette.length === uniqueColorValuesFromData.length ? colorPalette : getColorPalette(uniqueColorValuesFromData.length)
    const legendColors = Object.fromEntries(uniqueColorValuesFromData.map((d, idx) => [d[colorName], colorValues[idx]]))

    return (
        <div className="flex flex-column">
            <ChartLegend groupings={{ [colorName]: legendColors }} title={colorName} />
            {colorName && splitName === undefined ?
                <SingleCategoricalChart
                {...{data,
                    width,
                    height,
                    svgID,
                    margins,
                    yaxisName,
                    colorName,
                    colorPalette : legendColors
                    }}>
                    {(categoricalData) => categoricalData.map(({
                        idx,
                        colorCategories,
                        data,
                        yaxisName,
                        colorName,
                        margins,
                        splitColorScale,
                        colorScale,
                        yScale,
                        chartHeight,
                        chartWidth,
                        colorBandwidth,
                    }, didx) => {

                        return (
                            <g key={`singleCat-bar-${idx}`}>
                                <AxisWithBackground
                                    margins={margins}
                                    leftScale={yScale}
                                    bottomScale={splitColorScale}
                                    bottomLabel={colorName}
                                    leftLabel={yaxisName}
                                    {...{ chartHeight, chartWidth }} />
                                
                                {colorCategories.map(colorCategory => {
                                    const xBar = splitColorScale(colorCategory)
                                    const color = colorScale(colorCategory)
                                    const dataForColorCategory = data.filter(d => d[colorName] === colorCategory)[0]
                                    const yValue = dataForColorCategory[yaxisName]
                                    const yBar = yScale(yValue)
                                    return (
                                        <Group key={`bar-error-${colorCategory}`} left={margins.left}>
                                            <Bar x={xBar} y1={yBar} y0={yScale(0)} fill={color} width={colorBandwidth} />
                                            {/* add the error bar if any errorName (key for object in dat) is given */}
                                            {errorName !== undefined &&  _.isNumber(data[errorName])?
                                                <ErrorBar
                                                    x={xBar + colorBandwidth / 2}
                                                    y0={yBar} //bar start 
                                                    y1={yValue > 0 ? yScale(yValue + dataForColorCategory[errorName]) : yScale(yValue - dataForColorCategory[errorName])}
                                                    width={colorBandwidth*0.5} /> : null}
                                    </Group>
                                    )
                                })}
                            </g>
                        )
                })}

                </SingleCategoricalChart>:null}
            
            
        {colorName && splitName ?
            <MultiCategoricalChart
                {...{
                    data,
                    width,
                    height,
                    svgID,
                    margins,
                    yaxisName,
                    colorName,
                    splitName,
                    subplotName,
                    innerColorPadding,
                    innerSplitPadding,
                    innerSubplotPadding,
                    outerSubplotPadding,
                    colorPalette : legendColors
                }}>
            {(categoricalData) => categoricalData.map((
                {
                    yaxisName,
                    splitName,
                    colorName,
                    subplotCategory,
                    splitCategories,
                    subplotScale,
                    splitScale,
                    splitColorScale,
                    colorScale,
                    yScale,
                    subplotData,
                    chartHeight, chartWidth,
                    colorBandwidth,
                    margins,
                    xcenter,
                    subplotCategoryFound,
                    splitCategoryFound}, didx) => {
                    
                  const subplotStart = subplotScale(subplotCategory)
          
                  return(
                        <g key={`${subplotCategory}-subplot`}>
                        
                          
                          <AxisWithBackground
                                leftLeft={subplotStart}
                                topBottom={margins.top + chartHeight}
                                margins={margins}
                                leftScale={yScale}
                                bottomScale={splitScale}
                                leftTickLabelProps={{ opacity: didx === 0 ? 1 : 0 }}
                                bottomLabel={categoricalData.length === 1?splitName:""}
                                leftLabel={didx === 0 ? yaxisName : ""}
                                {...{ chartHeight, chartWidth :  subplotScale.bandwidth()}} />
                        
                          {subplotCategoryFound ?
                              <Text x={xcenter}
                                  y={margins.top + 10}
                                  verticalAnchor="middle"
                                  textAnchor="middle">{subplotCategory}</Text> : null}
                          <Text
                            x={margins.left + chartWidth / 2 }
                            y={margins.top + chartHeight + 20}
                            verticalAnchor="start"
                            textAnchor="middle">{splitName}</Text>
                           
                        {splitCategories.map((splitCategory, splitIdx) => {
                        
                        const splitCatData = subplotData.filter(m => m[splitName] === splitCategory)
                        const splitStart = splitScale(splitCategory)
                        return (
                            <Group left={subplotStart + splitStart} key={`${splitCategory}-${splitIdx}`}>
                            {splitCatData.map((colorCatData, colorIdx) => {
                                const colorCategory = colorCatData[colorName]
                                const color = colorScale(colorCategory)
                                const yValue = colorCatData[yaxisName]
                                const xBar = splitColorScale(colorCategory)
                                const yBar = yScale(yValue)
                                return (
                                <Group key={`${colorIdx}-${subplotCategory}-${colorCategory}`}>
                                        <Bar x={xBar} y1={yBar} y0={yScale(0)} fill={color} width={colorBandwidth} />
                                        {/* add the error bar if any errorName (key for object in dat) is given */}
                                        {errorName !== undefined &&  _.isNumber(colorCatData[errorName])?
                                            <ErrorBar
                                                x={xBar + colorBandwidth / 2}
                                                y0={yBar} //bar start 
                                                y1={yValue > 0 ? yScale(yValue + colorCatData[errorName]) : yScale(yValue - colorCatData[errorName])}
                                                width={colorBandwidth*0.5} /> : null}
                                    </Group>
                                )
                                })}
                            </Group>
                        )
                        })}
                    </g>)})}
                </MultiCategoricalChart>:null}
            </div>
    )
}



export default CategoricalBarplot