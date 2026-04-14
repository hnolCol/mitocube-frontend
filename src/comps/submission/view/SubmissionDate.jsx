
import { CreatedAt } from '../../core/metrics/CreatedAt'
import _ from 'lodash' 
import { api } from '@/api'
export function SubmissionDate({ submission_tag, addFromNow = true }) {
    const { data: created_at } = api.submissions.core.useGetSubmissionCreatedAt({ tag: submission_tag }, { enabled: _.isString(submission_tag) })
    
    return <div>
        {_.isNumber(created_at) ? <CreatedAt createdat={created_at} addFromNow={addFromNow} /> : null}
    </div>
}