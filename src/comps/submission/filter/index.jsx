import { Button, InputGroup } from "@blueprintjs/core"
import { AttributeFilterSelection} from "../view/SubmissionContainer"
import _ from "lodash"
import { StateSelection } from "./StateSelection"
import { HierarchicalUserView } from "../../core/base/user/UserFilterByProperty"

export function SubmissionBaseFilter({
    submissionsQuery,
    setSubmissionQuery,
    submissionFilter,
    setSubmissionFilter,
    userLabelsInSubmission,
    users,
    states,
    submissionsByState,
    attributesByTag,
    uniqueAtributesInSubmissions,
    enableStteSelection = true}) {
    
    return (
        <div>
            <InputGroup value={submissionsQuery.plain} placeholder="Search..." small={true} onValueChange={value => setSubmissionQuery(prevValues => { return { ...prevValues, plain: value } })}/>
            <hr />
            {enableStteSelection ? <div><StateSelection {...{ setSubmissionFilter, states, submissionFilter, submissionsByState }} /><hr/></div> : null}
        
                <HierarchicalUserView users={users} {...{userLabelsInSubmission, setSubmissionFilter, submissionFilter}} />
                <hr/>
                <AttributeFilterSelection {...{
                    uniqueAtributesInSubmissions,
                    attributesByTag,
                    submissionFilter,
                    setSubmissionFilter,
                    attributeSearchQuery: submissionsQuery.attributes,
                    setAttributeSearchQuery: (value) => setSubmissionQuery(prevValues => { return { ...prevValues, attributes: value } })}} />
                <hr/>    
                <h3>Options</h3>
                <Button minimal={true} text="Clear Filter" onClick={() => setSubmissionFilter({})}/>
   
        </div>
    )
}