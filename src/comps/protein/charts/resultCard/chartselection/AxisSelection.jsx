import PropTypes from 'prop-types'
import { XAxisName, YAxisName } from "../../../../core/svg/icons/chartSelection/ChartAxisNames"


/**
 * @description Selection of the x and y axis keys.
 * @param {Object} props 
 * @param {String[]} props.keyNames The list of names to be displayed as options for the given selections. (e.g. items in a combobox)
 * @param {Object} props.selection Object with the selected items. 
 * @param {Function} props.onSelectionChange Function to be called when a selection changes. Must accept true props: key and value.
 * @param {Boolean} props.minimal If the minimal style should be used. The selection will then not be displayed next to the icon. 
 * @returns 
 */
export function ChartAxisSelection({ keyNames, selection, onSelectionChange, minimal }) {
    return (
        <div className="flex">
            <XAxisName
                items={keyNames}
                selectedItems={[{text : selection.xaxisName}]}
                placeholder={selection.xaxisName}
                callbackKey="xaxisName"
                minimal={minimal}
                callback={(key, value) => onSelectionChange(key, value)} />
            <YAxisName
                items={keyNames}
                placeholder={selection.yaxisName}
                minimal={minimal}
                selectedItems={[{text : selection.yaxisName}]}
                callbackKey="yaxisName"
                callback={(key, value) => onSelectionChange(key,value)} />
        </div>
    )
}


ChartAxisSelection.defaultProps = {
    minimal: true 
}

ChartAxisSelection.propTypes = {
    keyNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    selection: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string,PropTypes.arrayOf(PropTypes.string)])).isRequired,
    onSelectionChange: PropTypes.func.isRequired,
    minimal: PropTypes.bool 
}