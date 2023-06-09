

import { Button } from "@blueprintjs/core"
import _ from "lodash"
import { useMemo, useState } from "react"
import { addItemToArrayOrRemoveItIfPresent } from "../../../../services/arrays/transforms"
import { Combobox } from "../../input/Combobox"
import { getDomainWithBoundaries } from "../../../../services/arrays/boundaries"
import { scaleLinear, scaleOrdinal } from "@visx/scale"
import { getColorPalette } from "../../colors/colorPalette"

function CollapsableAxes({
    data,
    subplotName,
    sizeName,
    sizeRange = [3, 10],
    colorName,
    rowHeight = 50,
    subplotDefaultWidth = 200,
    subplotBasicWidth = 70,
    collapsedWidth = 50,
    subplotScalesItems = true,
    widthPerItem = 25,
    children
}) {

    const [collapsed, setCollapsed] = useState([])
    const subplotCategories = useMemo(() => _.uniqBy(data, subplotName).map(d => d[subplotName]), [subplotName, data])
    const subplotCategoriesCounts = _.countBy(data, subplotName)
    const subplotData = useMemo(() => Object.fromEntries(_.map(subplotCategories, subplotCategory => { return([subplotCategory,_.filter(data,(d) => d[subplotName] === subplotCategory)])})),[subplotCategories])
    const uniqueColorValues = useMemo(() => colorName === undefined? [] : _.uniqBy(data, colorName).map(d => d[colorName]), [colorName, data])
    // calculate width per subplot based on the number of items.
    const subplotWidth = subplotScalesItems ?
        Object.fromEntries(subplotCategories.map(subplotCategory => [subplotCategory, subplotBasicWidth + subplotCategoriesCounts[subplotCategory] * widthPerItem]))
        : subplotDefaultWidth

    const toggleCollapse = (subplotIdx) => {
        //toggle collapse 
        setCollapsed(addItemToArrayOrRemoveItIfPresent({array:collapsed,item : subplotIdx}))
    }

    const sizeScale = useMemo(() => {
        if (sizeName === undefined) return 
        
        const sizeDomain = getDomainWithBoundaries({data, keyName : sizeName})
        return scaleLinear({
            domain: [sizeDomain.min, sizeDomain.max],
            range: sizeRange,
            nice: true
        })
    },[sizeName])

    const colorScale = useMemo(() => {
  
        if (colorName === undefined) return 
        if (uniqueColorValues.length === 0) return () => "#000000"
        return (
            scaleOrdinal({
                domain: uniqueColorValues, 
                range : getColorPalette(uniqueColorValues.length)
            })
        )
    },[uniqueColorValues, colorName])

    
    const collapsableAxes = subplotCategories.map((subplotCategory, subplotIdx) => {

        const divIsCollapsed = collapsed.includes(subplotIdx)
        var width = divIsCollapsed ? collapsedWidth :  _.isNumber(subplotWidth) ?  subplotWidth : _.isObject( subplotWidth) ?  subplotWidth[subplotCategory] : subplotDefaultWidth
        
        return {
            width,
            height: rowHeight,
            divIsCollapsed,
            toggleCollapse,
            subplotIdx,
            subplotName,
            subplotCategory,
            subplotCategories,
            subplotCategoriesCounts,
            subplotData: subplotData[subplotCategory],
            sizeScale,
            colorScale

        }
    })
            
    return (
        <div>
            <div className="flex flex--wrap center-items">
                {subplotCategories.map((subplotCategory, subplotIdx) =>
                    <div key={`${subplotCategory}-${subplotIdx}`}>
                        <Button text={subplotCategory} onClick={() => toggleCollapse(subplotIdx)} />
                    </div>)}
               
            </div>
        <div className="flex flex--wrap" style={{backgroundColor : "white", maxWidth:"80vw"}} >


            {children ? <>{children(collapsableAxes)}</> : null}
        

            </div>
        </div>

    )
}


export default CollapsableAxes