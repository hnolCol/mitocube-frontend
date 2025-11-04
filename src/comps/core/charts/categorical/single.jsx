import { useMemo } from "react"
import { SVG } from "../SVGHeader"
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale"
import { getColorPalette } from "../../colors/colorPalette"
import _ from "lodash"
import { addMarginToBoundaries, getBoundariesFromArrayOfObjects } from "../../../../services/arrays/boundaries"
import PropTypes from "prop-types"
import { getChartWidthAndHeightWithMargins } from "../../../../services/plotting/size"


SingleCategoricalChart.propTypes = {
    width: PropTypes.number, 
    height: PropTypes.number, 
    data: PropTypes.arrayOf(PropTypes.object),
    margins: PropTypes.object,
    yaxisName: PropTypes.string, 
    colorName: PropTypes.string, 
    splitName: PropTypes.string, 
    subplotName: PropTypes.string, 
    svgID : PropTypes.string
}

function SingleCategoricalChart({
    width = 600,
    height = 300,
    data = [
    
        { y: 5, T: "A", G: "WT", O : "0.5h" },
        { y: 4, T: "B", G: "WT", O : "0.5h" },
        { y: 10, T: "C", G: "WT", O: "0.5h" }
    ],
    
    margins = {
        left: 15,
        right: 5,
        bottom: 30,
        top: 5
    },
    yaxisName = "y",
    colorName = "Treatment",
    innerColorPadding = 0.1,
    outerColorPadding = 0.2,
    svgID = undefined,
    svgRef =undefined,
    colorPalette = [],
    minMaxYDomain = undefined,
    yScaleStartsAtZero = true,
    children
}) {
    const {chartHeight,chartWidth} = getChartWidthAndHeightWithMargins({width,height,margins})
    const uniqueColorValues = _.uniqBy(data, colorName).map(d => d[colorName])
    console.log("uniqueColorValues", uniqueColorValues,"IN SINGLE CAT CHART", colorName, data)
    const splitColorScale = useMemo(() => {
        // color scale taking care of the position of the color (e.g horizontal)
        return (
            scaleBand({
                range: [0, chartWidth],
                domain: uniqueColorValues,
                paddingOuter: outerColorPadding,
                paddingInner: innerColorPadding,
                round: true,
            })
        )
    }, [chartWidth, colorName])

    const colorScale = useMemo(() => {
        // scale taking care of the fill color.
        
        if (colorName === undefined) return () => undefined //return a function that color the by in the default color if no colorName given
        
        var colorRange = []
        if (colorPalette.length === 0){
            colorRange = getColorPalette(uniqueColorValues.length)
        }
        else if (_.isArray(colorPalette)) {
            //check if colorPalette is same length? 
            colorRange = colorPalette.slice()
        }
        else if (_.isObject(colorPalette)) {
            // if an object is provided each colorValue must be in the color Palette
            if (uniqueColorValues.filter(uniqueColorValue => !_.has(colorPalette, uniqueColorValue)).length !== 0) {
                colorRange  = getColorPalette(uniqueColorValues.length)
            }
            else {
                colorRange = uniqueColorValues.map(uniqueColorValue => colorPalette[uniqueColorValue])
            }
        }
        else {
            colorRange = getColorPalette(uniqueColorValues.length)
        }

        return (
            scaleOrdinal({
                domain: uniqueColorValues, 
                range : colorRange
            })
        )
    }, [colorName, uniqueColorValues])

    const yScale = useMemo(() => {
        // y scale 
        const preDefinedYDomain = minMaxYDomain!==undefined && _.isObject(minMaxYDomain) && _.has(minMaxYDomain,"min") && _.has(minMaxYDomain,"max")
        const yDomain = preDefinedYDomain ? {} : getBoundariesFromArrayOfObjects({ data, keyName: yaxisName })
        const yDomainWithMargin = preDefinedYDomain ? minMaxYDomain : addMarginToBoundaries({ domain: yDomain })
        
        return scaleLinear(
            {
                domain: [yDomainWithMargin.max, yDomainWithMargin.min < 0 ? yDomainWithMargin.min : yScaleStartsAtZero  ? 0 : yDomainWithMargin.min],
                range: [margins.top, margins.top + chartHeight],
                nice: true
            }
        )
    }, [yaxisName, chartHeight, minMaxYDomain,yScaleStartsAtZero])
    
    //_.range(1) since we should return an array (e.g. subplots) to be consistent with the MultipleCategory chart, 
    //for a single category only a single subplot is required
    const categoricalSplit = _.range(1).map(subplotIdx => {
        return {
            idx: subplotIdx,
            colorCategories : uniqueColorValues,
            data,
            yaxisName,
            colorName,
            margins,
            splitColorScale,
            colorScale,
            yScale,
            chartHeight,
            chartWidth,
            colorBandwidth : splitColorScale.bandwidth(),
            xcenter: margins.left + chartWidth/2,
        }
    })

    return (
        
        <SVG {...{width,height,svgID,svgRef}}>
            <>{children(categoricalSplit)}</>
            
        </SVG>

    )   
}
    

export default SingleCategoricalChart