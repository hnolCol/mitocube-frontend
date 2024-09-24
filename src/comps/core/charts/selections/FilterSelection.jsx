import { FilterInput } from "../../input/api/Filter";
import _ from "lodash"
/**
 * @description Select a filter set (e.g. list of proteins). Compared to other chart selection
 * components, this retrieves the information from the API backend by using the proteome_ids for 
 * the particular dataset.
 * @param {Object} props 
 * @param {Object.<String,Object[]>} props.selection 
 * @param {Function} props.onSelectionChange - The callback function upon a selection. 
 * @returns {import("react").ReactElement} The filters selection item
 */
export function FilterSelection({ selection, onSelectionChange, proteome_tags, key = "filterSetNames" }) {
    
    return <FilterInput
        onItemSelect={filterSetItem => onSelectionChange(key,filterSetItem)}
        selectedItems={_.isArray(selection[key]) ? selection[key] : []}
        proteome_tags={proteome_tags}/>
}