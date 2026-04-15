import { Button, FormGroup, MenuItem } from "@blueprintjs/core"
import { MultiSelect, Select } from "@blueprintjs/select"
import { useState } from "react"
import useDebounce from "../../../../hooks/useDebounce"
import _ from "lodash"
import { api } from "@/api";


function SymptomMenuItem({ tag, handleClick, handleFocus, index, modifiers, query, selected}) {
    
    const { data: symptom, isSuccess, isLoading, isError } = api.maintenance.symptoms.querySymptoms.useGetSymptomByTag({ tag })

    if (isError) return null 
    return (<MenuItem
        icon={selected ? "tick" : "blank"}
        text={isLoading ? "... " : symptom.text}
        onClick={handleClick}
        onFocus={handleFocus}
        active={modifiers.active}
        labelElement={<div style={{
            maxWidth: "18rem",
            textAlign: "right",
            float: "right",
            textWrap: "wrap",
            marginRight: "1rem",
            fontSize: "0.8rem",
            color : "gray"
        }}>{_.has(symptom,"description") ? symptom.description : "..."}</div>}>
        
    </MenuItem>
    )
}


/**
 * @description SymptomInput component for selecting a symptom with minimal appearance. Does not mean that 
 * only a single symptom can be selected, but the button design is minimal.
 * @param {Object} props 
 * @param {Array} props.selectedItems The currently selected item tags 
 * @returns 
 */
export function SymptomInput({ selectedItems = [], onItemSelect, isRequired = true, helperText = "", inline = false, showLabel = true, disabled = false }) {
    const [queryString, setQueryString] = useState("")
    const debouncedString = useDebounce(queryString, 200)
    const { data: items, isLoading, isFetching } = api.maintenance.symptoms.querySymptoms.useGetSymptomByQuery({ search_string: debouncedString })    

    /**
     * @description Handles the item rendering
     * @param {*} item The Symptom item
     * @returns 
     */
    const renderSymptom = (item, { handleClick, handleFocus, index, modifiers, query }) => {
        return <SymptomMenuItem key={`${item}-${index}`}
            {...{
                selected : _.includes(selectedItems, item.tag),
                tag: item,
                handleClick,
                handleFocus,
                index,
                modifiers,
                query
            }} />
    }
    
    return (
        <Select
            popoverProps={{popoverClassName : "default_bp_menu"}}
            items={_.isArray(items) ? items : []}
            itemRenderer={renderSymptom}
            onQueryChange={queryString => setQueryString(queryString)}
            onItemSelect={symptom_tag => onItemSelect(symptom_tag)}    
            menuProps={{style : {minWidth : "750px", minHeight : "50vh"}}}
            >
            <Button icon={"plus"} minimal={true} intent="primary" />
            </Select>
        )
}




export function SymptomsInput({selectedItems = [], onItemSelect, isRequired = true, helperText = "", inline = false, showLabel = true, disabled = false}) {
    
    const [queryString, setQueryString] = useState("")
    const debouncedString = useDebounce(queryString,200)
    const { data: items, isLoading, isFetching } = api.maintenance.symptoms.querySymptoms.useGetSymptomByQuery({ search_string: debouncedString })    
    
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
            placeholder="Select symptom..."
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
