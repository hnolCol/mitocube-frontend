
import { Menu, MenuItem } from "@blueprintjs/core"
import { Select } from "@blueprintjs/select"
import PropTypes from "prop-types"
import _ from "lodash"

import SimpleTag from "../../../../core/base/tags/SimpleTag"
import { filterArrayBySearchString } from "../../../../../services/arrays/filter"



SingleAttributeInput.propTypes = {
    attribute : PropTypes.object.isRequired,
    attributes: PropTypes.arrayOf(PropTypes.object),
    searchColumns : PropTypes.array.isRequired,
    disabled: PropTypes.bool,
    matchTargetWidth: PropTypes.bool,
    maxItemsShown: PropTypes.int,
    minimumSearchStringLength: PropTypes.int,
    handleFeatureSelection: PropTypes.func.isRequired,
    featureSelectionProps : PropTypes.object,
    onItemSelect: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
}


function SingleAttributeInput({ attribute,
    attributeValues,
    isRequired = true,
    selectedItems = [],
    onItemSelect = undefined,
    onRemove = undefined,
    helperText = "",
    matchTargetWidth = true,
    searchColumns = ["name", "details"],
    maxItemsShown = 30,
    minimumSearchStringLength = 2,
    handleFeatureSelection,
    featureSelectionProps = {},
    disabled = false, ...rest }) {
    //Atribute Input
    const selectedItemsIDs = selectedItems.map(item => item.id)
    const renderItems = ({ activeItem, filteredItems, query, ...rest}) => {
        
        if (attribute.allow_features_as_values && attributeValues.length === 0) { //useful to check attributeValues?
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
                    text={attrValue.name}
                    onClick={() => onItemSelect(attribute, attrValue)}
                    labelElement={<div className="labelelement-wrap--fixed-width">{attrValue.details}</div>} />
                
                if (attrIdx === maxItemsShown) return <MenuItem key={`items-not-show${attribute.id}`} text="Not all items shown ..." disabled={true} /> 

                return null 
                        
            })}

        </Menu>
    }

    const renderSelectedItemAsTag = (item) => {
        //render selected item as a tag 
        return item.name
    }

    const filterItems = (searchString, items) => {
        if (searchString === "") return items 
        if (searchString.length <= minimumSearchStringLength) return items
        const filteredAttributeValues = filterArrayBySearchString({ array: items, searchColumns, searchString })
        return filteredAttributeValues
    }
    return (
            
            <Select
                disabled={disabled}
                filterable={!attribute.allow_features_as_values}
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
            <SimpleTag text={_.isObject(selectedItems[0])?selectedItems[0].name:attribute.name}/>
               </Select>
    )
}

export default SingleAttributeInput