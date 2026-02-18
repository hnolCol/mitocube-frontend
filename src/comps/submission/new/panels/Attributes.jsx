import { DatasetAttributeView } from "../../../core/base/attributes/DatasetAttributeView";
import { AttributesInput } from "../../../core/input/api/DatasetAttributeInput";
import { MandatoryAttributes } from "../../MandatoryAttributes";
import _ from "lodash"
import { findAndInsertTree, findChildrenByPath, findPath, deleteByPath, checkPathExists } from "../sample_attributes/select/SamplesAttributeWrapper";

export function AttributesTab({submission, setSubmission, setComponentKey, componentKey }) {

    const getSelectionByPath = (path) => {
        const selection = findChildrenByPath(submission.selected_traits, path)
        // console.log(selection, "getSelectionByPath", submission.selected_traits, path)
        return selection
    }


    const findDataForPath = (path) => {
        const selection = findPath(submission.selected_traits, path)
        return selection
    }

    const handleTraitSelectionHierarchy = (path, row_idcs, single_child_level, single_child_type) => {
        console.log(path)
        let selected_traits = submission.selected_traits.slice() //mission.selected_traits
        //check if path exists in the selected traits
        const pathExists = checkPathExists(selected_traits, path, true)
        console.log(pathExists, "path exists", path)
        const isValueInput = _.last(path).type === "trait" && _.has(_.last(path), "value") && _.isString(_.last(path).value)
        // if it exists, delete it, if not, add it.
        if (pathExists && !isValueInput) {
            deleteByPath(selected_traits, path, true)
        }
        else {
            findAndInsertTree(selected_traits, path)
        }
        console.log(selected_traits, "selected traits after selection")
        setSubmission(prevValues => { return {...prevValues, selected_traits}})
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
         />
        {/* userUnitInput={submission.userUnitInput}
            onUserUnitInput={onUserUnitInput} */}
    </div>
    
}