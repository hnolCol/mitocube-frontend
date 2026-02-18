import { MultiSelect } from "@blueprintjs/select";
import { useState } from "react";
import { Button } from "@blueprintjs/core";
import "./style.css"

import hooks from "@mitocube/api-hooks"
import useDebounce from "../../../../hooks/useDebounce";
import { AttributeWithTraitsMenuItem } from "./DatasetAttributeInput";
import _ from "lodash"
import { getRandomID } from "../../../../services/random"

function TraitTag({ tag }) {
    const { data: trait , isSuccess} = hooks.traits.useGetTraitByTag({ tag }, { enabled: _.isString(tag), staleTime: Infinity })
    
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
export function TraitsInput({ attribute_tag, selected_traits, onItemSelect, path }) {
    const [query, setQuery] = useState("")
    const debouncedString = useDebounce(query, 2)
    const { data: attribute, isSuccess } = hooks.attributes.useGetAttribute({tag : attribute_tag})
    const { data: trait_tags, isError, isLoading, isFetching } = hooks.traits.useGetTraitBySearchString({
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
            onItemSelect(_.concat(path, [{"type": "trait", "tag": trait_tag, id : getRandomID()}]))
        }
    
    

    const renderTraits = ({ activeItem, items, query, filteredItems, ...rest }) => {

        return <AttributeWithTraitsMenuItem tag={attribute_tag} trait_tags={trait_tags} handleTraitSelection={onItemSelect} selected_traits={selected_traits} />
             
    }

    
    return (
   
        <MultiSelect
            items={_.isArray(trait_tags) ? trait_tags : []}
            placeholder={isSuccess ? attribute.text : null}
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
    )
}