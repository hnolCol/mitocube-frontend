import { Text } from "@visx/text";
import { SVG } from "../SVG";
import _ from "lodash"



export function ChartLegend({
    width = 400,
    height = 50,
    svgID = undefined,
    horizontalMarginBetween = 10,
    verticalMarginBetween = 2,
    groupings = { "Treatment": { "Ctrl": "#efefef", "DMSO": "#89223d" }, "Genotype": { "WT": "#efefef", "KO": "#89223d", "KO2": "#29243d" }},
    title = "Legend Title",
    elementType = "rect",
    hightlightElement = undefined,
    selectedElements = {groupingName : "Genotype", elementNames : ["WT","KO"]},
    onMouseOverCallback = undefined,
    onSelectCallback = undefined}) {

    const groupingNames = Object.keys(groupings)
    const numberGroupings = groupingNames.length 
    const rowHeight = (height - (verticalMarginBetween*(numberGroupings+1))) / (numberGroupings+1) //+1 for title 
    const fontSize = rowHeight * 0.70
    const highlightActivate = _.isObject(hightlightElement) && groupingNames.includes(hightlightElement.groupingName)
    const selectionActivate = _.isObject(selectedElements) && groupingNames.includes(selectedElements.groupingName)
    
    return (

        <SVG {...{ width, height, svgID }}>
            <LegendLabel s={title} x={horizontalMarginBetween} y={rowHeight/2} textAnchor="start" fontSize={fontSize}/>
            {groupingNames.map((groupingName, groupingIndex) => {

                let elementNames = Object.keys(groupings[groupingName])
                let numberElements = elementNames.length
                let legendElementWidth = (width - horizontalMarginBetween * numberElements) / numberElements
                let groupingHeight = rowHeight * (groupingIndex + 1) + verticalMarginBetween * groupingIndex
                let highlightGrouping = highlightActivate && hightlightElement.groupingName === groupingName
                let selectedGrouping = selectionActivate && selectedElements.groupingName === groupingName 

                return (
                    elementNames.map((elementName, elemntIndex) => {
                        let elementx = elemntIndex * (legendElementWidth + horizontalMarginBetween) + horizontalMarginBetween
                        let markerFill = groupings[groupingName][elementName]
                        //check if legend group opacity should be modified in order to highlight mouseover. 
                        let legendGroupOpacity = !highlightActivate? 1 :highlightActivate && !highlightGrouping ? 0.2 : highlightActivate && highlightGrouping && hightlightElement.elementName !==elementName?0.2 : 1
                        let legendElementSelected = selectedGrouping && selectedElements.elementNames.includes(elementName)
                        if (legendElementWidth - horizontalMarginBetween * 2 - 25 < 0) return null
                        return (
                            <g
                                key={`${elementName}-${elemntIndex}`}
                                onMouseEnter={_.isFunction(onMouseOverCallback) ? () => onMouseOverCallback(groupingName, elementName) : undefined}
                                onMouseUp={_.isFunction(onSelectCallback)?() => onSelectCallback(groupingName, elementName):undefined}
                                opacity={legendGroupOpacity}>
                                <rect
                                        x={elementx - horizontalMarginBetween/2}
                                        y={groupingHeight}
                                        height={rowHeight}
                                        width={legendElementWidth - horizontalMarginBetween/2}
                                        fill={legendElementSelected?"#efefef":"none"}/>
                                    
                                    <LegendMarker
                                        x={elementx}
                                        y={groupingHeight}
                                        elementType={elementType}
                                        fill={markerFill}
                                        height={rowHeight} />
                                    <LegendLabel
                                        x={elementx + 25}
                                        y={groupingHeight + rowHeight / 2}
                                        s={elementName}
                                        fill={legendElementSelected?"#466688":"black"}
                                        fontSize={fontSize}
                                        width={(legendElementWidth - horizontalMarginBetween * 2 - 25) * 0.85} />
                                </g>
                            )
                        })
            )
            })}
        </SVG>
    )
}



function LegendMarker({x, y, width = 20, height = 20, circleRadius = 8, elementType = "rect", fill = "#efefef", stroke = "black", strokeWidth = 0.5}) {

    switch (elementType) {
        case "rect":
            const rectMarginTop = (height - height*0.7) / 2
            return <rect {...{ x, y : y + rectMarginTop, width, height : height - 2*rectMarginTop, fill, stroke, strokeWidth }} />
        case "circle":
            return <circle {...{
                cx: x + circleRadius,
                cy: y + height/2,
                r: circleRadius,
                fill, stroke, strokeWidth
            }} />
    }
}

function LegendLabel({
        //legend label
        x,
        y,
        s = "Label1",
        verticalAnchor = "middle",
        textAnchor = "start",
        fill = "black",
        fontSize = 12,
        width = undefined,
        fontSizeAdjust = "true",
        scaleToFit = "shrink-only" }) {
    
    return (
        <Text {...{ x, y, verticalAnchor, textAnchor, fill, fontSize, width, fontSizeAdjust, scaleToFit }}>
            {s}
        </Text>)
}