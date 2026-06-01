import { useMemo } from "react";
import { ProfileChart } from "./ProfileChart";
import _ from "lodash"
import { getUniqueValuesInArrayOfObjects } from "../../../../services/arrays/unique";
import { scaleOrdinal } from "@visx/scale";
import { getColorPalette } from "@mitocube/viz/src/colors/palette";

export function MultiProfiles({chartIdx,
    width = 220,
    height = 180,
    margins = {
        left: 25,
        top: 5,
        right: 5,
        bottom: 5
    },
    data,
    valid,
    yaxisName = [],
    xaxisName,
    labelNames = [],
    yaxisLabel,
    xaxisLabel,
    limits,
    svgID,
    rerenderHover,
    rerenderBackground,
    hoverData,
    colorName, //likely the cluster indice
    profileAsLine = true,
    profileAsBar = false,
    subsetIndices = {}, // subset the data to only plot those chartIdx / indices
    searchIndices = new Set(),
    hoverIndices = new Set(),
    mergeHoverWithSearch = true
}) {

    const uniqueColorValues = useMemo(() => getUniqueValuesInArrayOfObjects({ data, keyName : colorName }).filter(v => v!==undefined), [colorName])
    /** 
    * @description The colorScale for the individual clusters. 
    */
   const colorScale = useMemo(() => {
       
       if (uniqueColorValues.length === 0) return () => "#000"
       
       return scaleOrdinal({
           domain: uniqueColorValues,
           range : getColorPalette(uniqueColorValues.length)
       })
   }, [colorName])
    
    return (<div style={{display:"grid", gridAutoColumns:"min-content", gridTemplateColumns:"1fr 1fr"}}>
    {/* //className="flex flex-column flex--wrap div--expand" style={{flexFlow:"column row", maxHeight:"90vh", overflowY : "scroll", alignContent : "flex-start"}} */}
        {_.keys(subsetIndices).map(subsetKey => <ProfileChart {...{
            key: `${subsetKey}-profile-chart`,
            chartIdx : subsetKey,
            width,
            height,
            margins,
            data,
            valid,
            stroke : colorScale(subsetKey),
            yaxisName,
            xaxisName,
            labelNames,
            yaxisLabel,
            xaxisLabel,
            limits,
            svgID,
            rerenderHover,
            rerenderBackground,
            hoverData,
            profileAsLine,
            profileAsBar,
            subsetIndices: new Set(subsetIndices[subsetKey]), // subset the data to only plot those chartIdx / indices
            searchIndices,
            hoverIndices,
            mergeHoverWithSearch
        }}
        />)}
        
    </div>)
    }