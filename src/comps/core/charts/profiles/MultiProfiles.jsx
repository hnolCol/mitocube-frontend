import { ProfileChart } from "./ProfileChart";
import _ from "lodash"

export function MultiProfiles({chartIdx,
    width = 220,
    height = 180,
    margins = {
        left: 45,
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
    profileAsLine = true,
    profileAsBar = false,
    subsetIndices = {}, // subset the data to only plot those chartIdx / indices
    searchIndices = new Set(),
    hoverIndices = new Set()}) {
    
    return (<div className="flex flex-column flex--wrap" style={{flexFlow:"column wrap", maxHeight:"90vh", width : "33vw"}}>
        {_.keys(subsetIndices).map(subsetKey => <ProfileChart {...{
            key: `${subsetKey}-profile-chart`,
            chartIdx : subsetKey,
            width,
            height,
            margins,
            data,
            valid,
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
            hoverIndices
        }}
        />)}
        
    </div>)
    }