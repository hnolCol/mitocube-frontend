import hooks from "@mitocube/api-hooks";
import _ from "lodash";
import { ConditionApplicationsView } from "../../core/base/condition_applications/ConditionApplicationView";

export function SubmissionConditionApplicationView({ submission_tag }) {

   const {data : submission_ca_tags} = hooks.submissions.condition_applications.useGetSubmissionConditionApplication({tag : submission_tag}, {enabled : _.isString(submission_tag)})
    console.log(submission_ca_tags)

    return (
        <div>
            
            <div className="flex flex-column">
                <h3>Condition Applications</h3>
            {_.isArray(submission_ca_tags) && submission_ca_tags.length > 0 ?
                submission_ca_tags.map(ca_tag => {
                    return <div>
                        <div><ConditionApplicationsView key={ca_tag} tag={ca_tag} /></div></div>
                }) : <div>No condition applications found for this submission.</div>}
             </div>
        </div>
    )
}