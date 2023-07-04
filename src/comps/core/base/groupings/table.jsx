import _ from "lodash"

function GroupingHeader({ groupingName }) {
    //header of a grouping
    return (
        <div className="margin--little">
            <strong>{groupingName}</strong>
        </div>
    )
}

function GroupingItem({itemName, color}) {
    return (
        <div className="intent-marign-left-little" style={{ backgroundColor: color, textAlign: "center", color: "white" }}>
            <div>
                {itemName}
            </div>
        </div>
    )
}


function GroupingTable({
    grouping = { Genotype: { WT: ["WT1", "WT2"], KO: ["KO", "KO2"] }, Treatment: { DMSO: ["WT1", "WT2"], Oligomycin: ["KO", "KO2"] }  },
    groupingColors = { Genotype: { WT: "#466688", KO: "#79c29e" }, Treatment: { DMSO: "#466688", Oligomycin: "#79c29e" } } }) {
    
    const groupingNames = Object.keys(grouping)
    
    return (
        <div className="flex">
            
            {groupingNames.map(groupingName => {
                return (
                    <div key={groupingName} className="flex flex-column intent-marign-left bg--lightgrey">
                        <GroupingHeader key={groupingName} groupingName={groupingName} />
                        {Object.keys(grouping[groupingName]).map(groupItem =>
                            <GroupingItem key={`${groupingName}-${groupItem}`}
                                itemName={groupItem} color={_.has(groupingColors,groupingName)?groupingColors[groupingName][groupItem]:"black"} />)}
                    </div>
                )
            })}
            

        </div>
    )
}



export default GroupingTable