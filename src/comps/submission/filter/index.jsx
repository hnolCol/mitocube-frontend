import _ from "lodash"
import { UserFilter } from "../filter/UserSelection"
import { StateSelection } from "../filter/StateSelection"
import TooltipButton from "../../core/base/buttons/TooltipButton"
import { useEffect, useState } from "react"
import useDebounce from "../../../hooks/useDebounce"
import { GenotypeDatasetFilter } from "./GenotypeFilter"
import { ConditionApplicationFilter } from "./ConditionApplicationFilter"
import { SUBMISSIONS_BY_OPTIONS } from "../view/SubmissionContainer"
import { OptionButton } from "@/comps/core/base/buttons/OptionButton"



export function SubmissionFilterSelection({
        submissionsQuery,
        submissionQueryResult,
        isSuccess,
        submissionFilter, setSubmissionFilter,
        setSubmissionQuery, header = "Submissions", children = <div></div>,
        orderBy,         
        setOrderBy,       
    fixedState = false }) {
    
    const [searchString, setSearchString] = useState(submissionsQuery.plain)
    const debouncedString = useDebounce(searchString, 200)

    useEffect(() => { setSubmissionQuery(prevValues => { return { ...prevValues, plain: debouncedString } }) }, [debouncedString])

    return (
        <div className="submission__wrapper">
        <div className="flex flex-column submission__side__filter__container" style={{gridRow : 1, gridColumn : 1}}>
            <h3>{header} ({isSuccess? submissionQueryResult.query_count:"0"}/{isSuccess? submissionQueryResult.total_count:"0"})</h3>
                <div className="flex center-items" style={{ width: "100%" }}>
                    <div>
                        <input
                            className="search-input"
                            value={searchString}
                            onChange={(e) => setSearchString(e.target.value)}
                            placeholder="Search by label, metatext ..."
                         />
                    </div>
            
            {/* <InputGroup value={searchString} fill = {true} placeholder="Search by label, metatext ..." small={true} onValueChange={value => setSearchString(value)} rightElement={<Button minimal={true} loading={isLoading || isFetching}/>}/> */}
                 <TooltipButton content="Clear filter selection." icon="cross" small={true} onClick={() => setSubmissionFilter({})} intent={_.isEmpty(submissionFilter) ? "none" : "danger"} />
                </div>
                <div>
                    <h4>View By</h4>
                    <div className="flex center-items">{SUBMISSIONS_BY_OPTIONS.map(option => <OptionButton key={option} isSelected={orderBy === option} onClick={() => setOrderBy(option)}  children={<span>{option.charAt(0).toUpperCase() + option.slice(1)}</span>} />)}</div>
                    </div>
            {fixedState ? null : <StateSelection {...{ submissionFilter, setSubmissionFilter }} />} 
            <div style={{height : "1fr", overflowY: "scroll", paddingRight : "1rem"}}>
                <GenotypeDatasetFilter {...{setSubmissionFilter}} />

                <div style={{ marginTop: "2rem" }}>
                        <ConditionApplicationFilter {...{setSubmissionFilter, submissionFilter}} />
                    </div>
                    
                <UserFilter {...{ submissionFilter, setSubmissionFilter, tags: isSuccess ? submissionQueryResult.tags : [] }} />
            </div>
            </div>
        </div>

            <div className="submission__items__container" style={{ gridRow: 1, gridColumn: 2 }}>
                {/* isError ? <p>An error was returned.</p> :
                    _.isEmpty(submissionsByState) && !(isLoading || isFet{ching) ?
                        <p>No submission found that match the filter.</p> : children} */}
                {children}
            </div>
            </div>
    )
}
