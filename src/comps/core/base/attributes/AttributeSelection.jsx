import { Select } from "@blueprintjs/select";
import { AttributeMenuItem } from "../../input/api/AttributeInput";
import PropTypes from "prop-types";
import _ from "lodash";
import { api } from "@/api"

export function AttributeButton({ tag, minimal = false }) {
    const { data: attribute } = api.attributes.queryAttributes.useGetAttribute({ tag }, { enabled: _.isString(tag), staleTime: Infinity })

    return <button className={`${minimal ? "basic-button--small" : "basic-button"}`}> {_.isObject(attribute) ? attribute.text : "Select Attribute"} </button>
}

AttributeButton.propTypes = {
    tag: PropTypes.string,
    minimal: PropTypes.bool,
}

/**
 * @description A selection component for attributes. Requires the attribute tags to select from. Does not support searching.
 * @param {Object} props 
 * @param {String[]} props.attribute_tags The attribute tags to select from.
 * @param {String[]} props.selected 
 * @param {Function} props.onSelect
 * @param {Boolean} props.minimal Whether to use the minimal button style.
 * @returns 
 */
export function AttributeSelection({ attribute_tags = [], selected = [], onSelect, minimal = false }) { 
    const handleSelect = (attribute_tag) => {
        onSelect(attribute_tag)
    }

    const renderItem = (attribute_tag, { handleClick, handleFocus, modifiers, query }) => {
        return <AttributeMenuItem tag={attribute_tag} menuItemProps={{ handleClick, handleFocus, modifiers, query }} onItemSelect={onSelect} selected={selected.includes(attribute_tag)} />
    }
    return <Select items={attribute_tags} filterable={false} onItemSelect={handleSelect} itemRenderer={renderItem}><AttributeButton minimal={minimal} tag={_.isArray(selected) && selected.length > 0 ? selected[0] : undefined} /></Select>

}

AttributeSelection.propTypes = {
    attribute_tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    selected: PropTypes.arrayOf(PropTypes.string).isRequired,
    onSelect: PropTypes.func.isRequired,
    minimal: PropTypes.bool,
}
