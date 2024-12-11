
import _, { filter } from "lodash"
import { useEffect, useRef, useState } from "react";
import "./style.css"
import { useGetFilters } from "../../../../hooks/queries/filter.hooks";
import FilterIcon from "../../svg/icons/chartSelection/Filter";

/**
 * 
 * @param {Object} props 
 * @returns 
 */
export function FilterInput({submission_tag, selectedItems, onItemSelect, minimal = true, showPlaceHolder = false }) {
    
    const { data: filters, isLoading, isFetching } = useGetFilters(
        { submission_tag })
    
    return (

        <FilterIcon
            placeholder={showPlaceHolder ? "" : selectedItems.length === 0 ? "Filter.." : selectedItems[0].tag}
            items={_.isArray(filters) ? filters : []}
            minimal={showPlaceHolder ? false : minimal}
            textKey="tag"
            labelKey={"description"}
            callbackKey="filter"
            selectedItems={selectedItems}
            callback={onItemSelect} />
    )
}