
import { FormGroup, MenuItem, Tag, TagInput } from "@blueprintjs/core"
import { MultiSelect } from "@blueprintjs/select"
import PropTypes from "prop-types"
import { useMemo, useState } from "react"
import { filterArrayBySearchString } from "../../../../services/arrays/filter"
import _ from "lodash"

AttributeInput.propTypes = {
    tag: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    attributes: PropTypes.arrayOf(PropTypes.object),
    onItemSelect: PropTypes.func.isRequired,
    onRemove : PropTypes.func.isRequired
}


function AttributeInput({tag, name, attributeValues, isRequired = true, selectedItems = [], onItemSelect = undefined, onRemove = undefined, matchTargetWidth = true, ...rest}) {
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
                key={`${tag}-${item.id}-${item.name}`}
                text={item.name}
                label={item.details}
                multiline={true} />
        )
    }

    const handleQueryChange = (query, event) => { 
        setQuery(query)
    }

    const renderSelectedItemAsTag = (item) => {
        return item.name
    }

    const selectableItems = useMemo(() => {
        if (!_.isArray(attributeValues)) return []
        if (query === "") return attributeValues
        return filterArrayBySearchString({searchString:[query],searchColumns:["name","details"],array:attributeValues})
    }, [query])

    return (
        <FormGroup
            label={name}
            labelInfo={isRequired ? "(required)" : "(optional)"}
            inline={false}
            helperText={""}>
            
            <MultiSelect
                popoverProps={{ matchTargetWidth, minimal: true}}
                resetOnSelect={true}
                fill={true}
                onQueryChange={handleQueryChange}
                items={selectableItems}
                itemRenderer={renderAttribute}
                tagInputProps={{minimal : true, large : false, round : true}}
                tagRenderer={renderSelectedItemAsTag}
                onItemSelect={(item) => onItemSelect(tag, item)}
                onRemove = {(item,index) => onItemSelect(tag,item)}
               { ...{selectedItems}}/>
        </FormGroup>
    )
}

export default AttributeInput