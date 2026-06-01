

import { Button } from "@blueprintjs/core"
import _ from "lodash"
import { useMemo, useState } from "react"
import { addItemToArrayOrRemoveItIfPresent } from "../../../../services/arrays/transforms"
import { Combobox } from "../../input/Combobox"
import { getDomainWithBoundaries } from "../../../../services/arrays/boundaries"
import { scaleLinear, scaleOrdinal } from "@visx/scale"
import { getColorPalette } from "@mitocube/viz/src/colors/palette";
import { getCumSumFromArray } from "../../../../services/arrays/cumsum"

function CollapsableAxes({
    data,
    width = 1000,
    margins = { left: 10, right: 20 },
    focusOnToggle = true,
    subplotName,
    sizeName,
    sizeRange = [3, 10],
    colorName,
    marginBetweenSubplots = 3,
    innerScaleMargin = 7,
    subplotDefaultWidth = 200,
    collapsedWidth = 40,
    highlightMatches = {},
    highlightSpecificPoints = false,
    
    defaultSize = 5,
    children
}) {

    const [collapsed, setCollapsed] = useState([])
    const subplotCategories = useMemo(() => _.uniqBy(data, subplotName).map(d => d[subplotName]), [subplotName, data])
    const joinedSubplotCategories = _.join(subplotCategories)
    const subplotCategoriesCounts = _.countBy(data, subplotName)
    const subplotData = useMemo(() => Object.fromEntries(_.map(subplotCategories, subplotCategory => { return ([subplotCategory, _.filter(data, (d) => d[subplotName] === subplotCategory)]) })), [joinedSubplotCategories])
    const hightightKeys = Object.keys(highlightMatches)
    const highlightMatchsActivte = hightightKeys.length > 0 

    // calulcate an array that returns true if an highlight object value includes string ()
    const subplotDataHighlight = useMemo(() => Object.fromEntries(_.map(subplotCategories, subplotCategory => {
        return ([subplotCategory, subplotData[subplotCategory].map(d => {
            if (!highlightSpecificPoints) return false 
            if(!highlightMatchsActivte) return false
            return _.every(hightightKeys.map(highlightKey => _.isString(d[highlightKey]) && d[highlightKey].includes(highlightMatches[highlightKey])))
        })])
    })), [joinedSubplotCategories, _.join(Object.keys(highlightMatches)),_.join(Object.values(highlightMatches)), highlightSpecificPoints, highlightMatchsActivte])
    
    // get unique color values
    const uniqueColorValues = useMemo(() => colorName === undefined ? [] : _.uniqBy(data, colorName).map(d => d[colorName]), [colorName, data])
    const subplotColors = getColorPalette(subplotCategories.length)
    const collapsedCategory = Object.fromEntries(subplotCategories.map((subplotCategory, subplotIdx) => [subplotCategory, collapsed.includes(subplotIdx)]))
    // calculate width per subplot based on the number of items.
    const withForDataPoints = useMemo(
        () => width - margins.left - (marginBetweenSubplots * subplotCategories.length * 2) - margins.right - subplotCategories.length * collapsedWidth,//_.sum(Object.values(collapsedCategory)) * collapsedWidth,
        [_.sum(Object.values(collapsedCategory)), margins.right, width, subplotCategories.length, margins.left, collapsedWidth])
    
    // approximate the width per single datapoint
    const widthPerDataPoint = withForDataPoints / _.sum(subplotCategories.map((subplotCategory,subplotIdx) => collapsedCategory[subplotCategory]?0: subplotData[subplotCategory].length))
    //calculate the width of a subplot (note that the margins are subtracted later)
    const subplotWidth = 
        Object.fromEntries(subplotCategories.map((subplotCategory,subplotIdx) => [subplotCategory, collapsedCategory[subplotCategory] ? collapsedWidth : collapsedWidth + subplotCategoriesCounts[subplotCategory] * widthPerDataPoint]))
        
    const cumSum = getCumSumFromArray(Object.values(subplotWidth))
    const toggleCollapse = (subplotIdx) => {
        //toggle collapse 
        if (focusOnToggle) {//close all but clicked one
            if (collapsed.length === subplotCategories.length - 1 && !collapsed.includes(subplotIdx)) {
                setCollapsed([])
                return
            }
            setCollapsed(_.range(subplotCategories.length).filter(i => i !== subplotIdx))
        } 
        else {
            setCollapsed(addItemToArrayOrRemoveItIfPresent({array:collapsed,item : subplotIdx}))
        }
        
    }

    const sizeScale = useMemo(() => {
        if (sizeName === undefined) return () => defaultSize
        
        const sizeDomain = getDomainWithBoundaries({data, keyName : sizeName})
        return scaleLinear({
            domain: [sizeDomain.min, sizeDomain.max],
            range: sizeRange,
            nice: true
        })
    },[sizeName])

    const colorScale = useMemo(() => {
  
        if (colorName === undefined) () => "#000000"
        if (uniqueColorValues.length === 0) return () => "#000000"
        return (
            scaleOrdinal({
                domain: uniqueColorValues, 
                range : getColorPalette(uniqueColorValues.length)
            })
        )
    },[uniqueColorValues, colorName])

    
    const collapsableAxes = subplotCategories.map((subplotCategory, subplotIdx) => {

        const divIsCollapsed = collapsedCategory[subplotCategory]
        var width = divIsCollapsed ? collapsedWidth : _.isNumber(subplotWidth) ? subplotWidth : _.isObject(subplotWidth) ? subplotWidth[subplotCategory] : subplotDefaultWidth
        const startWidth = subplotIdx > 0 ? cumSum[subplotIdx - 1] : marginBetweenSubplots
        const subpData = subplotData[subplotCategory]
        
        const xScale = scaleLinear({
            range: [startWidth + marginBetweenSubplots + innerScaleMargin, startWidth + width - 2 * marginBetweenSubplots - 2*innerScaleMargin],
            domain: [-0.5, subpData.length - 0.5]
        })
        return {
            width : width - 2*marginBetweenSubplots,
            divIsCollapsed,
            toggleCollapse,
            subplotIdx,
            subplotName,
            subplotCategory,
            subplotCategories,
            subplotCategoriesCounts,
            subplotData: subpData,
            sizeScale,
            colorScale,
            xScale,
            subplotColor: subplotColors[subplotIdx],
            highlightDataPoint : subplotDataHighlight[subplotCategory],
            startWidth

        }
    })
            
    return (

        <g>
            {children ? <>{children(collapsableAxes)}</> : null}
        </g>

    )
}


export default CollapsableAxes