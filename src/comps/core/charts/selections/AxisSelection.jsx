import PropType from "prop-types"
import { XAxisName, YAxisName } from "../../svg/icons/chartSelection/ChartAxisNames";

AxisSelection.propTypes = {
    keyNames: PropType.arrayOf(PropType.string).isRequired,
    selection: PropType.object.isRequired,
    onSelectionChange: PropType.func.isRequired,
    minimal: PropType.bool
}

AxisSelection.defaultProps = {
    minimal: true
}

export function AxisSelection({ keyNames, selection, onSelectionChange, minimal }) {
    return (
        <div className="flex">
            <XAxisName
                items={keyNames}
                selectedItems={[{text : selection.xaxisName}]}
                placeholder={selection.xaxisName}
                callbackKey="xaxisName"
                minimal={minimal}
                callback={onSelectionChange} />
            <YAxisName
                items={keyNames}
                placeholder={selection.yaxisName}
                minimal={minimal}
                selectedItems={[{text : selection.yaxisName}]}
                callbackKey="yaxisName"
                callback={onSelectionChange} />
        </div>
    )
}