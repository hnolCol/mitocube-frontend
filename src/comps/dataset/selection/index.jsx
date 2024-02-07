import { useOutletContext } from "react-router";
import APIError from "../../core/error/APIerror";
import { Link } from "react-router-dom";
import { SubmissionItem } from "../../submission/view/SubmissionItem";
import { useGetSubmissionAttributesByTag, useGetSubmissionStates, useGetSubmissions } from "../../../hooks/queries/submission.hooks";
import { useGetPublicUserInfo } from "../../../hooks/queries/user.hooks";
import { extractSubmissionDetails, filterSubmissionByDatasetAttribute, filterSubmissions } from "../../submission/view/SubmissionContainer";
import { getUniqueSetsOfAllValuesinArrayOfObjects, getUniqueValuesAndCountsFromList, groupListByProperty } from "../../../services/arrays/groupby";
import _ from "lodash"
import { InputGroup } from "@blueprintjs/core";
import Loading from "../../core/base/loading";
import { useMemo } from "react";
import { filterArrayBySearchString } from "../../../services/arrays/filter";
import { SubmissionBaseFilter } from "../../submission/filter";
import { FeatureDatasetFilter } from "../../submission/filter/FeatureSelection";

function DatasetSelection({ logout, submissionFilter, setSubmissionFilter, submissionsQuery, setSubmissionQuery}) {
    
    const { data: attributesByTag, isLoading: attrIsLoading, isFetching: attrIsFetching } = useGetSubmissionAttributesByTag({}, { staleTime: Infinity })
    const { isSuccess, isLoading, isFetching, isError, error, data: submissions, refetch: refetchSubmissions } = useGetSubmissions()    
    
    const { data: users, isLoading: userIsLoading, isFetching: userIsFetching } = useGetPublicUserInfo()
    const { data: states, isLoading: submissionStatesLoading } = useGetSubmissionStates()
    
    if (isError) return <APIError error={error}/>
    
    if (attrIsFetching || userIsLoading || userIsFetching || isLoading || isFetching || !_.isArray(submissions) || submissionStatesLoading || attrIsLoading) return <Loading />

    const activeSubmissions = submissions.filter(submission => submission.state === _.max(_.values(states.states)))
    const {uniqueAtributesInSubmissions,usersByDataLabel} = extractSubmissionDetails({submissions : activeSubmissions})
    const usersByLabel = groupListByProperty(users, "label")
    const filteredSubmission = filterSubmissions({ submissions : activeSubmissions, submissionFilter, submissionsQuery, usersByDataLabel, ignoreState : true})   
    const userLabelsInSubmission = getUniqueValuesAndCountsFromList(filteredSubmission.map(submission => _.concat(submission.collaborators, submission.user_label)))

    return (
        <div>
            
           <h2>Dataset Selection</h2>
            <div className="div--expand flex">
            <div className="flex flex-column submission__side__filter__container ">
                    <SubmissionBaseFilter {...{
                        submissionFilter,
                        submissionsQuery,
                        setSubmissionFilter,
                        setSubmissionQuery,
                        attributesByTag,
                        userLabelsInSubmission,
                        uniqueAtributesInSubmissions,
                        users,
                        enableStateSelection: false
                    }} />
                    <FeatureDatasetFilter />
        
            </div>
                <div className="submission__items__container">
                    {filteredSubmission.map(submission => <SubmissionItem
                                    key={submission.label}
                                    {...{
                                    stateName : states.states_inv[submission.state], 
                                    states,
                                    usersByLabel,
                                    submission,
                                    contextMenuEnabled : false,
                                    //setAttributeSelectionDialog,
                                    attributesByTag : attributesByTag.attributes,
                            attributeValuesByTag: attributesByTag.attribute_values,
                                    minimalView : submissionsQuery.minimalView
                                    
                                }} borderColor={states.colors_inv[submission.state]} />)}
                

            </div>
            
            </div>

       

        </div>
    )


}


export default DatasetSelection