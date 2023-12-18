import { Menu, MenuDivider, MenuItem } from "@blueprintjs/core";
import _ from "lodash"
import { filterArrayBySearchString } from "../../../../../services/arrays/filter";
import { useMemo } from "react";
import { objectHasKey } from "../../../../../services/objects/checks";
import NumericValueInput from "../../../../core/input/Numeric";
import { createFakeAttributeValue } from "../../../../../services/attributes";


function AttributeValueSelectionMenu({activeItem, attributes, filteredAttributeValuesByID, attributeValuesByID, handleItemSelect, maxItems = 10, query = "", handleFeatureSelection = undefined}) {
    
    const attributesMatch = !_.isEmpty(attributeValuesByID)
    const attributeIDsMatchingQuery = useMemo(() => {
        if (query === "") return Object.fromEntries(attributes.map(attr => [attr.id,attr.id]))
        return Object.fromEntries(filterArrayBySearchString({ array: attributes, searchString: query, keyNames: ["tag", "text"]}).map(attr => [attr.id,attr.tag]))
    }, [query])

    const attributeMatch = !_.isEmpty(attributeIDsMatchingQuery)

    const handleNumericInput = (numericInput, attrValues, attribute) => {
        const attributeAlreadyPresent = attrValues.filter(attrValue => attrValue.text === _.toString(numericInput))
        if (attributeAlreadyPresent.length > 0) {
            const attrValueMatches = attributeAlreadyPresent[0]
            handleItemSelect(attribute, attrValueMatches)
        }
        else {
            handleItemSelect(attribute, createFakeAttributeValue({ ...{ attribute, numericInput } }))
        }
    }

    return (
        <Menu small={true}>
            {!attributesMatch && !attributeMatch? <MenuItem text="No attributes found ..." disabled={true} /> :
                attributes.map(attribute => {
                    const attributeID = attribute.has_features_value? -1 : attribute.id
                    const attrValues = _.has(filteredAttributeValuesByID, attribute.id) ? filteredAttributeValuesByID[attributeID] : []
                    const attributeMatchesQuery = objectHasKey({ object: attributeIDsMatchingQuery, keyName: attribute.id })
                    const hasAttrValues = attrValues.length > 0                    
                    if (attribute.has_numeric_input && attributeMatchesQuery)  return <div>
                        <MenuItem text={`Enter numeric value for ${attribute.text}`} disabled={true} />
                        <MenuDivider />
                        {hasAttrValues ? 
                            attrValues.map((attributeValue, index) => <MenuItem
                                key={`${attribute.tag}-${attributeValue.tag}`}
                                text={attributeValue.text}
                                onClick={() => handleItemSelect(attribute, attributeValue)}
                                labelElement={<div className="labelelement-wrap--fixed-width">{attributeValue.description}</div>}/>) : 
                            null}
                        {hasAttrValues ? <MenuDivider /> : null}
                        <NumericValueInput
                            key={`${attribute.tag}-numeric-input`}
                            placeholder={`${attribute.text}`}
                            fill={false}
                            callbackKey={attribute.tag}
                            submitButton={true}
                            buttonProps={{
                                intent: "primary",
                                icon: "rocket"
                            }}
                            onButtonClick={(attributeTag, numericInput) => handleNumericInput(numericInput,attrValues,attribute)} //create fake attribute value for numeric inputs
                    />
                        </div>
                    if (!hasAttrValues && !attribute.has_features_value) return null
                    //hide attribute values that are not featureu and were not found.
                    if (attribute.has_features_value && !attributeMatchesQuery) return null
                    return (
                        <div key={`${attribute.tag}`}>
                            <MenuItem text={attribute.text} disabled={true} />
                            <MenuDivider />
                            
                            {attribute.has_features_value && attributeMatchesQuery?
                                <MenuItem text={`Select feature for ${attribute.text}`} onClick={() => handleFeatureSelection({attribute})} /> :
                                
                                <div style={{ overflowY: "visible" }}>
                                {attrValues.map((attributeValue, index) =>
                                    index === maxItems + 1 ? <MenuItem
                                        key={`${attribute.tag}-${attributeValue.tag}`}
                                        text=" . . . not all items shown, please use the search function.."
                                        disabled={true} /> : index > maxItems + 1 ? null :
                                        <MenuItem
                                            active={activeItem.id === attributeValue.id}
                                            key={`${attributeValue.text}-${attributeValue.tag}`}
                                            text={attributeValue.text}
                                            labelElement={<div className="labelelement-wrap--fixed-width">{attributeValue.description}</div>}
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