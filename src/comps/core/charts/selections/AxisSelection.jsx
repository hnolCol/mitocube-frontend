import PropType from "prop-types"
import _ from "lodash"
import { XAxisName, YAxisName } from "../../svg/icons/chartSelection/ChartAxisNames"

AxisSelection.propTypes = {
    keyNames: PropType.arrayOf(PropType.string).isRequired,
    selection: PropType.object.isRequired,
    onSelectionChange: PropType.func.isRequired,
    minimal: PropType.bool,
    itemIsAttribute: PropType.bool
}

/**
 * @description X and y axis selection. Opens two dropdowns to select the key names plotted on the axes.
 * @param {String[]} props.keyNames - The selectable (numeric) key names.
 * @param {Object} props.selection - The current selection. Must contain xaxisName and yaxisName if already selected.
 * @param {Function} props.onSelectionChange - Called as onSelectionChange(callbackKey, value) with callbackKey "xaxisName" or "yaxisName".
 * @param {Boolean} props.minimal - If true the selected value is not shown next to the icon.
 * @param {Boolean} props.itemIsAttribute - If true the items are treated as attribute tags (fetched from the backend).
 */
export function AxisSelection({ keyNames, selection, onSelectionChange, minimal = true, itemIsAttribute = true }) {
    return (
        <div className="flex">
            <XAxisName
                items={keyNames}
                selectedItems={_.isString(selection.xaxisName) ? [selection.xaxisName] : []}
                placeholder={selection.xaxisName}
                callbackKey="xaxisName"
                minimal={minimal}
                callback={onSelectionChange}
                itemIsAttribute={itemIsAttribute} />
            <YAxisName
                items={keyNames}
                selectedItems={_.isString(selection.yaxisName) ? [selection.yaxisName] : []}
                placeholder={selection.yaxisName}
                callbackKey="yaxisName"
                minimal={minimal}
                callback={onSelectionChange}
                itemIsAttribute={itemIsAttribute} />
        </div>
    )
}
