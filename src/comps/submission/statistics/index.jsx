
import { SubmissionFilterSelection } from "../filter"
import _ from "lodash"

import { SubmissionDuration } from "./SubmissionDuration"
import { QuantifiedProteinGroupsStatistics } from "./QuantifiedProteins"


function SubmissionStatistics({ submissionsQuery, setSubmissionQuery, submissionFilter, setSubmissionFilter }) {        
        

    

    const stateFilter = _.has(submissionFilter,"states") && submissionFilter.states.size > 0 ? _.join(Array.from(submissionFilter.states),";") : null
   

    return <SubmissionFilterSelection
        {...{
            submissionFilter,
            setSubmissionFilter,
            submissionsQuery,
            setSubmissionQuery,
            // isLoading,
            // isFetching,
            // isSuccess,
            // isError,
            // submissionQueryResult: submissionQuery
        }}
        children={<div><h3>Statistics</h3><p>The statistic view is currently under development, but you will soon be able to explore number of submission per attribute (such as instrument, organs, cell line),
            users, and research groups.</p>
        
            

            <SubmissionDuration />
            <QuantifiedProteinGroupsStatistics />

        </div>} />
}


export default SubmissionStatistics