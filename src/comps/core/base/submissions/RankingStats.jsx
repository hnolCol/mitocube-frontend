import { api } from "@/api";
import { SubmissionTitle } from "../../../submission/view/SubmissionTitle"
import { Attribute } from "../attributes/Attribute"
import MetricTable from "../metrictable"
import _ from "lodash"
import { ConditionApplicationItem, ConditionApplicationsView } from "../condition_applications/ConditionApplicationView"

export function RankingStats({ attribute_tag, submission_tag, stats }) { 
    console.log(stats, "stats in ranking stats")
    const { data : condition_applications} = api.submissions.condition_applications.useGetSubmissionSampleConditionApplications({tag : submission_tag, attribute_tags :attribute_tag, return_unique : true}, {enabled : _.isString(submission_tag) && _.isString(attribute_tag) }    )
    console.log(condition_applications, "condition applications in ranking stats")
    return <div>
        <SubmissionTitle tag={submission_tag} showCopyToClipboard={false} />
        <Attribute attribute_tag={attribute_tag} />
        <div className="flex flex-column" style={{gap : "0.2rem"}}>{_.has(condition_applications, attribute_tag) && _.isArray(condition_applications[attribute_tag]) ?
            condition_applications[attribute_tag].map(ca_tags =>
                <div className="flex center-items bg--lightgrey" style={{gap : "0.1rem"}} key={_.join(ca_tags)}>{ca_tags.map(ca_tag => <ConditionApplicationsView key={ca_tag} tag={ca_tag} show_attribute={false} />)}{ca_tags.length > 1 ? <span>|</span> : null}</div>) : null}</div>
        <MetricTable  data={stats} highlight={["score"]} />
    </div>



}