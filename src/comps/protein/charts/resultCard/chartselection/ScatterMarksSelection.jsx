import PropTypes from 'prop-types'
import ColorIconWithName from "../../../../core/svg/icons/chartSelection/Color"
import SizeIconWithName from "../../../../core/svg/icons/chartSelection/Size"



/**
 * @description Selection of several aspects of a scatter chart marks. Including the 
 * colorName and sizeName. 
 * @param {Object} props 
 * @param {String[]} props.keyNames The list of names to be displayed as options for the given selections. (e.g. items in a combobox)
 * @param {Object} props.selection Object with the selected items. 
 * @param {Function} props.onSelectionChange Function to be called when a selection changes. Assumes that it works like a useState set function. 
 * @param {Boolean} props.minimal If the minimal style should be used. The selection will then not be displayed next to the icon. 
 * @returns 
 */
export function ScatterMarksSelection({keyNames, selection, onSelectionChange, minimal, itemIsAttribute = true}) {
    return (
        <div className="flex">
            <ColorIconWithName
                items={keyNames}
                placeholder={selection.colorName}
                selectedItems={[{ text: selection.colorName }]}
                minimal={minimal}
                itemIsAttribute={itemIsAttribute}
                callbackKey="colorName" callback={(key, value) => onSelectionChange(key, selection.colorName === value ? undefined : value)} />
            <SizeIconWithName
                items={keyNames}
                placeholder={selection.sizeName}
                selectedItems={[{ text: selection.sizeName }]}
                minimal={minimal}
                itemIsAttribute={itemIsAttribute}
                callbackKey="sizeName" callback={(key, value) => onSelectionChange(key, selection.sizeName === value ? undefined : value)} />
        </div>
    )
}
ScatterMarksSelection.defaultProps = {
    minimal: true,
    selection: {}
}

ScatterMarksSelection.propTypes = {
    keyNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    selection: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string,PropTypes.arrayOf(PropTypes.string)])).isRequired,
    onSelectionChange: PropTypes.func.isRequired,
    minimal: PropTypes.bool 

}
