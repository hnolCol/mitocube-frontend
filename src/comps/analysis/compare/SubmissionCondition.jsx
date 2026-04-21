import { ConditionApplicationInput } from "@/comps/core/input/api/ConditionApplicationInput";
import { SubmissionInput } from "@/comps/core/input/api/SubmissionInput";
import _ from "lodash" 
export function SubmissionCondition({ selection, filterId, onSelectionChange }) {



    const handleSelectionChange = (type, tag) => {
        const newSelection = { ...selection, [type]: [tag] };
        onSelectionChange(filterId, newSelection);
    }

    return (
        <div>
            <span>Submission Condition</span>
            <div className="flex">
                

                <div>
                    <SubmissionInput
                        selected_submission_tags={selection.submission_tag}
                        onSelect={(tag) => handleSelectionChange("submission_tag", tag)} />
                    
                    {selection.submission_tag.length > 0 && (
                        <ConditionApplicationInput
                            selected_ca_tags={selection.ca_tag}
                            onSelect={(tag) => handleSelectionChange("ca_tag", tag)}
                            submission_tag={selection.submission_tag[0]} />
                    )}
                </div>

                <div>


                </div>

            </div>
            
        </div>
    )

}