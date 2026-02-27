import { Button, FormGroup, MenuItem } from "@blueprintjs/core"
import { MultiSelect } from "@blueprintjs/select"
import { useState } from "react"
import useDebounce from "../../../../hooks/useDebounce"
import _ from "lodash"
import { ProteinMenuItem } from "../items/FeatureMenu"
import hooks from "@mitocube/api-hooks"

export function FeatureInput({selectedItems = [], onItemSelect, onItemRemove, attribute, isRequired = true, helperText = "", inline = false, showLabel = true, debounceDelay = 200, disabled = false, rightElement}) {
    const [queryString,setQueryString] = useState("")
    const debouncedString = useDebounce(queryString,debounceDelay)
    const { data: items, isLoading, isFetching } = hooks.features.proteins.useGetProteinFeatureByQuery({ search_string: debouncedString, limit: 20 }, { enabled: debouncedString.length > 0, staleTime: 5 * 60 * 1000 })
    const renderFeature = (item, { handleClick, handleFocus, index, modifiers, query }) => {

        return <ProteinMenuItem key={item} {...{tag : item, onClick : handleClick, active : modifiers.active}} />
    }
    /**
     * @description Handles the item selection 
     * @param {import("../../../types/feature").Feature} item 
     */
    const handleItemSelection = (item, e) => {
        if (_.isFunction(e.stopPropagation)) {
            e.stopPropagation()
        }
        onItemSelect(attribute, item)
    }

    const handleItemRemove = (item, e) => {
        if (_.isFunction(e.stopPropagation)) {
            e.stopPropagation()
        }
        if (_.isFunction(onItemRemove)) onItemRemove(attribute, item)
        else onItemSelect(attribute, item)
        
    }   


    return <FormGroup
    style={{ marginBottom : "0px" }}
    label={showLabel && _.has(attribute,"text")?attribute.text:undefined}
    labelInfo={isRequired ? "(required)" : "(optional)"}
    inline={inline}
    fill={true}
    disabled={disabled}
        helperText={helperText}>
    
        <MultiSelect
            disabled={disabled}
            itemRenderer={renderFeature}
            items={_.isArray(items) ? items : []}
            tagRenderer={(tag) =>  <div>{tag}</div>}
            selectedItems={selectedItems}
            onItemSelect={handleItemSelection}
            onRemove={handleItemRemove}
            resetOnSelect={true}
            query={queryString}
            fill={true}
            onQueryChange={(query) => setQueryString(query)}
            popoverProps={{ minimal: true, matchTargetWidth: false }}
            // Prevent scroll events from bubbling to parent (e.g. page scroll) when using the menu
            menuProps={{ style: { minWidth: "700px" }, onWheel: (e) => { e.stopPropagation(); } }}
            tagInputProps={{
                rightElement : rightElement!==undefined? rightElement : <Button icon="blank" minimal={true} loading={isLoading || isFetching} intent="primary"/>,
                inputProps: { intent: "primary" },
                tagProps: { minimal: true }
            }}
            initialContent={_.isArray(items) && selectedItems.length === 0 ? <MenuItem text="Loading..." disabled={true} /> : null }
            />
        </FormGroup>
}
