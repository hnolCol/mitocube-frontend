
import { FormGroup, Menu, MenuItem, Tag, TagInput } from "@blueprintjs/core"
import { MultiSelect } from "@blueprintjs/select"
import PropTypes from "prop-types"
import { filterArrayBySearchString } from "../../../../../services/arrays/filter"
import _ from "lodash"

AttributeInput.propTypes = {
    attribute : PropTypes.object.isRequired,
    attributes: PropTypes.arrayOf(PropTypes.object),
    onItemSelect: PropTypes.func.isRequired,
    onRemove : PropTypes.func.isRequired
}


function AttributeInput({ attribute,
    attributeValues,
    isRequired = true,
    selectedItems = [],
    onItemSelect = undefined,
    onRemove = undefined,
    onItemCreate = undefined,
    helperText = "",
    matchTargetWidth = true,
    searchColumns = ["text", "details"],
    maxItemsShown = 30,
    minimumSearchStringLength = 0,
    handleFeatureSelection = undefined,
    showLabel = true,
    inline = false,
    placeholder = "Search..",
    disabled = false, ...rest }) {
    //Atribute Input

    const selectedItemsIDs = selectedItems.map(item => item.id)
    const renderItems = ({ activeItem, filteredItems, query, ...rest}) => {
        const queryLength = query.length
        const justNumbersString = query.replace(/[^\d.]/g, "")
        if (attribute.has_features_value && attributeValues.length === 0) {
            return <Menu>
                {/* TODO: CHANGE THIS TO FeatureInput */}
                <MenuItem text="Select protein feature..."
                    onClick={() => {
                        handleFeatureSelection({ attribute })
                    }} />
            </Menu>
        }
        return <Menu>
            {filteredItems.length === 0 && attribute.has_numeric_input ? <MenuItem
                icon={queryLength ? "add" : "blank"}
                text={queryLength === 0 ? "Enter numeric value to create item" : `Create: ${justNumbersString}`}
                disabled={!queryLength || !_.isFinite(_.toNumber(justNumbersString))}
                onClick={() => onItemCreate(attribute,justNumbersString)}/> : null}
            {filteredItems.length === 0 && !attribute.has_numeric_input? <MenuItem text="No attribute values found." disabled={true} />: null}
            {filteredItems.map((attrValue, attrIdx) => {
                if (attrIdx < maxItemsShown) return <MenuItem
                    key={`${attrValue.id}-${attribute.tag}`}
                    icon={selectedItemsIDs.includes(attrValue.id)?"tick":"blank"}
                    selected={selectedItemsIDs.includes(attrValue.id)}
                    active={activeItem.id === attrValue.id}
                    text={attrValue.text}
                    onClick={() => onItemSelect(attribute, attrValue)}
                    labelElement={<div style={{ maxWidth: "24rem", textAlign : "right" }}>{attrValue.description}</div>} />
                
                if (attrIdx === maxItemsShown) return <MenuItem key={`items-not-show${attribute.id}`} text="Not all items shown ..." disabled={true} /> 

                return null 
                        
            })}
            

        </Menu>
    }

    const renderSelectedItemAsTag = (item) => {
        //render selected item as a tag 
        return item.text
    }

    // const selectableItems = useMemo(() => {
    //     if (!_.isArray(attributeValues)) return []
    //     if (query === "") return attributeValues
    //     return filterArrayBySearchString({searchString:[query],keyNames:["text","details"],array:attributeValues})
    // }, [query])

    const filterItems = (searchString, items) => {
        if (searchString === "") return items 
        if (searchString.length < minimumSearchStringLength) return items
        const filteredAttributeValues = filterArrayBySearchString({ array: items, keyNames : searchColumns, searchString })
        return filteredAttributeValues
    }
    return (
        <FormGroup
            style={{margin : "0.1rem"}}
            label={showLabel?attribute.text:""}
            labelInfo={isRequired ? "(required)" : "(optional)"}
            inline={inline}
            disabled={disabled}
            helperText={helperText}>
            
            <MultiSelect
                disabled={disabled}
                popoverProps={{ matchTargetWidth, minimal: true }}
                resetOnQuery={true}
                resetOnSelect={true}
                //createNewItemFromQuery={numericInput => console.log(numericInput)}
                //renderCreateFilmsMenuItem={(query, active, handleClick) => <MenuItem text="Create" shouldDismissPopover={false} />}
                fill={true}
                tagInputProps={{
                    tagProps: {minimal : true},
                }}
                items={attributeValues}
                itemListRenderer={renderItems}
                itemListPredicate={filterItems}
                tagRenderer={renderSelectedItemAsTag}
                onItemSelect={(item) => onItemSelect(attribute, item)}
                onRemove = {(item,index) => onItemSelect(attribute,item)}
               { ...{selectedItems, placeholder}}/>
        </FormGroup>
    )
}

export default AttributeInput