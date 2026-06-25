import { DatasetAttributeView } from "../../../core/base/attributes/DatasetAttributeView";
import { AttributesInput } from "../../../core/input/api/DatasetAttributeInput";
import { MandatoryAttributes } from "../../MandatoryAttributes";
import _ from "lodash"
import { findAndInsertTree, findChildrenByPath, findPath, deleteByPath, checkPathExists, addIDToPath, findNode } from "../sample_attributes/select/SamplesAttributeWrapper";

export function AttributesTab({submission, setSubmission, setComponentKey, componentKey }) {
    console.log(submission.selected_traits)

    const getSelectionByPath = (path) => {
        const selection = findChildrenByPath(submission.selected_traits, path)
        return selection
    }


    const findDataForPath = (path) => {
        path = addIDToPath(path, submission.tag)
        const selection = findPath(submission.selected_traits, path)
        return selection
    }

    const handleTraitSelectionHierarchy = (path, rowIndex, enforceSingleVariantPerGroup = false, replaceChildrenAtLeaf  = false) => {
        //row index is just for the table, not used here.
        console.log(path,enforceSingleVariantPerGroup)

        path = addIDToPath(path, submission.tag)
        let selected_traits = submission.selected_traits.slice() //mission.selected_traits
        //check if path exists in the selected traits
        const pathExists = checkPathExists(selected_traits, path, true)
        const isValueInput = _.last(path).type === "trait" && _.has(_.last(path), "value") && _.isString(_.last(path).value)
        // if it exists, delete it, if not, add it.
        if (pathExists && !isValueInput) {
            deleteByPath(selected_traits, path, true)
        }
        else {
            findAndInsertTree(selected_traits, path, {
                enforceSingleVariantPerGroup,
                replaceChildrenAtLeaf
                            })
        }
        setSubmission(prevValues => { return {...prevValues, selected_traits}})
    }

     const checkAttributeRequiredTraits = (attribute_tag, trait_tags, referenceID) => {
            let selected_traits = submission.selected_traits.slice()
            const foundNode = trait_tags.map(trait_tag => findNode(selected_traits, "trait", trait_tag, referenceID))
            return _.some(foundNode)
        }

    
    return <div>
        <h3>Dataset Attributes</h3>
        <p>Dataset attributes describe the dataset and are valid for all samples.
            As an example, if you have a project that uses the same cell line throughout the study, the cell line should be added here.</p>
        <p>Other examples are: Tissue, Lysis buffer and Cell culture media. If you compare two or more genotypes to each other, the genotype should be defined as a samples attributes.</p>
        
        <MandatoryAttributes
            findPath={findDataForPath}
            getSelectionByPath={getSelectionByPath}
            selected_traits={submission.selected_traits}
            onAttributeValueSelect={handleTraitSelectionHierarchy} /> 
        
        <AttributesInput
            handleTraitSelection = {handleTraitSelectionHierarchy}
            min_state={submission.state}
            selected_traits={submission.selected_traits} />
                            
        <DatasetAttributeView
            getSelectionByPath={getSelectionByPath}
            submission_tag={submission.tag}
            attributeTraits={submission.selected_traits}
            onChildrenSelection={handleTraitSelectionHierarchy}
            handleTraitRemove={handleTraitSelectionHierarchy}
            checkAttributeRequiredTraits={checkAttributeRequiredTraits}
         />
        {/* userUnitInput={submission.userUnitInput}
            onUserUnitInput={onUserUnitInput} */}
    </div>
    
}