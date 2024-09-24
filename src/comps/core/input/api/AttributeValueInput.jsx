import { MultiSelect, Suggest } from "@blueprintjs/select";
import { useGetValueForAttributeByTag } from "../../../../hooks/queries/attribute.hooks";
import _ from "lodash"
import { useEffect, useRef, useState } from "react";
import { Button, Divider, Menu, MenuItem } from "@blueprintjs/core";
import Loading from "../../base/loading";
import "./style.css"
import { addItemToArrayOrRemoveItIfPresent } from "../../../../services/arrays/transforms";
import { TickIcon } from "../../svg/icons/input/Tick";
import { BlankIcon } from "../../svg/icons/input/Blank";
import { filterArrayBySearchStringByMultipleKeys } from "../../../../services/arrays/filter";
import { AttributeValueMenuItem } from "../items/AttributeValueMenu";

/**
 * 
 * @param {Object} props 
 * @param {import("../../../../types/attributes").Attribute} props.attribute
 * @param {import("../../../../types/attributes").AttributeValue[]} props.selectedItems 
 * @param {Function} props.onItemSelect
 * @returns 
 */
export function AttributeValueInput({ attribute, selectedItems, onItemSelect }) {
    
    const [itemsLoaded, setItemsLoaded] = useState(false)
    //const [selectedItems, setSelectedItems] = useState([])
    const { data: attributeValues, isLoading, isFetching } = useGetValueForAttributeByTag(
        {tag : attribute.tag},
        {
            enabled: itemsLoaded
        })
    /**
     * 
     * @param {MouseEvent} e 
     */
    const checkValues = (e) => {
        if (!itemsLoaded) {
            setItemsLoaded(true)
        }
        
    }
    /**
     * @description Filters the items /attribute values by the query string targeting 
     * @param {String} query 
     * @param {Object[]} items 
     * @returns {Object[]} - The filtered list of attribute values.
     */
    const filterItems = (query, items) => {
        const { idcs, data: filteredItems } = filterArrayBySearchStringByMultipleKeys({ array: items, searchString: query, keyNames: ["text", "description"] })
        return filteredItems 

    }

    /**
     * @description Handles the item selection 
     * @param {import("../../../types/feature").Feature} item 
     */
        const handleItemSelection = (item,e) => {
            if (_.isFunction(e.stopPropagation)) {
                e.stopPropagation()
            }
            onItemSelect(attribute,item)
        }

    const renderAttributeValues = ({ activeItem, items, query, filteredItems, ...rest }) => {

        if (!itemsLoaded) return null 
        const activeItemTag = _.isObject(activeItem) ? activeItem.tag : undefined
        const attributeValues = query === "" ? items : filteredItems
        
        return <div style={{minWidth : "40vw"}}>
            <div className="menu_item_header">
                {attribute.text}
            </div>
        <Divider/>    
            {isLoading || isFetching ? null : <div>
                {attributeValues.map(item =>
                    <AttributeValueMenuItem {...{
                        attributeValue: item,
                        onClick: handleItemSelection,
                        key: `${item.tag}-${attribute.tag}`
                    }}
                        active={activeItemTag === item.tag} selected={_.isObject(_.find(selectedItems,{tag : item.tag}))} />)}

            </div>}

        </div>
    }

    const renderValue = (item) => {
        return item.text
    }
    
    return (
   
        <MultiSelect
            items={_.isArray(attributeValues) ? attributeValues : []}
            placeholder={attribute.text}

            tagRenderer={renderValue}
            onItemSelect={handleItemSelection}
            itemListRenderer={renderAttributeValues}
            itemListPredicate={filterItems}
            resetOnSelect={true}
            onRemove={handleItemSelection}
            popoverProps={{minimal : true, matchTargetWidth : true}}
            tagInputProps={{
                rightElement : <Button icon="blank" minimal={true} loading={isLoading || isFetching} intent="primary" />,
                inputProps: { intent: "primary", onFocus : checkValues},
                tagProps: { minimal: true }
            }}
            selectedItems={selectedItems}/>
    )
}