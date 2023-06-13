

import _ from "lodash"
import { useMemo, useState } from "react"
import MultiCategoricalChart from "../../../core/charts/categorical/multiple"
import GroupingSelection from "../../../core/base/groupings/selection"
import { getAverageAndErrorByGroups, getQuantilesByGroups } from "../../../../services/arrays/groupby"
import CategoricalBarplot from "../../../core/charts/categorical/barplot"

const splitNames = ["colorName", "xaxisName", "subplotName"]



function ResultChart({
    data = [{ "y": 5, Genotype: "KO" }, { "y": 4, Genotype: "KO" }, { "y": 5, Genotype: "WT" }, { "y": 8, Genotype: "WT" }],
    yaxisName = "y",
    groupings = { Genotype: { KO: ["KO_01", "KO_02"], WT: ["WT1", "WT2"] } }
}) {
    const [plotType, setPlotType] = useState("barplot")
    const groupingNames = useMemo(() => Object.keys(groupings), [groupings])
    const numberGroupings = groupingNames.length 
    //const initCategoricalSelection = useMemo(()=>Object.fromEntries(_.map(splitNames,(splitName,idx) => [splitName,groupingNames[idx]]).filter(d => d[1] !== undefined)),[groupingNames])
    const [selectedGroupings, setSelectedGroupings] = useState({colorName : groupingNames[0], xaxisName : groupingNames[1], subplotName : groupingNames[2]})
    const keyNamesForSplitting = Object.values(selectedGroupings).filter(v => v !== undefined)

    const chartData = useMemo(() => {
        
        if (plotType === "boxplot") {
            return getQuantilesByGroups(
                data,
                keyNamesForSplitting,
                [0, 0.25, 0.5, 0.75, 1],
                yaxisName,
                yaxisName)
        }
        else if (plotType === "barplot") {
            return getAverageAndErrorByGroups(data, keyNamesForSplitting, yaxisName)
        }
    }, [plotType, yaxisName, keyNamesForSplitting, data])
    
    console.log(chartData)

    return (

        <div>
            <GroupingSelection
                groupings={groupings}
                keyNames={["colorName", "xaxisName", "subplotName"].slice(0, numberGroupings)}
                selectedItems={selectedGroupings} />
            

            <CategoricalBarplot {...{data : chartData,errorName:"e",yaxisName,categoricalNames:keyNamesForSplitting}}/>

            {/* <MultiCategoricalChart>


            </MultiCategoricalChart> */}








        </div>

    )
}

export default ResultChart