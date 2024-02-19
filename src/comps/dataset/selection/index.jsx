import { useOutletContext } from "react-router";
import APIError from "../../core/error/APIerror";
import { Link } from "react-router-dom";
import { SubmissionItem } from "../../submission/view/SubmissionItem";
import { useGetSubmissionAttributesByTag, useGetSubmissionByQuery, useGetSubmissionStates, useGetSubmissions } from "../../../hooks/queries/submission.hooks";
import { useGetPublicUserInfo } from "../../../hooks/queries/user.hooks";
import { extractSubmissionDetails, filterSubmissionByDatasetAttribute, filterSubmissions } from "../../submission/view/SubmissionContainer";
import { getUniqueSetsOfAllValuesinArrayOfObjects, getUniqueValuesAndCountsFromList, groupListByProperty } from "../../../services/arrays/groupby";
import _ from "lodash"
import { Button, InputGroup } from "@blueprintjs/core";
import Loading from "../../core/base/loading";
import { useMemo, useState } from "react";
import { filterArrayBySearchString } from "../../../services/arrays/filter";
import { SubmissionBaseFilter } from "../../submission/filter";
import { FeatureDatasetFilter } from "../../submission/filter/FeatureSelection";
import { getValueByKeyAndMergeToString } from "../../../services/arrays/transforms";
import useDebounce from "../../../hooks/useDebounce";
import TooltipButton from "../../core/base/buttons/TooltipButton";
import { AttributeSelection } from "../../submission/filter/AttributeSelection";
import { UserSelection } from "../../submission/filter/UserSelection";
import "../../submission/submission.css"
function DatasetSelection({ logout, submissionFilter, setSubmissionFilter, submissionsQuery, setSubmissionQuery}) {
    
    const { data: attributesByTag, isLoading: attrIsLoading, isFetching: attrIsFetching } = useGetSubmissionAttributesByTag({}, { staleTime: Infinity })
    // const { isSuccess, isLoading, isFetching, isError, error, data: submissions, refetch: refetchSubmissions } = useGetSubmissions()    
    
    const { data: users, isLoading: userIsLoading, isFetching: userIsFetching } = useGetPublicUserInfo()
    const { data: states, isLoading: submissionStatesLoading } = useGetSubmissionStates()
    
    const [searchString, setSearchString] = useState("")
    const debouncedString = useDebounce(searchString, 200)
    const { data: submissionQuery, isLoading, isFetching, isSuccess, isError, error } = useGetSubmissionByQuery({
        query: debouncedString.length === 0 ? null : debouncedString,
        state: "5",
        user_label : getValueByKeyAndMergeToString({ array: submissionFilter["user"], keyName: "label" }),
        attribute_tag: getValueByKeyAndMergeToString({ array: submissionFilter["attribute_tag"], keyName: "tag" }),
        attribute_value_tag: getValueByKeyAndMergeToString({array : submissionFilter["attribute_value_tag"], keyName : "tag"})
        //attribute_tag : 
    })
    const usersByLabel = _.isArray(users) ? groupListByProperty(users, "label") : {}



    
    if (isError) return <APIError error={error}/>
    
    if (submissionStatesLoading || attrIsLoading || attrIsFetching) return <Loading />

    return (
        <div className="div--expand">
            
           <h2>Dataset Selection</h2>
           <div className="submission__wrapper">
    
        <div className="submission__side__filter__container" style={{gridRow : 1, gridColumn : 1}}>
            <h3>Submissions ({isSuccess? submissionQuery.query_count:null}/{isSuccess? submissionQuery.total_count:null})</h3>
            <div className="flex" style={{width: "100%"}}>
            <InputGroup value={searchString} fill = {true} placeholder="Search by label, metatext ..." small={true} onValueChange={value => setSearchString(value)} rightElement={<Button minimal={true} loading={isLoading || isFetching}/>}/>
            <TooltipButton content="Clear filter selection." icon="cross" small={true} onClick={() => setSubmissionFilter({})} intent={_.isEmpty(submissionFilter) ? "none" : "danger"} />
            </div>
            <AttributeSelection attributesByTag={attributesByTag.attributes} labels={isSuccess ? submissionQuery.labels : []} {...{ setSubmissionFilter, submissionFilter }} />
            <UserSelection {...{submissionFilter, setSubmissionFilter, labels: isSuccess ? submissionQuery.labels : []}} />

         </div>

                <div className="submission__items__container" style={{ gridRow: 1, gridColumn: 2 }}>
                    
                    {_.isObject(submissionQuery) && _.isArray(submissionQuery.submissions) ? submissionQuery.submissions.length === 0 ? <p>No submissions match the filter...</p>: submissionQuery.submissions.map(submission => <SubmissionItem
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
                            minimalView: submissionsQuery.minimalView,
                                    
                                    
                                }} borderColor={states.colors_inv[submission.state]} />) : null }
                

            </div>
            
            </div>

       

        </div>
    )


}


export default DatasetSelection