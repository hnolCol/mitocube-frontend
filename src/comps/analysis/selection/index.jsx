import APIError from "../../core/error/APIerror";
import { useGetSubmissionByQuery, useGetSubmissionStates } from "../../../hooks/queries/submission.hooks";
import { useGetPublicUserInfo } from "../../../hooks/queries/user.hooks";
import { groupListByProperty } from "../../../services/arrays/groupby";
import _ from "lodash"
import { Button, InputGroup } from "@blueprintjs/core";
import Loading from "../../core/base/loading";
import { useState } from "react"
import { FeatureDatasetFilter } from "../../submission/filter/FeatureSelection";
import { getValueByKeyAndMergeToString } from "../../../services/arrays/transforms";
import useDebounce from "../../../hooks/useDebounce";
import TooltipButton from "../../core/base/buttons/TooltipButton";
import { UserFilter } from "../../submission/filter/UserSelection";
import "../../submission/submission.css"
import { GenotypeDatasetFilter } from "../../submission/filter/GenotypeFilter";

function DatasetSelection({ logout, submissionFilter, setSubmissionFilter, submissionsQuery, setSubmissionQuery}) {
    
    
    const { data: users, isLoading: userIsLoading, isFetching: userIsFetching } = useGetPublicUserInfo()
    const { data: states, isLoading: submissionStatesLoading } = useGetSubmissionStates()
    
    const [searchString, setSearchString] = useState("")
    const debouncedString = useDebounce(searchString, 200)
    const { data: submissionQuery, isLoading, isFetching, isSuccess, isError, error } = useGetSubmissionByQuery({
        query: debouncedString.length === 0 ? null : debouncedString,
        state: "5",
        genotype_tag : getValueByKeyAndMergeToString({array : submissionFilter["genotype_tag"], keyName : "tag"}),
        feature_key : getValueByKeyAndMergeToString({ array: submissionFilter["feature_key"], keyName: "tag" }),
        user_label : getValueByKeyAndMergeToString({ array: submissionFilter["user"], keyName: "tag" }),
        attribute_tag: getValueByKeyAndMergeToString({ array: submissionFilter["attribute_tag"], keyName: "tag" }),
        attribute_value_tag: getValueByKeyAndMergeToString({array : submissionFilter["attribute_value_tag"], keyName : "tag"})
        //attribute_tag : 
    })
    const usersByLabel = _.isArray(users) ? groupListByProperty(users, "label") : {}
    
    if (isError) return <APIError error={error}/>
    
    if (submissionStatesLoading ) return <Loading />

    return (
        <div className="div--expand">            
           <div className="submission__wrapper">
        <div className="submission__side__filter__container" style={{gridRow : 1, gridColumn : 1}}>
            <h3>Datasets ({isSuccess? submissionQuery.query_count:null}/{isSuccess? submissionQuery.total_count:null})</h3>
            <div className="flex" style={{width: "100%"}}>
            <InputGroup value={searchString} fill = {true} placeholder="Search by label, metatext ..." small={true} onValueChange={value => setSearchString(value)} rightElement={<Button minimal={true} loading={isLoading || isFetching}/>}/>
            <TooltipButton content="Clear filter selection." icon="cross" small={true} onClick={() => setSubmissionFilter({})} intent={_.isEmpty(submissionFilter) ? "none" : "danger"} />
                    </div>
            <div style={{height : "1fr", overflowY: "scroll", paddingRight : "1rem"}}>
                    <FeatureDatasetFilter  {...{ setSubmissionFilter }} />
                    <GenotypeDatasetFilter {...{ setSubmissionFilter }}/>
            <UserFilter {...{ submissionFilter, setSubmissionFilter, tags: isSuccess ? submissionQuery.tags : [] }} />
            </div>       
         </div>

                <div className="submission__items__container" style={{ gridRow: 1, gridColumn: 2 }}>
                    
            
            </div>
            </div>
        </div>
    )


}


export default DatasetSelection