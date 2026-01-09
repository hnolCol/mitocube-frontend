
import { useGetBackendInfo } from "../../hooks/queries/welcome.hooks"
import { KeyFigure } from "./Keyfigures"
import _ from "lodash"
import { NewsView } from "./News"
import { LastViewed } from "./Views"

import viz from "@mitocube/viz"
import hooks from "@mitocube/api-hooks"

function Welcome() {
    const { isLoading: backendInfoLoading, data: backendInfo } = useGetBackendInfo()
    
    const { data: submissionSampleConditionApplications } = hooks.submissions.condition_applications.useGetSubmissionSampleConditionApplications({tag : "PjbzCDFFcd"})
    console.log(submissionSampleConditionApplications, "Submission Sample CA")
    return (
        <div className="flex flex-column center-items div--expand">
            <div className="main-header">
                {backendInfoLoading || !_.isObject(backendInfo) ? null : `Welcome to ${backendInfo.app_name}`}
            </div>
            <div>
                <p>{backendInfoLoading || !_.isObject(backendInfo) && _.isString(backendInfo.app_description)? null : `${backendInfo.app_description}`}</p>
            </div>
            <KeyFigure />
            <div>
            <div className="flex flex-wrap justify-flex-start" style={{width : "100%", gap : "2rem"}}>
                    <NewsView />
                    <LastViewed user_tag={null} type="submissions" />
            </div>
            </div>
            {/* <viz.charts.HeatmapGrouping data={submissionSampleConditionApplications} keyNames={["att_environment_treatment"]} is_condition_application={[true]} />
            <viz.charts.Heatmap /> */}
        </div>
    )
}


export default Welcome