import PropTypes from "prop-types"
import _ from "lodash"
import { getAndTransformDatesFromArrayOfObjectsByKey } from "../../../services/arrays/transforms"
import TimelineChart from "../../core/charts/timeline"
import { useOutletContext } from "react-router"
import { useGetMetadata } from "../../../hooks/queries/datasets.hooks"
import { useGetSubmissionStates } from "../../../hooks/queries/submission.hooks"
import { useGetPublicUserInfo } from "../../../hooks/queries/user.hooks"
import { groupListByProperty } from "../../../services/arrays/groupby"
import { titleFormat } from "../../../services/format/string"
import { getStateName } from "../../../services/states"
import { millisecondsToDays } from "../../../services/format/dates"
import { getFormatDateFromTimestamp } from "../../../services/date/format"


Timeline.propTypes = {
    data  : PropTypes.array.isRequired
}
//data = [{Date : "20230402", label : "Initialized",c : "State Changed"},{Date : "20230702", label : "Processed", c : "Edited"},{Date : "20230708", label : "Groupings Changed", c : "Modified"},{Date : "20230802", label : "Done",c : "State Changed"}], dateKeyName = "asDate", isDate = false
function Timeline({ authenticationStatus }) {

    const { dataset_label, metadata} = useOutletContext()   
    const { data: submissionStates, isLoading: submissionStatesLoading } = useGetSubmissionStates({ tokenString: authenticationStatus.token },
        { staleTime: Infinity }) //request only once. 
    const {data : users, isLoading : userIsLoading, isFetching : userIsFetching} = useGetPublicUserInfo({ tokenString: authenticationStatus.token }, { staleTime: Infinity })
    const [m, formatedTime] = getFormatDateFromTimestamp(metadata.created_on)
    if (!_.isObject(metadata) || !_.isObject(submissionStates) || !_.isObject(users)) return null 
    const groupedUsers = groupListByProperty(users.users, "label")
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
            <p>The current state of the project is : <strong className="h2-span">{getStateName({ submissionStates, state: metadata.state })}</strong>.</p>
            <p>Project started: <strong>{m.fromNow()}</strong></p>
            {dataForLineChart.length > 0 ? <TimelineChart data={dataForLineChart} dateName={"asDate"} labelName="label" colorName="stateName" tooltipNames={["user_name", "comment"]} colorMapper={colorByStateName} /> : null}
        </div>
    )
}


export default Timeline