
import { useGetBackendInfo } from "../../hooks/queries/welcome.hooks"
import { KeyFigure } from "./Keyfigures"
import _ from "lodash"
import { NewsView } from "./News"
import { LastViewed } from "./Views"

import viz from "@mitocube/viz"
import hooks from "@mitocube/api-hooks"
import { AnnotationSelectionMenu } from "../core/base/annotations/AnnotationSelectionMenu"

function Welcome() {
    const { isLoading: backendInfoLoading, data: backendInfo } = useGetBackendInfo()
    
    // const { data: submissionSampleConditionApplications } = hooks.submissions.condition_applications.useGetSubmissionSampleConditionApplications({tag : "PjbzCDFFcd"})
    // console.log(submissionSampleConditionApplications, "Submission Sample CA")

    const { data: sample_pg_counts } = hooks.submissions.counts.useGetSubmissionSampleProteinGroupCount({ tag: "PjbzCDFFcd" })
    
    // const { data: volcanoData } = hooks.submissions.analysis.useGetSubmissionVolcano({
    //     tag: "PjbzCDFFcd",
    //     ca_tag_left: "af10991b2a03b46c6158a889110d67c13f8b6ba4137bb1c40b45af9c33f340df",
    //     ca_tag_right: "c605ee027607bc30bf5ec1329dc7f43e5eff2a2f3f7f3781ba2d633a3b98d8f8"
    // })
    console.log(sample_pg_counts, "Sample PG Counts")

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
                <AnnotationSelectionMenu />
            </div>

            <viz.charts.Network /> 

            {/* <viz.charts.HeatmapGrouping data={submissionSampleConditionApplications} keyNames={["att_environment_treatment"]} is_condition_application={[true]} />
            <viz.charts.Heatmap /> */}
        </div>
    )
}


export default Welcome