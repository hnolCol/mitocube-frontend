

import _ from "lodash"
import { useMemo, useState } from "react"
import { Combobox } from "../../../core/input/Combobox"

const splitNames = ["colorName", "xaxisName", "subplotName"]


function ResultChart({
    data = [{"y" : 5, Genotype : "KO"},{"y" : 4, Genotype : "KO"}, {"y" : 5, Genotype : "WT"}, {"y" : 8, Genotype : "WT"}],
    groupings = {Genotype : {KO : ["KO_01","KO_02"], WT : ["WT1","WT2"]}}
}) {
    const groupingNames = useMemo(() => Object.keys(groupings),[groupings])
    const numberGroupings = groupingNames.length 
    //const initCategoricalSelection = useMemo(()=>Object.fromEntries(_.map(splitNames,(splitName,idx) => [splitName,groupingNames[idx]]).filter(d => d[1] !== undefined)),[groupingNames])
    const [selectedGroupings, setSelectedGroupings] = useState({colorName : groupingNames[0], xaxisName : groupingNames[1], subplotName : groupingNames[2]})

    return (

        <div>
            <div className="flex">
                {splitNames.map(splitName => {
                    return (
                        <div>
                            <div>{splitName}</div>
                            <Combobox items={groupingNames} placeholder={selectedGroupings[splitName]} />
                        </div>
            )})}
            
            </div>






        </div>

    )
}

export default ResultChart