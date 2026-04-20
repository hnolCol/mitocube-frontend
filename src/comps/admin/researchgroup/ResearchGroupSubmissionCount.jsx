import { api } from "@/api"
import Numeric from "@/comps/core/metrics/Numeric"
import _ from "lodash"


export function ResearchGroupSubmissionsCount({ tag }) {

    const { data: submission_count, isSuccess } = api.researchgroups.useGetResearchGroupSubmissionCount({ tag }, { enabled: _.isString(tag) })
    return <div> {isSuccess ? 
        <Numeric metric={submission_count} label = "Submissions" spanClassName={`h${2}-span`} />
        : null}  
    </div>
}