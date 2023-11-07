import PropTpyes from "prop-types"
import { Combobox } from "../../input/Combobox"
import _ from "lodash"
import ColorIconWithName from "../../svg/icons/chartSelection/Color"
import SplitIconWithName from "../../svg/icons/chartSelection/Split"
import SubplotIconWithName from "../../svg/icons/chartSelection/Subplot"
import SizeIconWithName from "../../svg/icons/chartSelection/Size"


const IconBasedComboboxes = {
    "colorName": ColorIconWithName,
    "splitName": SplitIconWithName,
    "subplotName": SubplotIconWithName,
    "sizeName" : SizeIconWithName
}

export function getIcon(iconName, props) {

    if (_.has(IconBasedComboboxes, iconName)) {
        
        return  IconBasedComboboxes[iconName]
        
    }

}



GroupingSelection.propTypes = {
    keyNames: PropTpyes.arrayOf(PropTpyes.string).isRequired,
    groupings: PropTpyes.object.isRequired,
    handleSelection: PropTpyes.func.isRequired,
    selectedItems : PropTpyes.object
    
}

function GroupingSelection({keyNames, groupings = {}, handleSelection, selectedItems}) {
    // keynames => selection keyNames
    const groupingNames = _.concat(Object.keys(groupings), ["none"])

    return (
        
        <div className="flex center-items">
            {keyNames.map(keyName => {
                const Icon = getIcon(keyName)
                return (
                    <div>
                        {Icon !== undefined ? <Icon
                            items={groupingNames}
                            callback={handleSelection}
                            callbackKey={keyName}
                            placeholder={_.has(selectedItems, keyName) ? selectedItems[keyName] : "..."} /> :
                            <div className="flex center-items">
                            <div>{keyName}:</div>
                            <div><Combobox
                                        items={groupingNames}
                                        callback={handleSelection}
                                        callbackKey={keyName}
                                        placeholder={_.has(selectedItems, keyName) ? selectedItems[keyName] : "..."}
                                    />
                                </div>
                            </div>}
                    </div>
            )})}
        </div>
    )
}
 
export default GroupingSelection
