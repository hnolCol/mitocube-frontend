import { useOutletContext } from "react-router";
import APIError from "../../core/error/APIerror";
import { Link } from "react-router-dom";
import { SubmissionItem } from "../../submission/view/SubmissionItem";
import { useGetSubmissionAttributesByTag, useGetSubmissionStates, useGetSubmissions } from "../../../hooks/queries/submission.hooks";
import { useGetPublicUserInfo } from "../../../hooks/queries/user.hooks";
import { AttributeFilterSelection, extractSubmissionDetails, filterSubmissionByDatasetAttribute, filterSubmissions } from "../../submission/view/SubmissionContainer";
import { getUniqueSetsOfAllValuesinArrayOfObjects, getUniqueValuesAndCountsFromList, groupListByProperty } from "../../../services/arrays/groupby";
import _ from "lodash"
import { InputGroup } from "@blueprintjs/core";
import Loading from "../../core/base/loading";
import { useMemo } from "react";
import { filterArrayBySearchString } from "../../../services/arrays/filter";
import { SubmissionBaseFilter } from "../../submission/filter";

function DatasetSelection({ authenticationStatus, logout, submissionFilter, setSubmissionFilter, submissionsQuery, setSubmissionQuery}) {
    
    const { data: attributesByTag, isLoading: attrIsLoading, isFetching: attrIsFetching } = useGetSubmissionAttributesByTag({ tokenString: authenticationStatus.token }, { staleTime: Infinity })
    const { isSuccess, isLoading, isFetching, isError, error, data: submissions, refetch: refetchSubmissions } = useGetSubmissions()    
    
    const { data: users, isLoading: userIsLoading, isFetching: userIsFetching } = useGetPublicUserInfo({ tokenString: authenticationStatus.token })
    const { data: states, isLoading: submissionStatesLoading } = useGetSubmissionStates()
    
    if (isError) return <APIError error={error}/>
    
    if (attrIsFetching || userIsLoading || userIsFetching || isLoading || isFetching || !_.isArray(submissions) || submissionStatesLoading || attrIsLoading) return <Loading />


    const {uniqueAtributesInSubmissions,usersByDataLabel} = extractSubmissionDetails({submissions})
    const usersByLabel = groupListByProperty(users, "label")
    const filteredSubmission = filterSubmissions({ submissions, submissionFilter, submissionsQuery, usersByDataLabel, ignoreState : true})   
    const userLabelsInSubmission = getUniqueValuesAndCountsFromList(filteredSubmission.map(submission => _.concat(submission.collaborators, submission.user_label)))


   

    // if (isError) return <APIError error={error} />
    // if (isLoading) return <div>Loading...</div>
{/* <SubmissionItem
                                    key={submission.label}
                                    {...{
                                    stateName : states.states_inv[state], 
                                    states,
                                    usersByLabel,
                                    submission,
                                    setAttributeSelectionDialog,
                                    mouseIsOver: mouseOverLabel === submission.label,
                                    handleMouseOver: setMouseOverLabel,
                                    attributesByTag : attributesByTag.attributes,
                                    attributeValuesByTag: attributesByTag.attribute_values
                                    
                                }} stateColor={states.colors_inv[state]} /> */}
    return (
        <div>
            
           <h2>Dataset Selection</h2>
            <Link to="/dataset/KUbPyK1ASG">Dataset1</Link>
            <Link to="/dataset/BuXOSlIl6G">dataset2</Link>
            <Link to="/dataset/rfP4nAAmgA">D3</Link>
            <Link to="/dataset/3QAisvOBk6xz">Test OLD</Link>
            <div className="div--expand flex">
            <div className="flex flex-column submission__side__filter__container ">
            
            
            <SubmissionBaseFilter {...{submissionFilter,submissionsQuery,setSubmissionFilter,setSubmissionQuery,attributesByTag,userLabelsInSubmission, uniqueAtributesInSubmissions, users, enableStteSelection : false}} />
        
            </div>
                <div className="submission__items__container">
                    {filteredSubmission.map(submission => <SubmissionItem
                                    key={submission.label}
                                    {...{
                                    stateName : states.states_inv[submission.state], 
                                    states,
                                    usersByLabel,
                                    submission,
                                    //setAttributeSelectionDialog,
                                    attributesByTag : attributesByTag.attributes,
                                    attributeValuesByTag: attributesByTag.attribute_values
                                    
                                }} borderColor={states.colors_inv[submission.state]} />)}
                

            </div>
            
            </div>

       

        </div>
    )


}


export default DatasetSelection