

import _ from "lodash"
import { useMemo, useState } from "react"
import MultiCategoricalChart from "../../../core/charts/categorical/multiple"
import GroupingSelection from "../../../core/base/groupings/selection"
import { getAverageAndErrorByGroups, getQuantilesByGroups, normalizeDataToGroup } from "../../../../services/arrays/groupby"
import CategoricalBarplot from "../../../core/charts/categorical/barplot"
import { SVGHeader } from "../../../core/charts/SVGHeader"


function ResultChart({
    data = [{ "y": 5, Genotype: "KO", Treatment : "DMSO", Time : "20min"}, { "y": 4, Genotype: "KO" ,Treatment : "DMSO", Time : "20min" }, { "y": 8, Genotype: "WT" ,Treatment : "DMSO", Time : "20min" }, { "y": 5, Genotype: "WT" ,Treatment : "DMSO", Time : "20min" }, { "y": 12, Genotype: "WT"  ,Treatment : "DMSO", Time : "15min" }, { "y": 8, Genotype: "WT"  ,Treatment : "DMSO", Time : "15min" }, { "y": 5, Genotype: "KO",  Treatment : "Treat", Time : "15min"  }, { "y": 4, Genotype: "KO", Treatment : "Treat" , Time : "20min"  }, { "y": 5, Genotype: "WT" , Treatment : "Treat" , Time : "15min" }, { "y": 8, Genotype: "WT", Treatment : "Treat", Time : "20min" }],
    yaxisName = "y",
    groupings = { Genotype: { KO: ["KO_01", "KO_02"], WT: ["WT1", "WT2"] }, Treatment  : { DMSO : [], Treat : []}, Time : {"20min" : [], "15min" : []}}
}) {
    const [plotType, setPlotType] = useState("barplot")
    const [normalization, setNormalization] = useState("rasw")

    const groupingNames = useMemo(() => Object.keys(groupings), [groupings])
    const numberGroupings = groupingNames.length 
    const [selectedGroupings, setSelectedGroupings] = useState({colorName : groupingNames[0], splitName : groupingNames[1], subplotName : groupingNames[2]})
    const keyNamesForSplitting = Object.values(selectedGroupings).filter(v => v !== undefined && _.has(data[0],v))

    const normalizedData = normalization==="raw"?[]:normalizeDataToGroup(data, keyNamesForSplitting, {Genotype : "WT", Time : "20min", Treatment : "DMSO"}, yaxisName,false,"div")
    const showNormalizedData = normalizedData.length > 0 && normalization !== "raw"
    
    const { groupedAggratedData, minMaxYDomain } = useMemo(() => {
        const chartData = showNormalizedData ? normalizedData : data
        if (plotType === "boxplot") {
            return getQuantilesByGroups(
                chartData,
                keyNamesForSplitting,
                [0, 0.25, 0.5, 0.75, 1],
                yaxisName,
                yaxisName)
        }
        else if (plotType === "barplot") {

            return getAverageAndErrorByGroups(chartData, keyNamesForSplitting, yaxisName)
        }
    }, [plotType, yaxisName, keyNamesForSplitting, data, normalization])

    const getPlot = (plotType, groupedAggratedData) => { 
        if (keyNamesForSplitting.length === 0) return <div>Please select grouping names ...</div>
        if (plotType === "barplot") {
            return <CategoricalBarplot {...{
                ...selectedGroupings,
                data: groupedAggratedData,
                errorName: "e",
                yaxisName,
                //categoricalNames: keyNamesForSplitting,
                minMaxYDomain,
                tooltipNames: _.concat(["N"], keyNamesForSplitting)
            }} />
        }
        else if (plotType === "boxplot") {
            return <div>Boxplot</div>
        }
    }

    return (

        <div>
            <GroupingSelection
                groupings={groupings}
                keyNames={["colorName", "splitName", "subplotName"].slice(0, numberGroupings)}
                handleSelection={(name,value) => setSelectedGroupings(prevValues => { return { ...prevValues, [name] : _.has(data[0],value)?value:undefined}})}
                selectedItems={selectedGroupings} />
            

            {<SVGHeader chartData={showNormalizedData ? { "Raw Data": data, "Aggregated Data" : groupedAggratedData, "Normalized Data" : normalizedData} :{ "Raw Data": data, "Aggregated Data" : groupedAggratedData}} />}
            {getPlot(plotType,groupedAggratedData)}

            {/* <MultiCategoricalChart>


            </MultiCategoricalChart> */}








        </div>

    )
}

export default ResultChart