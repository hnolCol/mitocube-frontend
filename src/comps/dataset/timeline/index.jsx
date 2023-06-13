import PropTypes from "prop-types"
import _ from "lodash"
import { getAndTransformDatesFromArrayOfObjectsByKey } from "../../../services/arrays/transforms"
import TimelineChart from "../../core/charts/timeline"


Timeline.propTypes = {
    data  : PropTypes.array.isRequired
}

function Timeline({data = [{Date : "20230602", label : "Initialized",c : "State Changed"},{Date : "20230702", label : "Processed", c : "Edited"},{Date : "20230502", label : "Done",c : "State Changed"}], dateKeyName = "asDate", isDate = false}) {

    const dataForLineChart = getAndTransformDatesFromArrayOfObjectsByKey({data,keyName : "Date", dateFormat : "YYYYMMDD"})

    return (
        <div>
            <p>asd</p>
            <TimelineChart data={dataForLineChart} dateName={dateKeyName} labelName="label"/>
        </div>
    )
}


export default Timeline