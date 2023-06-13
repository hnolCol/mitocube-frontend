import PropTpyes from "prop-types"
import { Combobox } from "../../input/Combobox"
import _ from "lodash"

GroupingSelection.propTypes = {
    keyNames: PropTpyes.arrayOf(PropTpyes.string).isRequired,
    groupings: PropTpyes.object.isRequired,
    handleSelection: PropTpyes.func.isRequired,
    selectedItems : PropTpyes.object
    
}

function GroupingSelection({keyNames, groupings = {}, handleSelection, selectedItems}) {
    // keynames => selection keyNames
    const groupingNames = Object.keys(groupings)

    
    return (
        
        <div className="flex">
            {keyNames.map(keyName => {
                return (
                    <div className="flex center-items">
                        <div>{keyName}:</div>
                        <Combobox
                            items={groupingNames}
                            callback={handleSelection}
                            callbackKey={keyName}
                            placeholder={_.has(selectedItems,keyName)?selectedItems[keyName]:"Please select .."}
                            />
                    </div>
            )})}
        </div>
    )
}
 
export default GroupingSelection
