import { useGetSubmissionByQuery } from "../../../hooks/queries/submission.hooks"
import { getValueByKeyAndMergeToString } from "../../../services/arrays/transforms"
import { SubmissionFilterSelection } from "../filter"
import _ from "lodash"

import hooks from "@mitocube/api-hooks"
import viz from "@mitocube/viz"
import { SubmissionDuration } from "./SubmissionDuration"
import { QuantifiedProteinGroupsStatistics } from "./QuantifiedProteins"


function SubmissionStatistics({ submissionsQuery, setSubmissionQuery, submissionFilter, setSubmissionFilter }) {        
        

    

    const stateFilter = _.has(submissionFilter,"states") && submissionFilter.states.size > 0 ? _.join(Array.from(submissionFilter.states),";") : null
    // console.log(submissionFilter)
    // console.log(getValueByKeyAndMergeToString({ array: submissionFilter["user"], keyName: "label" }))
    
    // const { data: submissionQuery, isLoading, isFetching, isSuccess, isError, error } = useGetSubmissionByQuery({dddddd
    //     query: submissionsQuery.plain.length === 0 ? null : submissionsQuery.plain,
    //     state: stateFilter,
    //     genotype_tag: getValueByKeyAndMergeToString({array : submissionFilter["genotype_tag"], keyName : "tag"}),
    //     user_label : getValueByKeyAndMergeToString({ array: submissionFilter["user"], keyName: "label" }),
    //     attribute_tag: getValueByKeyAndMergeToString({ array: submissionFilter["attribute_tag"], keyName: "tag" }),
    //     attribute_value_tag: getValueByKeyAndMergeToString({array : submissionFilter["attribute_value_tag"], keyName : "tag"})
    // })


    
   
    //const usersByLabel = groupListByProperty(users, "label")
    //const filteredSubmission = filterSubmissions({submissions, submissionFilter,submissionsQuery,usersByDataLabel})
    //const submissionsByState = _.isObject(submissionQuery) && _.isArray(submissionQuery.submissions) ? groupListByProperty(submissionQuery.submissions, "state") : {}


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