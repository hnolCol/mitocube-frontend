import { useGetSubmissionAttributesByTag, useGetSubmissionStates} from "../../../hooks/queries/submission.hooks"
import _ from "lodash"
import { UserFilter } from "../filter/UserSelection"
import { AttributeSubmissionFilter } from "../filter/AttributeSelection"
import { StateSelection } from "../filter/StateSelection"
import TooltipButton from "../../core/base/buttons/TooltipButton"
import { Button, InputGroup } from "@blueprintjs/core"
import { useEffect, useState } from "react"
import useDebounce from "../../../hooks/useDebounce"
import { GenotypeDatasetFilter } from "../filter/GenotypeSelection"
import { groupListByProperty } from "../../../services/arrays/groupby"



export function SubmissionFilterSelection({ submissionsQuery, submissionQueryResult, isLoading, isFetching, isSuccess, isError,  submissionFilter, setSubmissionFilter, setSubmissionQuery, header = "Submissions", children = <div></div> }) {
    const [searchString, setSearchString] = useState(submissionsQuery.plain)
    const debouncedString = useDebounce(searchString, 200)
    const { data: attributesByTag } = useGetSubmissionAttributesByTag({}, { staleTime: Infinity })
    const { data: submissionStates, isLoading: submissionStatesLoading } = useGetSubmissionStates()
    useEffect(() => { setSubmissionQuery(prevValues => { return { ...prevValues, plain: debouncedString } }) }, [debouncedString])


    if (!_.isObject(attributesByTag) || submissionStatesLoading) return null
    const submissionsByState = _.isObject(submissionQueryResult) && _.isArray(submissionQueryResult.submissions) ? groupListByProperty(submissionQueryResult.submissions, "state") : {}
    const attributeValuesByAttributeTag = groupListByProperty(_.values(attributesByTag.attribute_values), "attribute_tag")

    return (
        <div className="submission__wrapper">
        <div className="flex flex-column submission__side__filter__container" style={{gridRow : 1, gridColumn : 1}}>
            <h3>{header} ({isSuccess? submissionQueryResult.query_count:"0"}/{isSuccess? submissionQueryResult.total_count:"0"})</h3>
            <div className="flex" style={{width: "100%"}}>
            <InputGroup value={searchString} fill = {true} placeholder="Search by label, metatext ..." small={true} onValueChange={value => setSearchString(value)} rightElement={<Button minimal={true} loading={isLoading || isFetching}/>}/>
            <TooltipButton content="Clear filter selection." icon="cross" small={true} onClick={() => setSubmissionFilter({})} intent={_.isEmpty(submissionFilter) ? "none" : "danger"} />
            </div>
            <StateSelection {...{ states : submissionStates, submissionsByState, submissionFilter, setSubmissionFilter }} /> 
            <div style={{height : "1fr", overflowY: "scroll", paddingRight : "1rem"}}>
                <AttributeSubmissionFilter attributesByTag={attributesByTag.attributes} tags={isSuccess ? submissionQueryResult.tags : []} {...{ setSubmissionFilter, submissionFilter, attributeValuesByAttributeTag }} />
            <GenotypeDatasetFilter {...{setSubmissionFilter}} />
            <UserFilter {...{ submissionFilter, setSubmissionFilter, tags: isSuccess ? submissionQueryResult.tags : [] }} />
            </div>
            </div>

            <div className="submission__items__container" style={{ gridRow: 1, gridColumn: 2 }}>
                {isError ? <p>An error was returned.</p> :
                    _.isEmpty(submissionsByState) && !(isLoading || isFetching) ?
                        <p>No submission found that match the filter.</p> : children}
            </div>
            </div>
    )
}
