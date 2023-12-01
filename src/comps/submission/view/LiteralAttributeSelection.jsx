import { useGetSubmissionAttributes } from "../../../hooks/queries/submission.hooks"
import { createDataTree } from "../../../services/arrays/nest"
import Loading from "../../core/base/loading"
import _ from "lodash"
import AttributeInput from "../new/attribute/select/MultiSelectAttribute"
import { groupListByProperty } from "../../../services/arrays/groupby"
import { randomColor } from "../../../services/colors"
import { addItemToArrayOrRemoveItIfPresent } from "../../../services/arrays/transforms"
import { createFakeAttributeValue } from "../../../services/attributes"



function HierarchicalAttributeSelection({attribute, attributeValues, onItemSelect,onItemCreate, attributeValuesByID, selectedAttributes, level = 0, attributeBlockColor = undefined}) {
    const hasChildren = attribute.childNodes.length > 0
    const hasAttrValues = _.isArray(attributeValues) && attributeValues.length > 0 
    const allowNumericInput = attribute.allow_numeric_input 
    const nextLevel = level + 1
    const blockColor = level == 0 ? randomColor() : attributeBlockColor
    const mandatoryForActive = attribute.mandatory_for_active
    const headerText = mandatoryForActive ? `${attribute.name} (required)` : attribute.name
    return (
        <div className="" style={{paddingLeft : `${level*0.8}rem`,  paddingLeft : "1rem"}}> 
            {level == 0 ? <h4>{headerText}</h4> : <h5>{headerText}</h5>}
            {/* borderLeft : `3px solid #${blockColor}`, */}
            <AttributeInput {...{
                attributeValues : hasAttrValues ? attributeValues : [],
                attribute, onItemCreate,onItemSelect}}
                key={`${attribute.name}-${attribute.id}-mandatory`}
                helperText={""}
                selectedItems={_.has(selectedAttributes,attribute.tag)?selectedAttributes[attribute.tag]:[]}
                inline={false}
                showLabel={false}
                onRemove={onItemSelect} /> 
            {/* {allowNumericInput && hasAttrValues} <div></div>
            {allowNumericInput ? <NumericValueInput hint={attribute.name} />:null} */}
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



export function LiteralAttributeSelection({ selectedAttributes, setSelectedAttributes, attributeFilter}) {
    //attribute selection
    const { data: attrs, isLoading, isFetching } = useGetSubmissionAttributes()
    if (isLoading || isFetching) return <Loading />
    if (!_.isObject(attrs)) return 
    const {attributes, attribute_values } = attrs
    const attributeMatchingFilter = _.filter(attributes, attributeFilter)
    const attributeValuesByID = groupListByProperty(attribute_values,"attribute_id")
    const nestedAttributes = createDataTree({array :attributeMatchingFilter , link : "parent_id"})

    const onItemSelect = (attribute, attributeValue) => {
        //update selection
        selectedAttributes[attribute.tag] ??= []
        const updatedAttrValues = addItemToArrayOrRemoveItIfPresent({ array: selectedAttributes[attribute.tag], item: attributeValue })
        setSelectedAttributes(prevValues => { return {...prevValues, [attribute.tag] : updatedAttrValues}})
    }

    const onItemCreate = (attribute, numericInput) => {
        //some attribute have the allow_numeric_input and allow to enter the user a numeric value
        onItemSelect(attribute, createFakeAttributeValue({ attribute, numericInput }))
    }
    return  <div>
        {nestedAttributes.map(attribute => {
            return <div key={attribute.tag} className="margin--little" style={{marginTop : "1rem"}}>
                <HierarchicalAttributeSelection {...{
                attribute,
                attributeValues: attributeValuesByID[attribute.id],
                attributeValuesByID,
                onItemSelect,
                onItemCreate,
                selectedAttributes,
                
            }} /></div>
            

        })}
        </div>
}