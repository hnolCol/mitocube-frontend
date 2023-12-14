import { Suggest } from "@blueprintjs/select"
import { filterArrayBySearchString } from "../../../../../services/arrays/filter"
import { groupListByProperty } from "../../../../../services/arrays/groupby"
import _ from "lodash"
import AttributeValueSelectionMenu from "./AttributeValueMenu"



function DatasetAttributeSelect({ attributes, attributeValues, attributeValuesByID, handleDatasetAttributeSelection, handleFeatureSelection = undefined, keyNamesForFilter = ["description", "text", "tag", "attribute_id_tag", "attribute_id_name"] }) {
    //handles the selection of a dataset attribute 
    
    const handleItemSelect = (attribute, attributeValue) => {
        //handle item select
        handleDatasetAttributeSelection(attribute, attributeValue)
    }

    const handleKeyDownSelect = (attributeValue) => {

        const attributeFromKey = attributes.filter(attr => attr.id === attributeValue.attribute_id)[0]
        handleItemSelect(attributeFromKey, attributeValue)
    }

    const renderItems = ({ activeItem, filteredItems, query }) => {
        const filteredAttributeValuesByID = groupListByProperty(filteredItems, "attribute_id")

        // render items 
        return (
            <AttributeValueSelectionMenu {...{
                activeItem,
                attributes,
                filteredAttributeValuesByID,
                attributeValuesByID,
                handleItemSelect,
                query,
                handleFeatureSelection
            }} />

        )
    }

    const filterItems = (searchString, items) => {
        const filteredAttributeValues = filterArrayBySearchString({array: items, keyNames : keyNamesForFilter, searchString})
        return filteredAttributeValues
    }
    return (
        <Suggest
            resetOnSelect={true}
            resetOnClose={true}
            scrollToActiveItem={true}
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