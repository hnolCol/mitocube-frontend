import { Menu, MenuDivider, MenuItem } from "@blueprintjs/core";
import _ from "lodash"
import { filterArrayBySearchString } from "../../../../services/arrays/filter";
import { useMemo } from "react";
import { objectHasKey } from "../../../../services/objects/checks";
import NumericValueInput from "../../../core/input/Numeric";

function AttributeValueSelectionMenu({activeItem, attributes, attributeValuesByID, handleItemSelect, maxItems = 10, query = "", handleFeatureSelection = undefined}) {
    const attributesMatch = !_.isEmpty(attributeValuesByID)

    const attributeIDsMatchingQuery = useMemo(() => {
        if (query === "") return Object.fromEntries(attributes.map(attr => [attr.id,attr.id]))
        return Object.fromEntries(filterArrayBySearchString({ array: attributes, searchString: query, searchColumns: ["tag", "name"]}).map(attr => [attr.id,attr.tag]))
    }, [query])

    const attributeMatch = !_.isEmpty(attributeIDsMatchingQuery)

    return (
        <Menu>
            {!attributesMatch && !attributeMatch? <MenuItem text="No attributes found ..." disabled={true} /> :
                attributes.map(attribute => {
                    const attributeID = attribute.allow_features_as_values? -1 : attribute.id
                    const attrValues = _.has(attributeValuesByID, attribute.id) ? attributeValuesByID[attributeID] : []
                    const attributeMatchesQuery = objectHasKey({ object: attributeIDsMatchingQuery, keyName : attribute.id })
                    if (attrValues.length === 0 && !attribute.allow_features_as_values && attributeMatchesQuery) return <NumericValueInput
                                                key={`${attribute.tag}-numeric-input`}
                                                placeholder={`${attribute.name}`}
                                                callbackKey={attribute.tag}
                                                submitButton={true}
                                                buttonProps={{
                                                    intent: "primary",
                                                    icon: "rocket"
                                                }}
                        onButtonClick={(attributeTag, numericInput) => handleItemSelect(attribute, {id : -1, attribute_id : attribute.id , tag: `${attribute.tag}:${numericInput}`, name : `${numericInput}`})} //create fake attribute value for numeric inputs
                                                />
                    if (attrValues.length === 0 && !attribute.allow_features_as_values) return null
                    //hide attribute values that are not featureu and were not found.
                    if (!attributeMatchesQuery) return []
                    return (
                        <div key={`${attribute.tag}`}>
                            <MenuItem text={attribute.name} disabled={true} />
                            <MenuDivider />
                            
                            {attribute.allow_features_as_values ?
                                <MenuItem text={`Select feature for ${attribute.name}`} onClick={() => handleFeatureSelection(attribute)} /> :
                                
                                <div style={{ overflowY: "visible" }}>
                                {attrValues.map((attributeValue, index) =>
                                    index === maxItems + 1 ? <MenuItem
                                        key={`${attribute.tag}-${attributeValue.tag}`}
                                        text=" . . . not all items shown, please use the search function.."
                                        disabled={true} /> : index > maxItems + 1 ? null :
                                        <MenuItem
                                            active={activeItem.id === attributeValue.id}
                                            key={`${attributeValue.name}-${attributeValue.tag}`}
                                            text={attributeValue.name}
                                            labelElement={<div style={{ width: "18rem" }}>{attributeValue.details}</div>}
                                            onClick={() => handleItemSelect(attribute, attributeValue)} />)
                                }
                            </div>}
                        </div>
                    )    
                
                })}
                
                </Menu>
    )
}

export default AttributeValueSelectionMenu