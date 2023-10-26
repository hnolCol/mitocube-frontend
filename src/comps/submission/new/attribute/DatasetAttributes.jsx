import { Menu, MenuDivider, MenuItem } from "@blueprintjs/core"
import { Suggest } from "@blueprintjs/select"
import { filterArrayBySearchString } from "../../../../services/arrays/filter"
import { groupListByProperty } from "../../../../services/arrays/groupby"
import _ from "lodash"
import AttributeValueSelectionMenu from "./AttributeValueMenu"



function DatasetAttributeContextMenuSearch({ attributes, attributeValuesByID }) {
    return (
        <Menu style={{ overflowY: "scroll", maxHeight: "300px" }}>
                {attributes.map(attribute => {
                    const attributeValuesAsArray = _.has(attributeValuesByID, attribute.id) && _.isArray(attributeValuesByID[attribute.id]) && attributeValuesByID[attribute.id].length > 0
                    //console.log(attributeValuesAsArray)
                    return (
                        attributeValuesAsArray ? 
                            <Menu>
                                <MenuItem text={attribute} disabled={true} />
                                {
                                    attributeValuesByID[attribute.id].map(attributeValue => {
                                       // console.log(attributeValue)
                                        return (
                                            <MenuItem text={attributeValue.tag} label={attributeValue.details} />
                                        )
                                    })
                                }
                            </Menu> : null 
                    
                    )
                })}
            </Menu>
    )
}


function DatasetAttributeSelect({ attributes, attributeValues, handleDatasetAttributeSelection}) {

    const handleItemSelect = (attribute,attributeValue) => {
        //handle item select
        handleDatasetAttributeSelection(attribute, attributeValue)
    }

    const handleKeyDownSelect = (attributeValue) => {

        const attributeFromKey = attributes.filter(attr => attr.id === attributeValue.attribute_id)[0]
        handleItemSelect(attributeFromKey,attributeValue)
    }

    const renderItems = ({ activeItem, filteredItems}) => { 
        const attributeValuesByID = groupListByProperty(filteredItems, "attribute_id")
        // render items 
        return (
            <AttributeValueSelectionMenu {...{activeItem, attributes,attributeValuesByID,handleItemSelect}}/>

            //<DatasetAttributeContextMenuSearch {...{ attributes, attributeValuesByID } } />
        )
    }

    const filterItems = (searchString) => {
        const filteredAttributeValues = filterArrayBySearchString({ array: attributeValues, searchColumns: ["details","name","tag"], searchString })
         return filteredAttributeValues
    }

    return (
        <Suggest
            onItemSelect={item => handleKeyDownSelect(item)}
            inputValueRenderer={(item) => ""}
            popoverProps={{ matchTargetWidth : true, minimal: true}}
            items={attributeValues}
            itemListRenderer={renderItems}
            itemListPredicate={filterItems}
        />
    )
}


export default DatasetAttributeSelect