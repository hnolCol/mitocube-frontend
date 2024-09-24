import _ from "lodash"
import PropTypes from "prop-types"
import { createDataTree } from "../../../../../services/arrays/nest"
import { Code, Divider, H5, Tag, Tooltip } from "@blueprintjs/core"
import { Header } from "../../../../core/base/Header"
import TooltipButton from "../../../../core/base/buttons/TooltipButton"
import { objectHasKey } from "../../../../../services/objects/checks"
import { useMemo } from "react"
import { AttributeTagWithTooltip, FeatureTagWithTooltip } from "../../../../core/base/tags/TagWithTooltip"
import { useGetDatasetAttributes } from "../../../../../hooks/queries/attribute.hooks"
import { useGetSubmissionDatasetAttributesByTag } from "../../../../../hooks/queries/submission.hooks"
import Loading from "../../../../core/base/loading"
import { TitleText } from "../../../../core/metrics/ItemBasics"

/**
 * 
 * @param {Object} props 
 * @property {Attribute} props.attribute
 * @property {String[]} props.attributeValueTags 
 * @property {Object.<String,Attributevalue|Feature} props.attributeValuesByTag
 * @returns 
 */
export function AttributeWithValues({ attribute, attributeValueTags, attributeValuesByTag}) {
    return (
        <div>
            <TitleText title={attribute.text} />
            <div className="flex">
                {attributeValueTags.map(attribute_value_tag => {
                    return <AttributeFeatureTag
                        attribute={attribute}
                        value={attributeValuesByTag[attribute_value_tag]}
                        valueIsFeature={attribute.has_features_value} />
                })}
            </div></div>
        
    )
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
    const nestedAttributes = useMemo(() => isSuccess ? createDataTree({
        array: _.keys(datasetAttributes.tags).map(attribute_tag => datasetAttributes.attributes[attribute_tag]),
        link : "parent_tag"
    }) : [], [isSuccess])
    return (
        <div>
            {isFetched & isSuccess & _.isObject(datasetAttributes) ? _.keys(datasetAttributes.tags).map(attribute_tag => {
                const attribute = datasetAttributes.attributes[attribute_tag]
                return <AttributeWithValues
                    attribute={attribute}
                    attributeValueTags={datasetAttributes.tags[attribute_tag]}
                    attributeValuesByTag={datasetAttributes.attribute_values} />

            }) : isLoading ? <Loading /> : null}

        </div>
    )
}





export function AttributeFeatureTag({ attribute, value, units = {}, valueIsFeature = false, onRemove = undefined, popoverPosition = "top", addUnitsForDatasetAttributes, highlight = false}) {
    //console.log(units)

    return (
        valueIsFeature ? <FeatureTagWithTooltip {...{ attribute, feature: value, onRemove, popoverPosition, highlight  }} /> :
            <AttributeTagWithTooltip {...{ attribute, attributeValue: value, onRemove, popoverPosition, addUnitsForDatasetAttributes, units, highlight }} />
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
function DisplayDatasetAttribute({ attribute, attributeValuesByTag, onDatasetAttributeRemove, addUnitsForDatasetAttributes, datasetUnits, level = 0, highlightAttributeValuesByTag = [], warnAtTwoAttrValues = false}) {
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
                        highlight : highlightAttributeValuesByTag.includes(attributeValue.tag)
                    }} />
                )}
                {attributeValuesByTag[attribute.tag].length > 1 && warnAtTwoAttrValues? <TooltipButton
                    content={<div><div>You defined two dataset attribute values for an attribute ({attribute.text}).</div><div>Consider adding them as sample attributes, otherwise they are not accessible to statistical tests.</div></div>}
                    icon="issue" small={false} intent="danger"/> : null}
                
                </div>
            {_.has(attribute,"childNodes") && attribute.childNodes.length > 0 ? attribute.childNodes.map(child =>
                <DisplayDatasetAttribute key={`${child.id}-${child.attribute_id}`} attribute={child} {...{ attributeValuesByTag, onDatasetAttributeRemove, addUnitsForDatasetAttributes, datasetUnits }} level={level + 1} />) : null}
        {level===0?<Divider />:null}
        </div>
    )
}


// DatasetAttributeHierarchy.propTpyes = {
//     submissionID: PropTypes.string,
//     selectedAttributes: PropTypes.array.isRequired,
//     selectedDasetAttributeValues: PropTypes.func.isRequired,
//     onDatasetAttributeRemove : PropTypes.func.isRequired
// }

function DatasetAttributeHierarchy({ selectedAttributes, selectedDatasetAttributeValues, datasetUnits, onDatasetAttributeRemove, highlightAttributeValuesByTag = [], warnAtTwoAttrValues = false, addUnitsForDatasetAttributes}) {
    
    const nestedAttributes = useMemo(() => createDataTree({
        array: selectedAttributes
            .filter(attr => _.has(selectedDatasetAttributeValues, attr.tag) && selectedDatasetAttributeValues[attr.tag].length > 0), link: "parent_tag"
    }), [_.join(selectedAttributes.map(attr => attr.tag))])
    // console.log(nestedAttributes,"nested shit")
    // console.log(selectedAttributes, nestedAttributes, selectedDatasetAttributeValues)
    return (
        <div className="padding--little div--round bg--lightgrey intent-margin-top--little">
            
            {nestedAttributes.map(attribute => {
                return (                
                    <DisplayDatasetAttribute
                        key={`${attribute.id}-level-0`}
                        attribute={attribute}
                        onDatasetAttributeRemove={onDatasetAttributeRemove}
                        attributeValuesByTag={selectedDatasetAttributeValues}
                        {...{
                            highlightAttributeValuesByTag,
                            warnAtTwoAttrValues,
                            addUnitsForDatasetAttributes,
                            datasetUnits
                        }} />  
                )
            })}


        </div>
    )
}

export default DatasetAttributeHierarchy