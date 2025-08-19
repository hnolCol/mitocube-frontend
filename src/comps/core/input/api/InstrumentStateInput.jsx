import { Button, FormGroup, MenuItem } from "@blueprintjs/core"
import { MultiSelect, Suggest } from "@blueprintjs/select"
import { useState } from "react"
import useDebounce from "../../../../hooks/useDebounce"
import _ from "lodash"
import hooks from "@mitocube/api-hooks"


function InstrumentStateItem({ tag, handleClick, handleFocus, index, modifiers, query }) {
    
    const { data: instrument_state, isSuccess, isLoading, isError } = hooks.instruments.states.useGetInstrumentState({ tag })

    if (isError) return null 
    return (<MenuItem
        text={isLoading ? "... " : instrument_state.text}
        onClick={handleClick}
        onFocus={handleFocus}
        active={modifiers.active}
        labelElement={<div style={{
            maxWidth: "24rem",
            textAlign: "right",
            float: "right",
            textWrap: "wrap",
            marginRight: "1rem"
        }}>{_.has(instrument_state,"description") ? instrument_state.description : "..."}</div>}>
        
    </MenuItem>
    )
}



export function InstrumentStateInput({selectedItems = [], onItemSelect, isRequired = true, helperText = "", inline = false, disabled = false}) {
    
    const [queryString, setQueryString] = useState("")
    const debouncedString = useDebounce(queryString, 200)
    
    const { data: items, isLoading, isFetching } = hooks.instruments.states.useGetInstrumentStateByQuery({ search_string: debouncedString })    
    const renderSymptom = (item, { handleClick, handleFocus, index, modifiers, query }) => {
        return <InstrumentStateItem key={`${item}-${index}`}
            {...{
                tag : item,
                handleClick,
                handleFocus,
                index,
                modifiers,
                query
                }} />
        
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
            placeholder="Select instrument state..."
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
