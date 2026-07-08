import { MultiSelect } from "@blueprintjs/select";
import { useState } from "react";
import { Button } from "@blueprintjs/core";
import "./style.css"

import useDebounce from "../../../../hooks/useDebounce";
import { AttributeWithTraitsMenuItem } from "./DatasetAttributeInput";
import _ from "lodash"
import { getRandomID } from "../../../../services/random"
import { api } from "@/api";

function TraitTag({ tag }) {
    const { data: trait , isSuccess} = api.traits.queryTraits.useGetTraitByTag({ tag }, { enabled: _.isString(tag), staleTime: Infinity })
    
    return <span>{isSuccess && _.isString(trait.tag)?trait.text:""}</span>
}

/**
 * 
 * @param {Object} props 
 * @param {String} props.attribute_tag 
 * @param {String[]} props.selected_traits
 * @param {Function} props.onItemSelect
 * @returns 
 */
export function TraitsInput({ attribute_tag, selected_traits, onItemSelect, path, isMandatory = false, referenceID }) {
    const [query, setQuery] = useState("")
    const debouncedString = useDebounce(query, 2)
    const { data: attribute, isSuccess } = api.attributes.queryAttributes.useGetAttribute({tag : attribute_tag}, {enabled : _.isString(attribute_tag) && attribute_tag.length > 0, staleTime : 600000})
    const { data: trait_tags, isError, isLoading, isFetching } = api.traits.queryTraits.useGetTraitBySearchString({
        search_string: debouncedString,
        attribute_tag,
        limit: 20
    })

    /**
     * @description Handles the item selection 
     * @param {String} trait_tag The trait_tag 
     */
        const handleItemSelection = (trait_tag,e) => {
            if (_.isFunction(e.stopPropagation)) {
                e.stopPropagation()
            }
            onItemSelect(_.concat(path, [{"type": "trait", "tag": trait_tag, id : _.isString(referenceID) ? referenceID :  getRandomID()}]))
        }
    
    

    const renderTraits = ({ activeItem, items, query, filteredItems, ...rest }) => {

        return <AttributeWithTraitsMenuItem
            tag={attribute_tag}
            trait_tags={trait_tags}
            handleTraitSelection={onItemSelect}
            selected_traits={selected_traits} />
             
    }

    
    return (

        <div>
            {isMandatory && isSuccess ? (
    <div style={{ fontSize: "0.85rem", marginBottom: "2px", marginTop: "0.5rem" }}>
        <strong>{attribute.text}</strong> <span style={{ color: "red" }}>*</span>
    </div>
) : null}
    
        <MultiSelect
            items={_.isArray(trait_tags) ? trait_tags : []}
            placeholder={isSuccess ? (isMandatory ? "Search..." : attribute.text) : null}
            tagRenderer={(tag) => <TraitTag tag={tag} />}
            onItemSelect={handleItemSelection}
            itemListRenderer={renderTraits}
            onQueryChange={(query_string) => setQuery(query_string)}
            resetOnSelect={true}
            onRemove={handleItemSelection}
            
            popoverProps={{minimal : true, matchTargetWidth : true}}
            tagInputProps={{
                
                rightElement : <Button icon="blank" minimal={true} loading={isLoading || isFetching} intent="primary" />,
                inputProps: { intent: "primary"}, 
                tagProps: { minimal: true }
            }}
            selectedItems={_.isArray(selected_traits)?selected_traits:[]}
            />
            </div>
    )
}