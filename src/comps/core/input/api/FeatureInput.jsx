import { Button, FormGroup, MenuItem } from "@blueprintjs/core"
import { MultiSelect, Suggest } from "@blueprintjs/select"
import { useGetFeatureByQuery } from "../../../../hooks/queries/feature.hooks"
import { useState } from "react"
import useDebounce from "../../../../hooks/useDebounce"
import _ from "lodash"
import { FeatureMenuItem } from "../items/FeatureMenu"


export function FeatureInput({selectedItems = [], onItemSelect, attribute, proteome_ids, isRequired = true, helperText = "", inline = false, showLabel = true, allowUndefinedProteomes = false, debounceDelay = 200, rightElement}) {
    const [queryString,setQueryString] = useState("")
    const debouncedString = useDebounce(queryString,debounceDelay)
    const { data: items, isLoading, isFetching } = useGetFeatureByQuery({ query: debouncedString, proteome_ids},
        { enabled: debouncedString.length > 0 })
    
    const disabled = allowUndefinedProteomes ? false : !_.isArray(proteome_ids) || !proteome_ids.filter(proteome_id => _.isString(proteome_id)).length > 0
    
    const renderFeature = (item, { handleClick, handleFocus, index, modifiers, query }) => {

        return <FeatureMenuItem key={item.tag} {...{feature : item, onClick : handleClick, active : modifiers.active}} />
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

    /**
     * 
     * @param {import("../../../types/feature").Feature} item 
     * @returns 
     */
    const renderValue = (item) => {
        return item.gene_name
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
            tagRenderer={renderValue}
            selectedItems={selectedItems}
            onItemSelect={handleItemSelection}
            onRemove={handleItemSelection}
            resetOnSelect={true}
            query={queryString}
            fill={true}
            onQueryChange={(query) => setQueryString(query)}
            popoverProps={{ minimal: true, matchTargetWidth: false }}
            menuProps={{style : {minWidth:"700px"}}}
            tagInputProps={{
                rightElement : rightElement!==undefined? rightElement : <Button icon="blank" minimal={true} loading={isLoading || isFetching} intent="primary"/>,
                inputProps: { intent: "primary" },
                tagProps: { minimal: true }
            }}
            initialContent={_.isArray(items) && selectedItems.length === 0 ? <MenuItem text="Search starts on typing.." disabled={true} /> : null }
            />
        </FormGroup>
}
