import PropType from "prop-types"
import { XAxisName, YAxisName } from "../../svg/icons/chartSelection/ChartAxisNames";
import _ from "lodash" 

AxisSelection.propTypes = {
    keyNames: PropType.arrayOf(PropType.string).isRequired,
    selection: PropType.object.isRequired,
    onSelectionChange: PropType.func.isRequired,
    minimal: PropType.bool
}

AxisSelection.defaultProps = {
    minimal: true
}

export function AxisSelection({ keyNames, selection, onSelectionChange, minimal, itemIsAttribute = true }) {
    return (
        <div className="flex">
            <XAxisName
                items={keyNames}
                selectedItems={_.isString(selection.xaxisName) ? [selection.xaxisName] : []}
                placeholder={selection.xaxisName}
                callbackKey="xaxisName"
                minimal={minimal}
                callback={onSelectionChange}
                itemIsAttribute={itemIsAttribute}
            />
            <YAxisName
                items={keyNames}
                placeholder={selection.yaxisName}
                minimal={minimal}
                selectedItems={_.isString(selection.yaxisName) ? [selection.yaxisName] : []}
                callbackKey="yaxisName"
                callback={onSelectionChange}
                itemIsAttribute={itemIsAttribute} 
            />
        </div>
    )
}