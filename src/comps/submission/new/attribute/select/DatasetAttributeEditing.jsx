import { createDataTree } from "../../../../../services/arrays/nest"
import Loading from "../../../../core/base/loading"
import _ from "lodash"
import AttributeInput from "./MultiSelectAttribute"
import { groupListByProperty } from "../../../../../services/arrays/groupby"
import { randomColor } from "../../../../../services/colors"
import { addItemToArrayOrRemoveItIfPresent } from "../../../../../services/arrays/transforms"
import { createFakeAttributeValue } from "../../../../../services/attributes"



function HierarchicalAttributeSelection({attribute, attributeValues, onItemSelect,onItemCreate, attributeValuesByID, selectedAttributes, level = 0, attributeBlockColor = undefined}) {
    const hasChildren = attribute.childNodes.length > 0
    const hasAttrValues = _.isArray(attributeValues) && attributeValues.length > 0 
    // const allowNumericInput = attribute.has_numeric_input 
    const nextLevel = level + 1
    const blockColor = level == 0 ? randomColor() : attributeBlockColor
    const mandatoryForActive = attribute.mandatory_for_active
    const headerText = mandatoryForActive ? `${attribute.text} (required)` : attribute.text
    return (
        <div className="" style={{paddingLeft : `${level*0.8}rem`}}> 
            {level == 0 ? <h4>{headerText}</h4> : <h5>{headerText}</h5>}
            {/* borderLeft : `3px solid #${blockColor}`, */}
            <AttributeInput {...{
                attributeValues : hasAttrValues ? attributeValues : [],
                attribute, onItemCreate,onItemSelect}}
                key={`${attribute.text}-${attribute.id}-mandatory`}
                helperText={""}
                selectedItems={_.has(selectedAttributes,attribute.tag)?selectedAttributes[attribute.tag]:[]}
                inline={false}
                showLabel={false}
                onRemove={onItemSelect} /> 
            {/* {allowNumericInput && hasAttrValues} <div></div>
            {allowNumericInput ? <NumericValueInput hint={attribute.text} />:null} */}
            {hasChildren ? <div className="flex flex-column">{attribute.childNodes.map(nodeAttribute => <HierarchicalAttributeSelection
                {...{
                    attribute: nodeAttribute,
                    attributeValues: attributeValuesByID[nodeAttribute.id],
                    onItemSelect,
                    onItemCreate,
                    selectedAttributes,
                    attributeValuesByID,
                    level: nextLevel,
                    key : `${nodeAttribute.tag}-child-node`,
                    attributeBlockColor: blockColor,
                }} />)}</div> : null}
        </div>
    )
}


