import { MultiSelect } from "@blueprintjs/select";
import { useGetValueForAttributeByTag } from "../../../../hooks/queries/attribute.hooks";
import _ from "lodash"
import { useState } from "react";
import { Button, Divider } from "@blueprintjs/core";
import "./style.css"
import { filterArrayBySearchStringByMultipleKeys } from "../../../../services/arrays/filter";
import { TraitMenuItem } from "../items/AttributeValueMenu";
import hooks from "@mitocube/api-hooks"
import useDebounce from "../../../../hooks/useDebounce";
import { AttributeWithTraitsMenuItem } from "./DatasetAttributeInput";
/**
 * 
 * @param {Object} props 
 * @param {String} props.attribute_tag 
 * @param {String[]} props.selected_traits
 * @param {Function} props.onItemSelect
 * @returns 
 */
export function TraitsInput({ attribute_tag, selected_traits, onItemSelect }) {
    //const [selectedItems, setSelectedItems] = useState([])
    const [query, setQuery] = useState("")
    const debouncedString = useDebounce(query, 2)
    const { data: attribute, isSuccess } = hooks.attributes.useGetAttribute({tag : attribute_tag})
    const { data: trait_tags, isError, isLoading, refetch, isFetching } = hooks.traits.useGetTraitBySearchString({
        search_string: debouncedString,
        attribute_tag,
        limit: 20
    })


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

    const renderTraits = ({ activeItem, items, query, filteredItems, ...rest }) => {


        // const activeItemTag = _.isObject(activeItem) ? activeItem.tag : undefined
        // const attributeValues = query === "" ? items : filteredItems
        return <AttributeWithTraitsMenuItem tag={attribute_tag} trait_tags={trait_tags} handleTraitSelection={onItemSelect} selected_traits={selected_traits} />
             
            // {isLoading || isFetching ? null : <div>
            //     {trait_tags.map(trait_tag => {
            //         return <TraitMenuItem key={trait_tag}
            //             tag={trait_tag}
            //             attribute_tag={attribute_tag}
            //             onClick={onItemSelect}
            //             selected={_.isArray(selected_traits) && selected_traits.includes(trait_tag)} />
            //     })}

            // </div>}

        // </div>
    }

    const renderValue = (item) => {
        return item.text
    }
    
    return (
   
        <MultiSelect
            items={_.isArray(trait_tags) ? trait_tags : []}
            placeholder={isSuccess ? attribute.text : null}
            tagRenderer={renderValue}
            onItemSelect={handleItemSelection}
            itemListRenderer={renderTraits}
            onQueryChange={(query_string) => setQuery(query_string)}
            // itemListPredicate={filterItems}
            resetOnSelect={true}
            onRemove={handleItemSelection}
            popoverProps={{minimal : true, matchTargetWidth : true}}
            tagInputProps={{
                rightElement : <Button icon="blank" minimal={true} loading={isLoading || isFetching} intent="primary" />,
                inputProps: { intent: "primary"}, //isSuccess
                tagProps: { minimal: true }
            }}
            selectedItems={_.isArray(trait_tags) && _.isArray(selected_traits)?trait_tags.filter(trait => selected_traits.includes(trait.tag)):[]}
            />
    )
}