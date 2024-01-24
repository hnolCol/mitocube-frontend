import _ from "lodash"
import PropTypes from "prop-types"
import { createDataTree } from "../../../../../services/arrays/nest"
import { Code, Divider, H5, Tag, Tooltip } from "@blueprintjs/core"
import { Header } from "../../../../core/base/Header"
import TooltipButton from "../../../../core/base/buttons/TooltipButton"
import { objectHasKey } from "../../../../../services/objects/checks"
import { useMemo } from "react"
import { AttributeTagWithTooltip, FeatureTagWithTooltip } from "../../../../core/base/tags/TagWithTooltip"


export function AttributeFeatureTag({ attribute, value, valueIsFeature = false, onRemove = undefined}) {
    
    return (
        valueIsFeature ? <FeatureTagWithTooltip {...{attribute,feature : value, onRemove}} /> : <AttributeTagWithTooltip {...{attribute, attributeValue : value, onRemove}}/>
        // <
        // <Tooltip content={}>
        // <Tag
        //     key={valueIsFeature?`${attributeValue.uniprot_id}`: `${attributeValue.text}-${attributeValue.id}`}
        //     intent={highlightAttributeValuesByTag.includes(attributeValue.tag)?"primary": "none"}
        //     style={{ marginRight: "0.4rem" }}
        //     onRemove={_.isFunction(onDatasetAttributeRemove)?e => handleAttributeRemove(attributeValue):undefined}
        //     minimal={true}
        //     large={false}>
        //         {valueIsFeature?attributeValue.gene_name:attributeValue.text}
        //     </Tag>
        // </Tooltip>
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
function DisplayDatasetAttribute({ attribute, attributeValuesByTag, onDatasetAttributeRemove, level = 0, highlightAttributeValuesByTag = [], warnAtTwoAttrValues = false}) {
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
                    key={`${attribute.tag}-${attributeHasFeatures?attributeValue.uniprot_id:attributeValue.tag}`}
                    {...{
                        attribute,
                        value: attributeValue,
                        valueIsFeature: attributeHasFeatures,
                        onRemove : _.isFunction(onDatasetAttributeRemove)?handleAttributeRemove:undefined
                    }} />
                    // <Tag
                    // key={attribute.has_features_value?`${attributeValue.uniprot_id}`: `${attributeValue.text}-${attributeValue.id}`}
                    // intent={highlightAttributeValuesByTag.includes(attributeValue.tag)?"primary": "none"}
                    // style={{ marginRight: "0.4rem" }}
                    // onRemove={_.isFunction(onDatasetAttributeRemove)?e => handleAttributeRemove(attributeValue):undefined}
                    // minimal={true}
                    // large={false}>
                    //     {attribute.has_features_value?attributeValue.gene_name:attributeValue.text}
                    // </Tag>
                )}
                {attributeValuesByTag[attribute.tag].length > 1 && warnAtTwoAttrValues? <TooltipButton
                    content={<div><div>You defined two dataset attribute values for an attribute ({attribute.text}).</div><div>Consider adding them as sample attributes, otherwise they are not accessible to statistical tests.</div></div>}
                    icon="issue" small={false} intent="danger"/> : null}
                
                </div>
            {_.has(attribute,"childNodes") && attribute.childNodes.length > 0 ? attribute.childNodes.map(child =>
                <DisplayDatasetAttribute key={`${child.id}-${child.attribute_id}`} attribute={child} {...{ attributeValuesByTag, onDatasetAttributeRemove}} level={level + 1} />) : null}
        {level===0?<Divider />:null}
        </div>
    )
}


DatasetAttributeHierarchy.propTpyes = {
    submissionID: PropTypes.string,
    selectedAttributes: PropTypes.array.isRequired,
    selectedDasetAttributeValues: PropTypes.func.isRequired,
    onDatasetAttributeRemove : PropTypes.func.isRequired
}

function DatasetAttributeHierarchy({ selectedAttributes, selectedDasetAttributeValues, onDatasetAttributeRemove, highlightAttributeValuesByTag = [], warnAtTwoAttrValues = false }) {
    //show dataet attributes
    const nestedAttributes = useMemo(() => createDataTree({ array: selectedAttributes.filter(attr => selectedDasetAttributeValues[attr.tag].length > 0), link: "parent_id" }), [_.join(selectedAttributes.map(attr => attr.tag))])
    return (
        <div className="padding--little div--round bg--lightgrey intent-margin-top--little">
            
            {nestedAttributes.map(attribute => {
                return (                
                    <DisplayDatasetAttribute
                        key={`${attribute.id}-level-0`}
                        attribute={attribute}
                        onDatasetAttributeRemove={onDatasetAttributeRemove}
                        attributeValuesByTag={selectedDasetAttributeValues}
                        {...{highlightAttributeValuesByTag,warnAtTwoAttrValues}} />  
                )
            })}


        </div>
    )
}

export default DatasetAttributeHierarchy