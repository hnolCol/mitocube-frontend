import { ProfileChart } from "./ProfileChart";
import _ from "lodash"

export function MultiProfiles({chartIdx,
    width = 320,
    height = 240,
    margins = {
        left: 45,
        top: 5,
        right: 45,
        bottom: 40
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
    
    return (<div className="flex flex--wrap">
        {_.keys(subsetIndices, subsetKey => <ProfileChart {...{
            key: `${subsetKey}-profile-chart`,
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
            subsetIndices: subsetIndices[subsetKey], // subset the data to only plot those chartIdx / indices
            searchIndices,
            hoverIndices
        }}
        />)}
        
    </div>)
    }