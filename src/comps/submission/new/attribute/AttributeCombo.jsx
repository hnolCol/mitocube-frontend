
import { FormGroup, MenuItem, Tag, TagInput } from "@blueprintjs/core"
import { MultiSelect } from "@blueprintjs/select"
import PropTypes from "prop-types"
import { useMemo, useState } from "react"
import { filterArrayBySearchString } from "../../../../services/arrays/filter"
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
    helperText = "",
    matchTargetWidth = true,
    disabled = false, ...rest }) {
    //Atribute Input

    const [query, setQuery] = useState("") //search query for MutliSelect
    const renderAttribute = (item, props) => {
        if (!props.modifiers.matchesPredicate) {
            return null;
        }
        return (
            <MenuItem
                onClick={props.handleClick}
                onFocus={props.handleFocus}
                active={props.modifiers.active}
                icon={selectedItems.includes(item)?"tick":"blank"}
                shouldDismissPopover={true}
                key={`${attribute.tag}-${item.id}-${item.name}`}
                text={item.name}
                label={item.details}
                multiline={true} />
        )
    }

    const handleQueryChange = (query, event) => { 
        //handle query change (e.g. search)
        setQuery(query)
    }

    const renderSelectedItemAsTag = (item) => {
        //render selected item as a tag 
        return item.name
    }

    const selectableItems = useMemo(() => {
        if (!_.isArray(attributeValues)) return []
        if (query === "") return attributeValues
        return filterArrayBySearchString({searchString:[query],searchColumns:["name","details"],array:attributeValues})
    }, [query])

    return (
        <FormGroup
            label={attribute.name}
            labelInfo={isRequired ? "(required)" : "(optional)"}
            inline={false}
            disabled={disabled}
            helperText={helperText}>
            
            <MultiSelect
                disabled={disabled}
                popoverProps={{ matchTargetWidth, minimal: true}}
                resetOnSelect={true}
                fill={true}
                onQueryChange={handleQueryChange}
                items={selectableItems}
                itemRenderer={renderAttribute}
                tagInputProps={{minimal : true, large : false, round : true}}
                tagRenderer={renderSelectedItemAsTag}
                onItemSelect={(item) => onItemSelect(attribute, item)}
                onRemove = {(item,index) => onItemSelect(attribute,item)}
               { ...{selectedItems}}/>
        </FormGroup>
    )
}

export default AttributeInput