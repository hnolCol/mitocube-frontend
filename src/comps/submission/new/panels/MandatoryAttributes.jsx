import { addStringToArrayOrRemove } from "../../../../services/arrays/transforms";
import { DatasetAttributeView } from "../../../core/base/attributes/DatasetAttributeView";
import { AttributesInput } from "../../../core/input/api/DatasetAttributeInput";
import { MandatoryAttributes } from "../../MandatoryAttributes";
import _ from "lodash"

export function MandAttributesTab({submission, setSubmission, setComponentKey, componentKey }) {
    
    /**
     * @description Handle dataset selection 
     * @param {*} attribute - Historically - should be removed. 
     * @param {import("../../../../types/attributes").Trait} trait - The actual trait that was selected. 
     */
    const handleTraitSelection = (attribute_tag, trait_tag) => {
        //const attribute_tag = trait.attribute_tag 
        let selected_traits = submission.selected_traits
        
        if (!_.has(selected_traits, attribute_tag)) {
            selected_traits[attribute_tag] = [trait_tag]
        }
        else {
            
            selected_traits[attribute_tag] = addStringToArrayOrRemove({ array: selected_traits[attribute_tag], string: trait_tag })
            if (selected_traits[attribute_tag].length === 0) {
                delete selected_traits[attribute_tag]
            }
        }
        setSubmission(prevValues => { return {...prevValues, selected_traits}})
    }

    const onUserUnitInput = (userUnitInput) => {
        setSubmission(prevValues => { return { ...prevValues, "userUnitInput": {...prevValues["userUnitInput"], ...userUnitInput} }})
    }
    
    return <div>
        <h3>Dataset Attributes</h3>
        <p>Dataset attributes describe the dataset and are valid for all samples.
            As an example, if you have a project that uses the same cell line throughout the study, the cell line should be added here.</p>
        <p>Other examples are: Tissue, Lysis buffer and Cell culture media. If you compare two or more genotypes to each other, the genotype should be defined as a samples attributes.</p>
        <MandatoryAttributes
            selectedDatasetAttributes={submission.selected_traits}
            onAttributeValueSelect={handleTraitSelection} /> 
        <AttributesInput
            handleTraitSelection = {handleTraitSelection}
            min_state={submission.state}
            selected_traits={submission.selected_traits} />
                            
        <DatasetAttributeView
            submission_tag={submission.tag}
            attributeTraits={submission.datasetAttributeValues}
            userUnitInput={submission.userUnitInput}
            onUserUnitInput={onUserUnitInput} />
    </div>
    
}