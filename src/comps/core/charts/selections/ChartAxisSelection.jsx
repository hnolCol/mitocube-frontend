import { XAxisName, YAxisName } from "../../svg/icons/chartSelection/ChartAxisNames";

export function ChartAxisSelection({ keyNames, selection, onSelectionChange, minimal }) {
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