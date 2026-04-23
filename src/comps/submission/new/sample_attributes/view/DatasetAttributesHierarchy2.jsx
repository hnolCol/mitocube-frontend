import _ from "lodash"
import { Divider } from "@blueprintjs/core"
import TooltipButton from "../../../../core/base/buttons/TooltipButton"
import { objectHasKey } from "../../../../../services/objects/checks"
import { TraitWithValueInput } from "../../../../core/base/tags/TraitWithValueInput"
import { useGetAttribute, useGetAttributeHierarchy, useGetAttributeValues } from "../../../../../hooks/queries/attribute.hooks"
import { useGetSubmissionDatasetAttributesByTag } from "../../../../../hooks/queries/submission.hooks"
import Loading from "../../../../core/base/loading"
import { TitleText } from "../../../../core/metrics/ItemBasics"
import { StaticTrait } from "../../../../core/base/traits/StaticTrait"





/**
 * @description JSX component to visualize a hierarchical order of 
 * attributes. The level integer denotes the margin to the left border 
 * @param {Object} props 
 * @param {String} props.submission_tag 
 * @param {String} props.attribute_tag 
 * @param {String[]} props.children The attribute tags that are considered the children 
 * of the given attribute 
 * @param {Number} props.level The hierarchical level. The margin to the left border is determined as 0.75rem * level. 
 * @returns 
 */
export function AttributeHierarchy({submission_tag, attribute_tag, children, level = 0 }) {
    const { data: attribute, isSuccess } = useGetAttribute({ tag: attribute_tag }, {staleTime : 300000})
    const { data: traits, isSuccess : isTraitSuccess } = useGetAttributeValues({tags : submission_tag, attribute_tag},{staleTime : 300000})
    const marginLeft = level * 0.75


    return <div style={{ marginLeft : "0.1rem", paddingLeft: `${marginLeft}rem`}}>
        {isSuccess ? <TitleText key={attribute.tag} title={attribute.text} /> : null}
        <div className="flex">
        {isTraitSuccess &&  isSuccess
            && _.isArray(traits["attribute_value_tags"])
            && traits["attribute_value_tags"].length > 0 ?
                traits["attribute_value_tags"].map(traitTag => 
                    <StaticTrait attribute_tag={attribute_tag} trait_tag={traitTag} submission_tag={submission_tag} />
                ) : null}
        </div>
        {_.isArray(children) && children.length > 0 ?
            children.map(child => _.isObject(child) && _.has(child,"tag") ? <AttributeHierarchy
                    children={child.IS_PARENT_OF}
                    attribute_tag={child.tag}
                    submission_tag={submission_tag}
                    level={level + 1} /> : null) : null}
        </div>
}



/**
 * @description Represents dataset attributes in a hierarchy manner. The hierarchy is defined
 * by the attributes itself which have a property 'parent_tag'. 
 * @param {Object} props 
 * @param {String} props.submission-tag  
 * @returns 
 */
export function StaticDatasetAttributesHierarchy({ submission_tag }) {

    const { data: datasetAttributes, isLoading, isError, isFetched, isSuccess } = useGetSubmissionDatasetAttributesByTag({ tag: submission_tag }, { enabled: _.isString(submission_tag) })
    const { data: attrHierarchy, isSuccess: isHierarchySuccess } = useGetAttributeHierarchy(
        {
            tags: _.isObject(datasetAttributes) ? _.keys(datasetAttributes.tags) : [],
            submission_tag
        },
        { enabled: _.isObject(datasetAttributes) && isSuccess && !_.isEmpty(datasetAttributes.tags) })
    
    return (
        <div>
            {isFetched & isSuccess & _.isObject(datasetAttributes) ?
                    isHierarchySuccess && _.isArray(attrHierarchy) ? attrHierarchy.map(attrHierarchy => <AttributeHierarchy
                        key={attrHierarchy.tag}
                        attribute_tag={attrHierarchy.tag}
                        submission_tag={submission_tag}
                        children={attrHierarchy.IS_PARENT_OF} />) : null : <Loading /> }
            </div>
    )
}


export function AttributeFeatureTag({ attribute, value, units = {}, valueIsFeature = false, onRemove = undefined, popoverPosition = "top", addUnitsForDatasetAttributes, highlight = false, onUserUnitInput, unitInput}) {
    //console.log(units)
    return (
        valueIsFeature ? <FeatureTagWithTooltip {...{ attribute, feature: value, onRemove, popoverPosition, highlight  }} /> :
            <TraitWithValueInput {...{ attribute_tag: attribute.tag, attributeValue: value, onRemove, popoverPosition, addUnitsForDatasetAttributes, units, highlight, onUserUnitInput, unitInput}} />
    )
}


