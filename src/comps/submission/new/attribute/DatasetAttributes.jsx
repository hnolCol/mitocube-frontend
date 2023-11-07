import { Menu, MenuDivider, MenuItem } from "@blueprintjs/core"
import { Suggest } from "@blueprintjs/select"
import { filterArrayBySearchString } from "../../../../services/arrays/filter"
import { groupListByProperty } from "../../../../services/arrays/groupby"
import _ from "lodash"
import AttributeValueSelectionMenu from "./AttributeValueMenu"



function DatasetAttributeSelect({ attributes, attributeValues, handleDatasetAttributeSelection, handleFeatureSelection = undefined, searchColumns = ["details","name","tag","attribute_id_tag","attribute_id_name"]}) {

    const handleItemSelect = (attribute,attributeValue) => {
        //handle item select
        handleDatasetAttributeSelection(attribute, attributeValue)
    }

    const handleKeyDownSelect = (attributeValue) => {

        const attributeFromKey = attributes.filter(attr => attr.id === attributeValue.attribute_id)[0]
        handleItemSelect(attributeFromKey,attributeValue)
    }

    const renderItems = ({ activeItem, filteredItems, query}) => { 
        const attributeValuesByID = groupListByProperty(filteredItems, "attribute_id")
        // render items 
        return (
            <AttributeValueSelectionMenu {...{activeItem, attributes,attributeValuesByID,handleItemSelect, query, handleFeatureSelection}}/>

        )
    }

    const filterItems = (searchString, items) => {
        const filteredAttributeValues = filterArrayBySearchString({ array: items, searchColumns, searchString })
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