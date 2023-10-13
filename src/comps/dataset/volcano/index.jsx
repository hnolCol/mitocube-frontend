import { useOutletContext } from "react-router";
import APIError from "../../core/error/APIerror";
import GroupingSelection from "./GroupSelection";
import _ from "lodash"

function DatasetVolcanoPlot({ }) {
    
    const { datasetInfo, dataID, isLoading, isFetched, isError, error } = useOutletContext()   

    if (isError) return <APIError error={error} />
    if (isLoading) return <div>Dataset Info Loading...</div>

    
    return (
        <div>
            <div className="flex center-items justify-center div--expand">
            <GroupingSelection groupItems={datasetInfo.info.groupItems} groupingNames={datasetInfo.info.groupingNames}/>
            </div>
        </div>
    )
}

export default DatasetVolcanoPlot