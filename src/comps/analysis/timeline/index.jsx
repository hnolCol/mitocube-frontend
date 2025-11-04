import PropTypes from "prop-types"
import _ from "lodash"
import TimelineChart from "../../core/charts/timeline"
import { useOutletContext } from "react-router"
import { StateIndicator, StaticStateIndicator } from "../../core/base/states/SubmssionState"
import { useGetTimelineBySubmissionTag } from "../../../hooks/queries/timeline.hooks"
import { CreatedAt } from "../../core/metrics/CreatedAt"
import { useEffect } from "react"
import { Loading } from "../../core/base/states/Loading"
import hooks from "@mitocube/api-hooks"


function Timeline() {
    const { submission_tag } = useOutletContext()   

    const { data: created_at, isSuccess : isCreatedAtSuccess } = hooks.submissions.useGetSubmissionCreatedAt({ tag: submission_tag }, { enabled: _.isString(submission_tag) && submission_tag.length > 0 })
    const { data: state, isSuccess } = hooks.submissions.states.useGetSubmissionState({ tag: submission_tag })
    // const { data : timeline, isLoading : timelineIsLoading, isFetching : timelineIsFetching, isSuccess : timelineIsSuccess } = useGetTimelineBySubmissionTag({submission_tag})
    //map the submission_state(int) to the submission name
    // const timeline_data = timelineIsSuccess && _.isArray(timeline) ?
    //     timeline.map(tl => {
    //         return {
    //             ...tl,
    //             "submission_text": submissionStates.states_inv[tl.submission_state]
    //         }
    //     }) : []
    return (
        <div>
            {isSuccess ? <div>
                <h2>Project Timeline</h2>
                {isCreatedAtSuccess ? <p>Project started: <CreatedAt createdat={created_at} /></p> : null}
                <div className="flex center-items">The current state of the project is : <StaticStateIndicator state_tag={state} padding="tiny" /></div>
                <div className="flex center-items">The next state of your project will be :<StaticStateIndicator state_tag={state + 1} padding="tiny" /> </div>

                <div>Info: The average project time from submission to done is <span className="bold">X weeks</span>.</div>

                {/* {timelineIsFetching || timelineIsLoading ? <Loading /> : timelineIsSuccess ?
                    <TimelineChart
                        data={timeline_data}
                        dateName={"created_at"}
                        height={800}
                        labelName="submission_text"
                        colorName="submission_state"
                        tooltipNames={["content"]}
                        colorMapper={submissionStates.colors_inv} /> : null} */}
            </div> : null}
            </div>
    )
}


export default Timeline