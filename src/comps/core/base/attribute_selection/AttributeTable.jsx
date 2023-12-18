import _ from "lodash"
import PropTypes from "prop-types"
import { getColorPalette } from "../../colors/colorPalette"

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
        <div className="intent-marign-left-little margin-top-bottom--smallest div--round" 
        style={{ backgroundColor: color, textAlign: "center", color: "white" }}>
            <div>
                {itemName}
            </div>
        </div>
    )
}



GroupingTable.propTypes = {
    grouping: PropTypes.objectOf(PropTypes.object),
    groupingColors : PropTypes.objectOf(PropTypes.object),
}

function GroupingTable({
    grouping = { Genotype: { WT: ["WT1", "WT2"], KO: ["KO", "KO2"] }, Treatment: { DMSO: ["WT1", "WT2"], Oligomycin: ["KO", "KO2"] }  },
    groupingColors = {}}) {
    
    const groupingNames = Object.keys(grouping)
    
    return (
        <div className="flex">
            
            {groupingNames.map(groupingName => {
                const defaultColors = getColorPalette(Object.keys(grouping[groupingName]).length)
                return (
                    <div key={groupingName} className="flex flex-column intent-marign-left bg--lightgrey intent-marign-left--medium">
                        <GroupingHeader key={groupingName} groupingName={groupingName} />
                        {Object.keys(grouping[groupingName]).map((groupItem, groupIdx) =>
                            <GroupingItem key={`${groupingName}-${groupItem}`}
                                itemName={groupItem} color={_.has(groupingColors,groupingName)?groupingColors[groupingName][groupItem]:defaultColors[groupIdx]} />)}
                    </div>
                )
            })}
            

        </div>
    )
}


export default GroupingTable