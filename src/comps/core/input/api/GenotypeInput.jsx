import { Button, FormGroup, MenuItem } from "@blueprintjs/core"
import { MultiSelect, Suggest } from "@blueprintjs/select"
import { useGetFeatureByQuery } from "../../../../hooks/queries/feature.hooks"
import { useState } from "react"
import useDebounce from "../../../../hooks/useDebounce"
import _ from "lodash"
import { useGetGenotypesByQuery } from "../../../../hooks/queries/genotype.hooks"

export function GenotypeInput({selectedItems = [], attribute, onItemSelect, isRequired = true, helperText = "", inline = false, showLabel = true}) {
    const [queryString,setQueryString] = useState("")
    const debouncedString = useDebounce(queryString,200)
    const { data: items, isLoading, isFetching } = useGetGenotypesByQuery({ query: debouncedString },
        { enabled: debouncedString.length > 0 })
    const disabled =  false //allowUndefinedProteomes ? false : !_.isArray(proteome_ids) ||  !proteome_ids.filter(proteome_id => _.isString(proteome_id)).length > 0
    
    
    
    const renderFeature = (item, { handleClick, handleFocus, index, modifiers, query }) => {
        return <MenuItem key={`${item.tag}-${index}`} text={item.text} onClick={handleClick} onFocus={handleFocus} active={modifiers.active}
            labelElement={<div style={{ maxWidth: "24rem", textAlign: "right", float: "right", textWrap: "wrap", marginRight: "1rem" }}>{item.proteome_id}</div>}/>
    }
    /**
     * @description Handles the item selection 
     * @param {Object} item 
     */
    const handleItemSelection = (item, e) => {
        if (_.isFunction(e.stopPropagation)) {
            e.stopPropagation()
        }
        onItemSelect(attribute, item)   
    }

    /**
     * 
     * @param {Object} item 
     * @returns 
     */
    const renderValue = (item) => {
        return item.text
    }

    return <FormGroup
    style={{margin : "0.1rem"}}
    label={undefined}
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
            fill = {true}
            onQueryChange={(query) => setQueryString(query)}
            popoverProps={{ minimal: true, matchTargetWidth: false }}
            menuProps={{style : {minWidth:"700px"}}}
            tagInputProps={{
                rightElement : <Button icon="blank" minimal={true} loading={isLoading || isFetching} intent="primary" />,
                inputProps : {intent : "primary"},
                tagProps: { minimal: true }
            }}
            initialContent={_.isArray(items) && selectedItems.length === 0 ? <MenuItem text="Search starts on typing.." disabled={true} /> : null }
            />
        </FormGroup>
}
