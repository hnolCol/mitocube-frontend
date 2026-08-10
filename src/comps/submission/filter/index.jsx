import _ from "lodash"
import { UserFilter } from "../filter/UserSelection"
import { StateSelection } from "../filter/StateSelection"
import TooltipButton from "../../core/base/buttons/TooltipButton"
import { useEffect, useState } from "react"
import useDebounce from "../../../hooks/useDebounce"
import { GenotypeDatasetFilter } from "./GenotypeFilter"
import { ConditionApplicationFilter } from "./ConditionApplicationFilter"
import { SUBMISSIONS_BY_OPTIONS, SUBMISSION_SORT_BY_OPTION } from "../view/SubmissionContainer"
import { OptionButton } from "@/comps/core/base/buttons/OptionButton"
import { useSearchParams } from "react-router";
import { UserDatasetFilter } from "./UserFilter"


const LIMIT_OPTIONS = [20, 30, 50, 100, 150]


export function SubmissionFilterSelection({
        submissionsQuery,
        submissionQueryResult,
        isSuccess,
        submissionFilter,
        setSubmissionFilter,
        setSubmissionQuery,
        authenticationStatus,         
        header = "Submissions", children = <div></div>,
        orderBy,         
        setOrderBy,  
        fixedState = false }) {
    
    const [searchString, setSearchString] = useState(submissionsQuery.plain)
    const debouncedString = useDebounce(searchString, 10)
    useEffect(() => { setSubmissionQuery(prevValues => { return { ...prevValues, plain: debouncedString } }) }, [debouncedString])
    
    const [searchParams, setSearchParams] = useSearchParams()
    const selectedSortBy = SUBMISSION_SORT_BY_OPTION.includes(searchParams.get("sort_by")) ? searchParams.get("sort_by") : SUBMISSION_SORT_BY_OPTION[0]
    const selectedLimit = LIMIT_OPTIONS.includes(_.toNumber(searchParams.get("limit"))) 
        ? _.toNumber(searchParams.get("limit")) 
        : LIMIT_OPTIONS[0]

    
    useEffect(() => {
            setSubmissionQuery(prevValues => {
                return { ...prevValues, limit: selectedLimit }
            })
    }, [selectedLimit])
    
    useEffect(() => {
        setSubmissionQuery(prevValues => {
            //sort by date is the default
            return { ...prevValues, sort_by_views: selectedSortBy === "views" ? true : false }
        })
    }, [selectedSortBy])
    
    const updateLimit = (limit) => {
        const newParams = new URLSearchParams(searchParams)
        newParams.set("limit", limit)
        setSearchParams(newParams, { replace: true })
    }

    const updateSortBy = (sort_by) => {
        const newParams = new URLSearchParams(searchParams)
        newParams.set("sort_by", sort_by)
        setSearchParams(newParams, { replace: true })
    }
    return (
        <div className="submission__wrapper">

        <div className="flex flex-column submission__side__filter__container" style={{gridRow : 1, gridColumn : 1}}>
            
        <h3>{header} ({isSuccess ? Math.min(submissionQueryResult.query_count, selectedLimit) : "0"}/{isSuccess ? submissionQueryResult.query_count : "0"})</h3>
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
                    <TooltipButton content="Clear filter selection." icon="cross" small={true} onClick={() => {
                        setSubmissionQuery(prevValues => { return { ...prevValues, plain: "" } })
                        setSubmissionFilter({})
                    }} intent={_.isEmpty(submissionFilter) ? "none" : "danger"} />
                </div>
                <div>
                    <div className="flex" >
                        {LIMIT_OPTIONS.map(option => (
                            <OptionButton
                                key={option}
                                onClick={() => updateLimit(option)}
                                isSelected={option === selectedLimit}
                            >
                                {option}
                            </OptionButton>
                        ))}
                    </div>
            </div>
            <div style={{ marginTop: "0.5rem" }}>
    <h4>View By</h4>
    <div className="flex center-items" style={{ marginTop: "0.3rem", marginBottom: "0.3rem" }}>
        {SUBMISSIONS_BY_OPTIONS.filter(option => option !== "My Submissions").map(option => (
            <OptionButton key={option} isSelected={orderBy === option} onClick={() => setOrderBy(option)} children={<span>{option.charAt(0).toUpperCase() + option.slice(1)}</span>} />
        ))}
            </div>
    <h4>Sort By</h4>
    <div className="flex center-items" style={{ marginTop: "0.3rem", marginBottom: "0.3rem" }}>
        {SUBMISSION_SORT_BY_OPTION.map(option => (
            <OptionButton key={option} isSelected={selectedSortBy === option} onClick={() => updateSortBy(option)} children={<span>{option.charAt(0).toUpperCase() + option.slice(1)}</span>} />
        ))}
                    </div>
    <h4>Filter By</h4>
    <div className="flex center-items" style={{ marginTop: "0.3rem", marginBottom: "0.3rem" }}>
        <UserFilter {...{ submissionFilter, setSubmissionFilter, tags: isSuccess ? submissionQueryResult.tags : [], authenticationStatus }} />
    </div>
    </div>
            {fixedState ? null : <StateSelection {...{ submissionFilter, setSubmissionFilter }} />} 
    
        <div style={{ height: "1fr", overflowY: "scroll", paddingRight: "1rem" }}>
                <GenotypeDatasetFilter {...{setSubmissionFilter, submissionFilter}} />

        <div style={{ marginTop: "1rem" }}>
            <UserDatasetFilter {...{ setSubmissionFilter, submissionFilter }} />
        </div>

    <div style={{ marginTop: "1rem" }}>
        <ConditionApplicationFilter {...{setSubmissionFilter, submissionFilter}} />
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
