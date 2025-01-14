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
    const handleDatasetAttributeSelection = (attribute, trait) => {
        const attribute_tag = trait.attribute_tag 
        let selected_traits = submission.datasetAttributeValues
        
        if (!_.has(selected_traits, attribute_tag)) {
            selected_traits[attribute_tag] = [trait.tag]
        }
        else {
            
            selected_traits[attribute_tag] = addStringToArrayOrRemove({ array: selected_traits[attribute_tag], string: trait.tag })
            if (selected_traits[attribute_tag].length === 0) {
                delete selected_traits[attribute_tag]
            }
        }
        setSubmission(prevValues => { return {...prevValues, datasetAttributeValues : selected_traits}})
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
            selectedDatasetAttributes={submission.datasetAttributeValues}
            onAttributeValueSelect={handleDatasetAttributeSelection} /> 
        <AttributesInput
            selectedAttributes={submission.datasetAttributeValues}
            handleAttributeSelection={handleDatasetAttributeSelection }
            min_state={submission.state} />
                            
        <DatasetAttributeView
            submission_tag={submission.tag}
            attributeTraits={submission.datasetAttributeValues}
            userUnitInput={submission.userUnitInput}
            onUserUnitInput={onUserUnitInput} />
    </div>
    
}