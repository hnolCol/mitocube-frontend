import { useMemo } from "react"
import { SVG } from "../SVGHeader"
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale"
import { getColorPalette } from "../../colors/colorPalette"
import _ from "lodash"
import { addMarginToBoundaries, getBoundariesFromArrayOfObjects } from "../../../../services/arrays/boundaries"
import PropTypes from "prop-types"
import { getChartWidthAndHeightWithMargins } from "../../../../services/plotting/size"


MultiCategoricalChart.propTypes = {
    width: PropTypes.number, 
    height: PropTypes.number, 
    data: PropTypes.arrayOf(PropTypes.object),
    margins: PropTypes.object,
    yaxisName: PropTypes.string, 
    errorName : PropTypes.string,
    colorName: PropTypes.string, 
    splitName: PropTypes.string, 
    subplotName: PropTypes.string, 
    svgID: PropTypes.string,
    innerSubplotPadding: PropTypes.number,
    outerSubplotPadding : PropTypes.number,
    innerSplitPadding : PropTypes.number,
    innerColorPadding: PropTypes.number,
    colorPalette : PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.string),
        PropTypes.object])
}

function MultiCategoricalChart({
    width = 600,
    height = 300,
    data = [
    
        { y: 5, T: "A", G: "WT", O : "0.5h" },
        { y: 4, T: "B", G: "WT", O : "0.5h" },
        { y: 10, T: "C", G: "WT", O: "0.5h" },
        { y: 5, T: "A", G: "WT2", O : "0.5h" },
        { y: 4, T: "B", G: "WT2", O : "0.5h" },
        { y: 10, T: "C", G: "WT2", O : "0.5h" },
        { y: 5, T: "A", G: "KO", O : "0.5h" },
        { y: 40, T: "B", G: "KO", O : "0.5h" },
        { y: -20, T: "C", G: "KO", O : "0.5h" },
        { y: 5, T: "A", G: "WT", O : "10h" },
        { y: 4, T: "B", G: "WT", O : "10h" },
        { y: 2, T: "C", G: "WT", O : "10h" },
        { y: 5, T: "A", G: "KO", O : "10h" },
        { y: 4, T: "B", G: "KO", O : "10h" },
        { y: 2, T: "C", G: "KO", O : "10h" }
    ],
    
    margins = {
        left: 15,
        right: 5,
        bottom: 30,
        top: 5
    },
    yaxisName = "y",
    colorName,
    splitName, 
    subplotName,
    innerSubplotPadding = 0.05,
    outerSubplotPadding = 0.05,
    innerSplitPadding = 0.1,
    innerColorPadding = 0.0,
    svgID = undefined,
    svgRef = undefined,
    colorPalette = [],
    minMaxYDomain = undefined,
    yScaleStartsAtZero = true,
    children
}) {
    
    const {chartHeight,chartWidth} = getChartWidthAndHeightWithMargins({width,height,margins})
    const colorCategoryFound = _.has(data[0], colorName)
    const subplotCategoryFound = _.has(data[0], subplotName)
    const splitCategoryFound = _.has(data[0], splitName)
    const subplotCategories =subplotCategoryFound?_.uniqBy(data, subplotName).map(d => d[subplotName]):[""]
    const uniqueColorValues = _.uniqBy(data, colorName).map(d => d[colorName])
    const splitCategories = splitCategoryFound?_.uniqBy(data, splitName).map(d => d[splitName]):[]
    
    const subplotScale = useMemo(() => {
        //scale for the subplot
        return (
            scaleBand({
                range: [margins.left, margins.left + chartWidth],
                domain : subplotCategories,
                paddingOuter: 0,
                paddingInner: innerSubplotPadding,
                round: true,
            })
        )
    }, [chartWidth, splitName, subplotName, margins.left])


    const splitScale = useMemo(() => {
        // split scale (distance on x axis - affects the x-axis)
        return (
            scaleBand({
                range: [0, subplotScale.bandwidth()],
                domain: splitCategories,
                paddingOuter: outerSubplotPadding,
                paddingInner: innerSplitPadding,
                round: true,
            })
        )
    }, [subplotScale, splitName])
    

    const splitColorScale = useMemo(() => {
        // color scale taking care of the position of the color (e.g horizontal)
        return (
            scaleBand({
                range: [0, splitCategoryFound ? splitScale.bandwidth() : subplotCategoryFound ? subplotScale.bandwidth() : chartWidth],
                domain: uniqueColorValues,
                paddingOuter: 0.15,
                paddingInner: innerColorPadding,
                round: true,
            })
        )
    }, [splitScale, splitName, colorName, splitCategoryFound])

    const colorScale = useMemo(() => {
        // scale taking care of the fill color.
        if (!colorCategoryFound) return () => getColorPalette(1)[0] //return a function that color the by in the default color if no colorName given
        
        var colorRange = []
        if (colorPalette === undefined){
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

    const categoricalSplit = subplotCategories.map((cat, idx) => {
        return {
            chartHeight,
            chartWidth,
            idx,
            yaxisName,
            splitName,
            colorName,
            subplotName,
            margins,
            yScale,
            splitCategories,
            splitScale,
            subplotScale,
            subplotCategory : cat,
            splitColorScale,
            colorScale,
            subplotData: subplotCategoryFound?_.filter(data, (d) => d[subplotName] === cat):data,
            colorCategoryFound,
            colorCategories : colorCategoryFound ? colorScale.domain() : [],
            subplotCategoryFound,
            splitCategoryFound, 
            bandwidth: subplotScale.bandwidth(),
            colorBandwidth : splitColorScale.bandwidth(),
            xcenter: subplotScale(cat) + subplotScale.bandwidth() / 2,
            
        }
    })

    return (
        
        <SVG {...{width,height,svgID,svgRef}}>
            <>{children(categoricalSplit)}</>
            </SVG>
       
    )   
}
    

export default MultiCategoricalChart