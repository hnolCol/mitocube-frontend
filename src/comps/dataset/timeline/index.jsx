import PropTypes from "prop-types"
import _ from "lodash"
import TimelineChart from "../../core/charts/timeline"
import { useOutletContext } from "react-router"
import { StateIndicator } from "../../core/base/states/SubmssionState"
import { useGetTimelineBySubmissionTag } from "../../../hooks/queries/timeline.hooks"
import { CraetedAt } from "../../core/metrics/CreatedAt"
import { useEffect } from "react"
import { Loading } from "../../core/base/states/Loading"
import { useGetSubmissionStates } from "../../../hooks/queries/submission.hooks"



function Timeline() {
    const { submission_tag, metadata, refetchMetaData} = useOutletContext()   
    const { data: submissionStates, isSuccess : stateIsSuccess } = useGetSubmissionStates()
    const { data : timeline, isLoading : timelineIsLoading, isFetching : timelineIsFetching, isSuccess : timelineIsSuccess } = useGetTimelineBySubmissionTag({submission_tag})

    const metadataLoaded = _.isObject(metadata)
    useEffect(() => {
        if (!metadataLoaded)  refetchMetaData()
    }, [metadataLoaded])

    //map the submission_state(int) to the submission name
    const timeline_data = timelineIsSuccess && _.isArray(timeline) ?
        timeline.map(tl => {
            return {
                ...tl,
                "submission_text": submissionStates.states_inv[tl.submission_state]
            }
        }) : []
    return (
        <div>
            {metadataLoaded && stateIsSuccess ? <div>
                <h2>Project Timeline</h2>
                <p>Project started: <CraetedAt createdat={metadata.created_at} /></p>
                <div className="flex center-items">The current state of the project is : <StateIndicator state={metadata.state} padding="tiny" /></div>
                <div className="flex center-items">The next state of your project will be :<StateIndicator state={metadata.state + 1} padding="tiny" /> </div>
                {timelineIsFetching || timelineIsLoading ? <Loading /> : timelineIsSuccess ?
                    <TimelineChart
                        data={timeline_data}
                        dateName={"created_at"}
                        height={800}
                        labelName="submission_text"
                        colorName="submission_state"
                        tooltipNames={["content"]}
                        colorMapper={submissionStates.colors_inv} /> : null}
            </div> : null}
            </div>
    )
}


export default Timeline