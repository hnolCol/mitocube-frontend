
import _ from "lodash"
import { useEffect, useRef, useState } from "react";
import "./style.css"
import { useGetFilters } from "../../../../hooks/queries/filter.hooks";
import FilterIcon from "../../svg/icons/chartSelection/Filter";

/**
 * 
 * @param {Object} props 
 * @returns 
 */
export function FilterInput({selectedItems, onItemSelect, proteome_tags, minimal = true, showPlaceHolder = false }) {
    console.log(proteome_tags)
    const [itemsLoaded, setItemsLoaded] = useState(false)
    //const [selectedItems, setSelectedItems] = useState([])

    const { data: filters, isLoading, isFetching } = useGetFilters(
        {proteome_tags : _.join(proteome_tags,";")})
    
    // /**
    //  * 
    //  * @param {MouseEvent} e 
    //  */
    // const checkValues = (e) => {
    //     if (!itemsLoaded) {
    //         setItemsLoaded(true)
    //     }
    // }
    // /**
    //  * @description Filters the items /attribute values by the query string targeting 
    //  * @param {String} query 
    //  * @param {Object[]} items 
    //  * @returns {Object[]} - The filtered list of attribute values.
    //  */
    // const filterItems = (query, items) => {
    //     const { idcs, data: filteredItems } = filterArrayBySearchStringByMultipleKeys({ array: items, searchString: query, keyNames: ["tag", "description"] })
    //     return filteredItems
    // }

    // /**
    //  * @description Handles the item selection 
    //  * @param {import("../../../types/feature").Feature} item 
    //  */
    //     const handleItemSelection = (item,e) => {
    //         if (_.isFunction(e.stopPropagation)) {
    //             e.stopPropagation()
    //         }
    //         onItemSelect(attribute,item)
    //     }

    // const renderAttributeValues = ({ activeItem, items, query, filteredItems }) => {
        
    //     if (!itemsLoaded) return null 
    //     const activeItemTag = _.isObject(activeItem) ? activeItem.tag : undefined
    //     const attributeValues = query === "" ? items : filteredItems
        
    //     return <div style={{minWidth : "40vw"}}>
    //         <div className="menu_item_header">
    //             {attribute.text}
    //         </div>
    //     <Divider/>    
    //         {isLoading || isFetching ? null : <div>
    //             {attributeValues.map(item =>
    //                 <AttributeValueMenuItem {...{ item, onClick: handleItemSelection }} active={activeItemTag === item.tag} selected={selectedItems.includes(item)} />)}
    //         </div>}
    //     </div>
    // }
    
    return (

        <FilterIcon
            placeholder={showPlaceHolder ? "" : selectedItems.length === 0 ? "Filter.." : selectedItems[0].tag}
            items={_.isArray(filters) ? filters : []}
            minimal={minimal}
            textKey="tag"
            labelKey={"description"}
            callbackKey="filter"
            selectedItems={selectedItems}
            callback={onItemSelect} />
    )
}