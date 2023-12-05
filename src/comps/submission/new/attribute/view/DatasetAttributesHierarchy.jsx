import _ from "lodash"
import PropTypes from "prop-types"
import { createDataTree } from "../../../../../services/arrays/nest"
import { Code, H5, Tag } from "@blueprintjs/core"
import { Header } from "../../../../core/base/Header"
import TooltipButton from "../../../../core/base/buttons/TooltipButton"
import { objectHasKey } from "../../../../../services/objects/checks"
import { useMemo } from "react"



function DisplayDatasetAttribute({ attribute, attributeValuesByTag, onDatasetAttributeRemove, level = 0}) {
    // displaying hierarchical dataset attributes.

    const handleAttributeRemove = (attributeValue) => {
        //on attribute remove, we have to remove the child nodes otherwise 
        //a different attribute object is returned than provided 
        if (objectHasKey({ object: attribute, keyName : "childNodes"})) {
            delete attribute["childNodes"]
        }
        onDatasetAttributeRemove(attribute,attributeValue)
    }
    return (
        <div style={{marginLeft:`${level+0.5}rem`, marginBottom : level===0?"0.5rem":"0rem"}}>
            <h5>{attribute.name}</h5>
            <div className="flex" style={{ paddingBottom: "0.2rem" }}>
                
                {attributeValuesByTag[attribute.tag].map(attributeValue => <Tag
                    key={`${attributeValue.name}-${attributeValue.id}`}
                    style={{ marginRight: "0.4rem" }}
                    onRemove={e => handleAttributeRemove(attributeValue)}
                    minimal={true}
                    large={false}>
                        {attributeValue.name}
                </Tag>)}
                {attributeValuesByTag[attribute.tag].length > 1 ? <TooltipButton
                    content={<div><div>You defined two dataset attribute values for an attribute ({attribute.name}).</div><div>Consider adding them as sample attributes, otherwise they are not accessible to statistical tests.</div></div>}
                    icon="issue" small={false} intent="danger"/> : null}
                
                </div>
            {_.has(attribute,"childNodes") && attribute.childNodes.length > 0 ? attribute.childNodes.map(child =>
                <DisplayDatasetAttribute key={`${child.id}-${child.attribute_id}`} attribute={child} {...{ attributeValuesByTag, onDatasetAttributeRemove}} level={level + 1} />) : null}
        {level===0?<hr/>:null}
        </div>
    )
}


DatasetAttributeHierarchy.propTpyes = {
    submissionID: PropTypes.string,
    selectedAttributes: PropTypes.array.isRequired,
    selectedDasetAttributeValues: PropTypes.func.isRequired,
    onDatasetAttributeRemove : PropTypes.func.isRequired
}

function DatasetAttributeHierarchy({selectedAttributes, selectedDasetAttributeValues, onDatasetAttributeRemove}) {
    //show dataet attributes
    const nestedAttributes = useMemo(() => createDataTree({ array: selectedAttributes.filter(attr => selectedDasetAttributeValues[attr.tag].length > 0), link: "parent_id" }), [_.join(selectedAttributes.map(attr => attr.tag))])
    return (
        <div className="padding--little div--round bg--lightgrey intent-margin-top--little" style={{ maxHeight: "600px", overflow: "scroll" }}>
            
            {nestedAttributes.map(attribute => {
                return (                
                    <DisplayDatasetAttribute
                        key={`${attribute.id}-level-0`}
                        attribute={attribute}
                        onDatasetAttributeRemove={onDatasetAttributeRemove}
                        attributeValuesByTag={selectedDasetAttributeValues} />  
                )
            })}


        </div>
    )
}

export default DatasetAttributeHierarchy