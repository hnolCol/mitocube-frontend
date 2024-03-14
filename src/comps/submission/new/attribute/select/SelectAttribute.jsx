
import { Menu, MenuItem } from "@blueprintjs/core"
import { Select } from "@blueprintjs/select"
import PropTypes from "prop-types"
import _ from "lodash"

import SimpleTag from "../../../../core/base/tags/SimpleTag"
import { filterArrayBySearchString } from "../../../../../services/arrays/filter"
import { AttributeFeatureTag } from "../view/DatasetAttributesHierarchy"



SingleAttributeInput.propTypes = {
    attribute : PropTypes.object.isRequired,
    attributes: PropTypes.arrayOf(PropTypes.object),
    searchColumns : PropTypes.array,
    disabled: PropTypes.bool,
    matchTargetWidth: PropTypes.bool,
    maxItemsShown: PropTypes.number,
    minimumSearchStringLength: PropTypes.number,
    handleFeatureSelection: PropTypes.func,
    featureSelectionProps : PropTypes.object,
    onItemSelect: PropTypes.func.isRequired,
}


function SingleAttributeInput({ attribute,
    attributeValues,
    isRequired = true,
    selectedItems = [],
    onItemSelect = undefined,
    onRemove = undefined,
    helperText = "",
    matchTargetWidth = true,
    searchColumns = ["text", "details"],
    maxItemsShown = 30,
    minimumSearchStringLength = 2,
    handleFeatureSelection,
    featureSelectionProps = {},
    disabled = false, ...rest }) {
    //Atribute Input
    const selectedItemsIDs = selectedItems.filter(item => _.isObject(item) && _.has(item,"id")).map(item => item.id)
    const renderItems = ({ activeItem, filteredItems, query, ...rest}) => {
        
        if (attribute.has_features_value && attributeValues.length === 0) { //useful to check attributeValues?
            return <Menu>
                <MenuItem text="Select protein feature..." onClick={() => handleFeatureSelection({attribute, ...featureSelectionProps})}/>
            </Menu>
        }

        return <Menu>
            {filteredItems.map((attrValue, attrIdx) => {
                if (attrIdx < maxItemsShown) return <MenuItem
                    key={`${attrValue.id}-${attribute.tag}`}
                    icon={selectedItemsIDs.includes(attrValue.id)?"tick":"blank"}
                    selected={selectedItemsIDs.includes(attrValue.id)}
                    active={activeItem.id === attrValue.id}
                    multiline={true}
                    text={attrValue.text}
                    onClick={() => onItemSelect(attribute, attrValue)}
                    labelElement={<div className="labelelement-wrap--fixed-width">{attrValue.description}</div>} />
                
                if (attrIdx === maxItemsShown) return <MenuItem key={`items-not-show${attribute.id}`} text="Not all items shown ..." disabled={true} /> 

                return null 
                        
            })}

        </Menu>
    }

    const renderSelectedItemAsTag = (item) => {
        //render selected item as a tag 
        return item.text
    }

    const filterItems = (searchString, items) => {
        if (searchString === "") return items 
        if (searchString.length <= minimumSearchStringLength) return items
        const filteredAttributeValues = filterArrayBySearchString({ array: items, keyNames : searchColumns, searchString })
        return filteredAttributeValues
    }
    return (
            
            <Select
                disabled={disabled}
                filterable={!attribute.has_features_value}
                popoverProps={{ matchTargetWidth, minimal: true }}
                resetOnQuery={true}
                resetOnSelect={true}
                fill={true}
                items={attributeValues}
                itemListRenderer={renderItems}
                itemListPredicate={filterItems}
                tagRenderer={renderSelectedItemAsTag}
                onItemSelect={(item) => onItemSelect(attribute, item)}
                onRemove = {(item,index) => onItemSelect(attribute,item)}
        >
            {selectedItems.length === 0 ? <SimpleTag text={attribute.text} />: <AttributeFeatureTag {...{ attribute, value: selectedItems[0] }} />}
               </Select>
    )
}

export default SingleAttributeInput