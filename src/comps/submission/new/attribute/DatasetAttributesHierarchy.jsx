import _ from "lodash"
import { createDataTree } from "../../../../services/arrays/nest"
import { Code, H5, Tag } from "@blueprintjs/core"
import { Header } from "../../../core/base/Header"
import TooltipButton from "../../../core/base/buttons/TooltipButton"



function DisplayDatasetAttribute({ attribute, attributeValuesByID, level = 0 }) {
    // displaying hierarchical dataset attributes.
    return (
        <div style={{marginLeft:`${level+0.5}rem`, marginBottom : level===0?"0.5rem":"0rem"}}>
            <Header text= {attribute.name} hexColor={"#000000"} fontSize="0.85rem"/>
                <div className="flex" style={{paddingBottom: "0.2rem"}}>
                {attributeValuesByID[attribute.id].map(attributeValue => <Tag
                    key={`${attributeValue.name}-${attributeValue.id}`}
                    style={{ marginRight: "0.4rem" }}
                    onRemove={e => console.log(e)}
                    minimal={true}
                    large={true}>
                        {attributeValue.name}
                </Tag>)}
                {attributeValuesByID[attribute.id].length > 1 ? <TooltipButton
                    content={<div><div>You defined two dataset attributes.</div><div>Consider adding them as sample attributes, otherwise they are not accessible to statistical tests.</div></div>}
                    icon="issue" small={false} intent="danger"/> : null}
                
                </div>
            {attribute.childNodes.length > 0 ? attribute.childNodes.map(child =>
                <DisplayDatasetAttribute key={`${child.id}-${child.attribute_id}`} attribute={child} attributeValuesByID={attributeValuesByID} level={level + 1} />) : null}
        {level===0?<hr/>:null}
        </div>
    )
}

function DatasetAttributeHierarchy({submissionID, selectedAttributes, selectedDasetAttributeValues}) {
    //show dataet attributes
    const nestedAttributes =createDataTree({array: selectedAttributes,link: "parent_id" })
    return (
        <div className="padding--little div--round bg--lightgrey intent-margin-top--little">
            {nestedAttributes.map(attribute => {
                return (                
                    <DisplayDatasetAttribute
                        key={`${attribute.id}-level-0`}
                        attribute={attribute}
                        attributeValuesByID={selectedDasetAttributeValues} />  
                )
            })}


        </div>
    )
}

export default DatasetAttributeHierarchy