import { Button, InputGroup } from "@blueprintjs/core"
import { AttributeFilterSelection, UserFilterSelection } from "../view/SubmissionContainer"
import { UserByProp } from "../../core/base/user/UserByProperty"
import _ from "lodash"

export function SubmissionBaseFilter({
    submissionsQuery,
    setSubmissionQuery,
    submissionFilter,
    setSubmissionFilter,
    userLabelsInSubmission,
    usersByLabel,
    users,
    attributesByTag,
    uniqueAtributesInSubmissions}) {
    
    return (
        <div>
        <h3>Search</h3>
                <InputGroup value={submissionsQuery.plain} placeholder="Search..." small={true} onValueChange={value => setSubmissionQuery(prevValues => { return { ...prevValues, plain: value } })}/>
                
            <div>
                <UserByProp users={users} {...{userLabelsInSubmission, setSubmissionFilter, submissionFilter}} />
                    {/* <UserFilterSelection {...{ submissionFilter, setSubmissionFilter, usersByLabel, userLabelsInSubmission }} /> */}
                    
                <AttributeFilterSelection {...{
                    uniqueAtributesInSubmissions,
                    attributesByTag,
                    submissionFilter,
                    setSubmissionFilter,
                    attributeSearchQuery: submissionsQuery.attributes,
                    setAttributeSearchQuery: (value) => setSubmissionQuery(prevValues => { return { ...prevValues, attributes: value } })}} />
                    <h3>Options</h3>
                    <Button minimal={true} text="Clear Filter" onClick={() => setSubmissionFilter({})}/>
            </div>
        </div>
    )
}