/**
 * 
 * @param {Object} props
 * @param {import("../../../../../types/attributes").Attribute} props.attribute - The actual attribute to visualize. 
 * @param {Object} props.attributeValuesByTag - The attribute values in an object where they key equals the tag. 
 * @param {Function} props.onDatasetAttributeRemove - Handles the removal of a tag (e.g. dataset attribute). If not provided, removal button is omitted. 
 * @param {Boolean} props.warnAtTwoAttrValues - If enabled, the user is warned if more than two attribute values are selected for an attribute. Since dataset attributes are not accessible to statistical evaluation.
 * @param {String[]} props.highlightAttributeValuesByTag - Tags that should be highlighted. This is useful to indicated changes made by the user. 
* @returns {Element} 
 */
function DisplayDatasetAttribute({ attribute, attributeValuesByTag, onDatasetAttributeRemove, addUnitsForDatasetAttributes, datasetUnits, level = 0, highlightAttributeValuesByTag = [], warnAtTwoAttrValues = false, onUserUnitInput,unitInput}) {
    // displaying hierarchical dataset attributes.
    const attributeHasFeatures = attribute.has_features_value
    const handleAttributeRemove = (attributeValue) => {
        //on attribute remove, we have to remove the child nodes otherwise 
        //a different attribute object is returned than provided 
        if (objectHasKey({ object: attribute, keyName : "childNodes"})) {
            delete attribute["childNodes"]
        }
        onDatasetAttributeRemove(attribute,attributeValue)
    }
    return (
        <div style={{marginLeft:`${level+0.5}rem`, marginBottom : level===0?"0.3rem":"0rem"}}>
            
            <div className="flex center-items" style={{ paddingBottom: "0.1rem" }}>
            <div style={{paddingRight : "0.1rem"}}>{attribute.text}:</div>
                {attributeValuesByTag[attribute.tag].map(attributeValue => <AttributeFeatureTag
                    key={`${attribute.tag}-${attributeHasFeatures?attributeValue.key:attributeValue.tag}`}
                    {...{
                        attribute,
                        units : _.has(datasetUnits,attributeValue.tag) ? datasetUnits[attributeValue.tag] : {},
                        value: attributeValue,
                        valueIsFeature: attributeHasFeatures,
                        onRemove: _.isFunction(onDatasetAttributeRemove) ? handleAttributeRemove : undefined,
                        addUnitsForDatasetAttributes,
                        highlight: highlightAttributeValuesByTag.includes(attributeValue.tag),
                        onUserUnitInput,
                        unitInput
                    }} />
                )}
                {attributeValuesByTag[attribute.tag].length > 1 && warnAtTwoAttrValues? <TooltipButton
                    content={<div><div>You defined two dataset attribute values for an attribute ({attribute.text}).</div><div>Consider adding them as sample attributes, otherwise they are not accessible to statistical tests.</div></div>}
                    icon="issue" small={false} intent="danger"/> : null}
                
                </div>
            {_.has(attribute,"childNodes") && attribute.childNodes.length > 0 ? attribute.childNodes.map(child =>
                <DisplayDatasetAttribute key={`${child.id}-${child.attribute_id}`} attribute={child} {...{ attributeValuesByTag, onDatasetAttributeRemove, addUnitsForDatasetAttributes, datasetUnits, unitInput, onUserUnitInput }} level={level + 1} />) : null}
        {level===0?<Divider />:null}
        </div>
    )
}


function DatasetAttributeHierarchy({ selectedAttributes, selectedDatasetAttributeValues, onDatasetAttributeRemove, highlightAttributeValuesByTag = [], warnAtTwoAttrValues = false, onUserUnitInput, unitInput}) {

    // const nestedAttributes = useMemo(() => createDataTree({
    //     array: selectedAttributes
    //         .filter(attr => _.has(selectedDatasetAttributeValues, attr.tag) && selectedDatasetAttributeValues[attr.tag].length > 0), link: "parent_tag"
    // }), [_.join(selectedAttributes.map(attr => attr.tag))])
    // console.log(nestedAttributes)
    // console.log(nestedAttributes,"nested shit")
    // console.log(selectedAttributes, nestedAttributes, selectedDatasetAttributeValues)
    return (
        <div className="padding--little div--round bg--lightgrey margin-top--little">
            



            {/* {nestedAttributes.map(attribute => {
                return (                
                    <DisplayDatasetAttribute
                        key={`${attribute.id}-level-0`}
                        attribute={attribute}
                        onDatasetAttributeRemove={onDatasetAttributeRemove}
                        attributeValuesByTag={selectedDatasetAttributeValues}
                        {...{
                            highlightAttributeValuesByTag,
                            warnAtTwoAttrValues,
                            onUserUnitInput,
                            unitInput
                        }} />  
                )
            })} */}


        </div>
    )
}

export default DatasetAttributeHierarchy