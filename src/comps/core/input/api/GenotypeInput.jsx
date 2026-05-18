import { Button, FormGroup, MenuItem } from "@blueprintjs/core"
import { MultiSelect } from "@blueprintjs/select"
import { useState } from "react"
import useDebounce from "../../../../hooks/useDebounce"
import _ from "lodash"
import { api } from "@/api"
import { GenotypeMenuItem } from "../../../submission/new/sample_attributes/select/menu/GenotypeMenu"




export function GenotypeInput({
        selectedGenotypes = [],
        attribute = { tag: "att_genotype" },
        onItemSelect,
        isRequired = true,
        helperText = "",
        inline = false,
        disabled = false,
        showSelection = true }) {
        
    const [queryString, setQueryString] = useState("")
    const [isOpen, setIsOpen] = useState(false)  
    const debouncedString = useDebounce(queryString, 200)
    const { data: items, isLoading, isFetching } = api.genotypes.queryGenotypes.useGetGenotypesBySearchString({ search_string : debouncedString }, { staleTime : 6000 })    
    
    const renderFeature = (item, { handleClick, handleFocus, index, modifiers, query }) => {
        return <GenotypeMenuItem 
            genotype_tag={item}
            handleClick={handleClick}
            handleFocus={handleFocus}
            index={index}
            modifiers={modifiers}
            selected={selectedGenotypes.includes(item)}
        />
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
        setIsOpen(false)
        setQueryString("")  
    }

    /**
     * 
     * @param {Object} item 
     * @returns 
     */
    const renderValue = (item) => {
        return item.substring(0, 8) + "..."
    }
    
    return (
        <FormGroup
            style={{ margin: "0.1rem" }}
            label={undefined}
            labelInfo={isRequired ? "(required)" : "(optional)"}
            inline={inline}
            fill={true}
            disabled={disabled}
            helperText={helperText}
        >
            <MultiSelect
                disabled={disabled}
                itemRenderer={renderFeature}
                items={_.isArray(items) ? items : []}
                tagRenderer={showSelection ? renderValue : () => null}
                selectedItems={showSelection ? selectedGenotypes : []}
                onItemSelect={handleItemSelection}
                onRemove={handleItemSelection}
                resetOnSelect={true}
                query={queryString}
                fill={true}
                onQueryChange={(query) => setQueryString(query)}
                popoverProps={{ 
                    minimal: true, 
                    matchTargetWidth: false,
                    isOpen: isOpen, 
                    onInteraction: (nextOpenState) => setIsOpen(nextOpenState)  
                }}
                menuProps={{ style: { minWidth: "700px", maxHeight: "50vh" } }}
                tagInputProps={{
                    rightElement: <Button icon="blank" minimal={true} loading={isLoading || isFetching} intent="primary" />,
                    inputProps: { intent: "primary" },
                    tagProps: { minimal: true }
                }}
            />
        </FormGroup>
    )
}
