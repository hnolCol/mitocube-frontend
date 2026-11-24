import { api } from "@/api"
import _ from "lodash"
import PropTypes from "prop-types"

ResearchGroupOption.propTypes = {
    tag: PropTypes.string.isRequired
}

function ResearchGroupOption({ tag }) {
    const { data: researchGroup } = api.researchgroups.useGetResearchGroupByTag(
        { tag },
        { enabled: _.isString(tag) && tag.length > 0, staleTime: Infinity }
    )
    return <option value={tag}>{researchGroup?.text || tag}</option>
}

ResearchGroupSelect.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool
}

/**
 * Single-select dropdown of all research groups.
 * @param {Object} props
 * @param {String} props.value - The currently selected research group tag ("" for none)
 * @param {Function} props.onChange - Called with the selected research group tag
 * @param {String} props.placeholder - Placeholder shown when nothing is selected
 * @param {Boolean} props.disabled - Whether the select is disabled
 */
export function ResearchGroupSelect({ value = "", onChange, placeholder = "Select research group ...", disabled = false }) {
    const { data: researchGroupTags } = api.researchgroups.useGetResearchGroups(
        { limit: 500 },
        { staleTime: 1000 * 60 * 5 }
    )
    return (
        <select
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            className="text-input"
            style={{ width: "180px", minWidth: "140px", flexShrink: 0 }}
        >
            <option value="" disabled>{placeholder}</option>
            {_.map(researchGroupTags || [], tag => <ResearchGroupOption key={tag} tag={tag} />)}
        </select>
    )
}