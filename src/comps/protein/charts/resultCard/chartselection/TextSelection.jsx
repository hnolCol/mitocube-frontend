import PropTypes from 'prop-types'
import { addItemToArrayOrRemoveItIfPresent } from "../../../../../services/arrays/transforms"
import { TextIconWithName } from "../../../../core/svg/icons/chartSelection/Text"
import _ from 'lodash'

/**
 * @description Selection of Text for a chart annotation.
 * @param {Object} props 
 * @param {String[]} props.keyNames The list of names to be displayed as options for the given selections. (e.g. items in a combobox)
 * @param {Object} props.selection Object with the selected items. 
 * @param {Function} props.onSelectionChange Function to be called when a selection changes. Assumes that it works like a useState set function. 
 * @param {Boolean} props.minimal If the minimal style should be used. The selection will then not be displayed next to the icon. 
 * @returns 
 */
export function TextSelection({ keyNames, selection, onSelectionChange, minimal, itemIsAttribute = true }) {
    return (
        <div className="flex">
            <TextIconWithName
                items={keyNames}
                minimal={minimal}
                itemIsAttribute={itemIsAttribute}
                selectedItems={_.map(selection.tooltipNames, text => { return { text } })}
                placeholder={selection.tooltipNames.length === 1 ? selection.tooltipNames[0] : `${selection.tooltipNames.length} items`}
                callbackKey="tooltipNames" callback={(key, item) => onSelectionChange(key, addItemToArrayOrRemoveItIfPresent({ array: selection.tooltipNames, item }))} />
        </div>
    )
}

TextSelection.defaultProps = {
    minimal: true,
    selection: {}
}

TextSelection.propTypes = {
    keyNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    selection: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string,PropTypes.arrayOf(PropTypes.string)])).isRequired,
    onSelectionChange: PropTypes.func.isRequired,
    minimal: PropTypes.bool 
}