import _ from "lodash"
import { api } from "@/api"
import { ConditionApplicationsView } from "../condition_applications/ConditionApplicationView"

export function SubmissionGenotypesView({ submission_tag }) { 


    const { data : genotypes } = api.submissions.condition_applications.useGetSubmissionSampleConditionApplications({ tag: submission_tag, attribute_tags : "att_genotype" }, { enabled: _.isString(submission_tag) && submission_tag.length > 0 })
    const uniqueGenotypeTags = _.isArray(genotypes) ? _.uniq(_.map(genotypes, g => _.join(g["att_genotype"],";"))) : []
    return <div className="flex flex-column padding--medium">
        <h3>Genotypes</h3>
        {_.isArray(uniqueGenotypeTags) && uniqueGenotypeTags.length > 0 ? uniqueGenotypeTags.map((gt, idx) =>
            <div key={gt}>{gt.split(";").map(gt => <ConditionApplicationsView tag={gt} />)}</div>) : null}

    </div>

}
