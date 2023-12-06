import PropTypes from "prop-types"
import _ from "lodash"
import { getAndTransformDatesFromArrayOfObjectsByKey } from "../../../services/arrays/transforms"
import TimelineChart from "../../core/charts/timeline"
import { useOutletContext } from "react-router"
import { useGetPublicUserInfo } from "../../../hooks/queries/user.hooks"
import { groupListByProperty } from "../../../services/arrays/groupby"
import { titleFormat } from "../../../services/format/string"
import { getStateName } from "../../../services/states"
import { getFormatDateFromTimestamp } from "../../../services/date/format"
import { StateIndicator } from "../../submission/view/SubmissionContainer"


Timeline.propTypes = {
    data  : PropTypes.array.isRequired
}
//data = [{Date : "20230402", label : "Initialized",c : "State Changed"},{Date : "20230702", label : "Processed", c : "Edited"},{Date : "20230708", label : "Groupings Changed", c : "Modified"},{Date : "20230802", label : "Done",c : "State Changed"}], dateKeyName = "asDate", isDate = false
function Timeline({ authenticationStatus }) {

    const { dataset_label, metadata, submissionStates} = useOutletContext()   
    
    const {data : users, isLoading : userIsLoading, isFetching : userIsFetching} = useGetPublicUserInfo({ tokenString: authenticationStatus.token }, { staleTime: Infinity })
    const [m, formatedTime] = getFormatDateFromTimestamp(metadata.created_on)
    if (!_.isObject(metadata) || !_.isObject(submissionStates) || !_.isObject(users)) return null 
    const groupedUsers = groupListByProperty(users, "label")
    const timeline = metadata.timeline 
    let dataForLineChart = getAndTransformDatesFromArrayOfObjectsByKey({ data: timeline.entries, keyName: "created_on", dateFormat: "YYYYMMDD" })
    
    dataForLineChart = dataForLineChart.map(d => {
        return {
            ...d,
            stateName: getStateName({ submissionStates, state: d.state }),
            user: _.has(groupedUsers,d.user_label)?groupedUsers[d.user_label][0]:{},
            user_name: _.has(groupedUsers,d.user_label)?`${groupedUsers[d.user_label][0].firstname} ${groupedUsers[d.user_label][0].lastname}`:""
        }
    })
    const colorByStateName = Object.fromEntries(_.keys(submissionStates.colors).map(stateName => [titleFormat(stateName),submissionStates.colors[stateName]]))
    
    return (
        <div>
            <p>Project started: <strong>{m.fromNow()}</strong></p>
            <div className="flex center-items">The current state of the project is : <StateIndicator state={metadata.state} padding="tiny"/></div>
            <div className="flex center-items">The next state of your project will be :<StateIndicator state={metadata.state + 1} padding="tiny"/> </div>
            {dataForLineChart.length > 0 ? <TimelineChart data={dataForLineChart} dateName={"asDate"} labelName="stateName" colorName="stateName" tooltipNames={["user_name", "comment"]} colorMapper={colorByStateName} /> : null}
        </div>
    )
}


export default Timeline