import PropTypes from 'prop-types'
import ColorIconWithName from "../../../../core/svg/icons/chartSelection/Color"
import SplitIconWithName from "../../../../core/svg/icons/chartSelection/Split"
import SubplotIconWithName from "../../../../core/svg/icons/chartSelection/Subplot"

/**
 * @description Selection of several aspects of a categorical chart. Including the 
 * colorName, splitName and subplotName. 
 * @param {Object} props 
 * @param {String[]} props.keyNames The list of names to be displayed as options for the given selections. (e.g. items in a combobox)
 * @param {Object} props.selection Object with the selected items. 
 * @param {Function} props.onSelectionChange Function to be called when a selection changes. Assumes that it works like a useState set function. 
 * @param {Boolean} props.minimal If the minimal style should be used. The selection will then not be displayed next to the icon. 
 * @returns 
 */
export function CategoricalChartSelection({ keyNames, selection, onSelectionChange, minimal }) {

    const handleSelection = (key, item) => {
        onSelectionChange(prevValues => {
            return { ...prevValues, [key]: _.isObject(prevValues[key]) ? prevValues[key].tag === item.tag ? undefined : item : item }
        })
    }
    return <div className="flex">
        <ColorIconWithName
            callbackKey="colorName"
            items={keyNames}
            placeholder={selection.colorName}
            selectedItems={[selection.colorName]}
            minimal={minimal}
            callback={handleSelection} />
        <SplitIconWithName
            callbackKey="splitName"
            items={keyNames}
            placeholder={selection.splitName}
            selectedItems={[selection.splitName]}
            minimal={minimal}
            callback={handleSelection} />
        <SubplotIconWithName 
            callbackKey="subplotName"
            items={keyNames}
            placeholder={selection.subplotName}
            selectedItems={[selection.subplotName]}
            minimal={minimal}
            callback={handleSelection} />
    </div>
}

CategoricalChartSelection.defaultProps = {
    minimal: true,
    selection: {}
}

CategoricalChartSelection.propTypes = {
    keyNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    selection: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string,PropTypes.arrayOf(PropTypes.string)])).isRequired,
    onSelectionChange: PropTypes.func.isRequired,
    minimal: PropTypes.bool 

}
