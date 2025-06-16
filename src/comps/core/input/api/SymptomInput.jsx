import { Button, FormGroup, MenuItem } from "@blueprintjs/core"
import { MultiSelect, Suggest } from "@blueprintjs/select"
import { useState } from "react"
import useDebounce from "../../../../hooks/useDebounce"
import _ from "lodash"
import hooks from "@mitocube/api-hooks"


function SymptomMenuItem({ tag, handleClick, handleFocus, index, modifiers, query }) {
    
    const { data: symptom, isSuccess, isLoading, isError } = hooks.maintenance.symptoms.useGetSymptomByTag({ tag })

    if (isError) return null 
    return (<MenuItem
        text={isLoading ? "... " : symptom.text}
        onClick={handleClick}
        onFocus={handleFocus}
        active={modifiers.active}
        labelElement={<div style={{
            maxWidth: "24rem",
            textAlign: "right",
            float: "right",
            textWrap: "wrap",
            marginRight: "1rem"
        }}>{_.has(symptom,"description") ? symptom.description : "..."}</div>}>
        
    </MenuItem>
    )
}



export function SymptomInput({selectedItems = [], onItemSelect, isRequired = true, helperText = "", inline = false, showLabel = true, disabled = false}) {
    
    const [queryString, setQueryString] = useState("")
    const debouncedString = useDebounce(queryString,200)
    const { data: items, isLoading, isFetching } = hooks.maintenance.symptoms.useGetSymptomByQuery({ searchString: debouncedString })    
    
    const renderSymptom = (item, { handleClick, handleFocus, index, modifiers, query }) => {
        return <SymptomMenuItem key={`${item}-${index}`}
            {...{
                tag : item,
                handleClick,
                handleFocus,
                index,
                modifiers,
                query
                }} />
        
        
        // <MenuItem key={`${item.tag}-${index}`}
        //     text={item}
        //     onClick={handleClick} onFocus={handleFocus} active={modifiers.active}
        //     labelElement={<div style={{
        //         maxWidth: "24rem",
        //         textAlign: "right",
        //         float: "right",
        //         textWrap: "wrap",
        //         marginRight: "1rem"
        //     }}>{"hallo"}</div>} />
    }
    /**
     * @description Handles the item selection 
     * @param {Object} item 
     */
    const handleItemSelection = (item, e) => {
        if (_.isFunction(e.stopPropagation)) {
            e.stopPropagation()
        }
        onItemSelect(item)   
    }

    /**
     * 
     * @param {Object} item 
     * @returns 
     */
    const renderValue = (item) => {
        return item
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
            itemRenderer={renderSymptom}
            items={_.isArray(items) ? items : []}
            tagRenderer={renderValue}
            selectedItems={selectedItems}
            onItemSelect={handleItemSelection}
            onRemove={handleItemSelection}
            resetOnSelect={true}
            query={queryString}
            fill = {true}
            onQueryChange={(query) => setQueryString(query)}
            popoverProps={{ minimal: true, matchTargetWidth: true }}
            menuProps={{style : {minWidth:"700px"}}}
            tagInputProps={{
                rightElement : <Button icon="blank" minimal={true} loading={isLoading || isFetching} intent="primary" />,
                inputProps : {intent : "primary"},
                tagProps: { minimal: true }
            }}
            // initialContent={_.isArray(items) && selectedItems.length === 0 ? <MenuItem text="Search starts on typing.." disabled={true} /> : null }
            />
        </FormGroup>
}
