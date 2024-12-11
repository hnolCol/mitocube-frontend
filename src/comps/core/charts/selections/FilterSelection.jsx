import PropType from "prop-types"
import { FilterInput } from "../../input/api/Filter";
import _ from "lodash"


FilterSelection.propTypes = {
    callbackKey: PropType.string.isRequired,
    selection: PropType.object,
    onSelectionChange: PropType.func.isRequired,
    proteome_tags: PropType.arrayOf(PropType.string).isRequired
} 

FilterSelection.defaultProps = {
    callbackKey: "filterSetNames"
}

/**
 * @description Select a filter set (e.g. list of proteins). Compared to other chart selection
 * components, this retrieves the information from the API backend by using the proteome_ids for 
 * the particular dataset.
 * @param {Object} props 
 * @param {Object.<String,Object[]>} props.selection 
 * @param {Function} props.onSelectionChange - The callback function upon a selection. 
 * @returns {import("react").ReactElement} The filters selection item
 */
export function FilterSelection({ selection, onSelectionChange, proteome_tags, callbackKey}) {
    
    return <FilterInput
        onItemSelect={filterSetItem => onSelectionChange(callbackKey ,filterSetItem)}
        selectedItems={_.isArray(selection[callbackKey ]) ? selection[key] : []}
        proteome_tags={proteome_tags}/>
}