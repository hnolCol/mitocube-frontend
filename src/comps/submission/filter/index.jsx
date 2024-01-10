import { Button, InputGroup } from "@blueprintjs/core"
import { AttributeFilterSelection} from "../view/SubmissionContainer"
import _ from "lodash"
import { StateSelection } from "./StateSelection"
import { HierarchicalUserView } from "../../core/base/user/UserFilterByProperty"
import TooltipButton from "../../core/base/buttons/TooltipButton"

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
    enableStateSelection = true}) {
    
    return (
        <div>
            <div className="flex">
                <InputGroup value={submissionsQuery.plain} placeholder="Search..." small={true} onValueChange={value => setSubmissionQuery(prevValues => { return { ...prevValues, plain: value } })} fill={true} />
                <TooltipButton content="Clear selection." icon="cross" small={true} onClick={() => setSubmissionFilter({})} intent={_.isEmpty(submissionFilter) ? "none" : "danger"} />
                <TooltipButton content="Condensed view." icon={submissionsQuery.minimalView ? "eye-on" : "eye-off"} small={true} onClick={() => setSubmissionQuery(prevValues => { return{...prevValues, minimalView : !prevValues.minimalView}})} />
                
            </div>
            <hr />
            {enableStateSelection ? <div><StateSelection {...{ setSubmissionFilter, states, submissionFilter, submissionsByState }} /><hr/></div> : null}
        
                <HierarchicalUserView users={users} {...{userLabelsInSubmission, setSubmissionFilter, submissionFilter}} />
                <hr/>
                <AttributeFilterSelection {...{
                    uniqueAtributesInSubmissions,
                    attributesByTag,
                    submissionFilter,
                    setSubmissionFilter,
                    attributeSearchQuery: submissionsQuery.attributes,
                    setAttributeSearchQuery: (value) => setSubmissionQuery(prevValues => { return { ...prevValues, attributes: value } })}} />
                
   
        </div>
    )
}