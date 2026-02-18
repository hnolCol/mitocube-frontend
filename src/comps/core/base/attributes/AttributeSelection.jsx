import { Select } from "@blueprintjs/select";
import { AttributeMenuItem } from "../../input/api/AttributeInput";
import { Button } from "@blueprintjs/core";
import PropTypes from "prop-types";
import _ from "lodash";
import hooks from "@mitocube/api-hooks"
AttributeSelection.propTypes = {
    attribute_tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    selected: PropTypes.arrayOf(PropTypes.string).isRequired,
    onSelect: PropTypes.func.isRequired
}

AttributeSelection.defaultProps = {
    attribute_tags: [],
    selected: []
}

export function AttributeButton({ tag }) {
    const { data: attribute } = hooks.attributes.useGetAttribute({ tag }, { enabled: _.isString(tag), staleTime: Infinity })

    return <button className="basic-button"> {_.isObject(attribute) ? attribute.text : "Select Attribute"} </button>
}


/**
 * @description A selection component for attributes. Requires the attribute tags to select from. Does not support searching.
 * @param {Object} props 
 * @param {String[]} props.attribute_tags The attribute tags to select from.
 * @param {String[]} props.selected 
 * @param {Function} props.onSelect
 * @returns 
 */
export function AttributeSelection({ attribute_tags, selected, onSelect }) { 
    const handleSelect = (attribute_tag) => {
        onSelect(attribute_tag)
    }

    const renderItem = (attribute_tag, { handleClick, handleFocus, modifiers, query }) => {
        return <AttributeMenuItem tag={attribute_tag} menuItemProps={{ handleClick, handleFocus, modifiers, query }} onItemSelect={onSelect} selected={selected.includes(attribute_tag)} />
    }
    return <Select items={attribute_tags} filterable={false} onItemSelect={handleSelect} itemRenderer={renderItem}><AttributeButton tag={_.isArray(selected) && selected.length > 0 ? selected[0] : undefined} /></Select>

}