import { Button, FormGroup, MenuItem } from "@blueprintjs/core"
import { MultiSelect, Select } from "@blueprintjs/select"
import { useState } from "react"
import useDebounce from "../../../../hooks/useDebounce"
import _ from "lodash"
import { api } from "@/api"


function MaintenanceProcedureMenuItem({ procedure_tag, handleClick, handleFocus, index, modifiers, query, selected}) {
    
    const { data: mp, isSuccess, isLoading, isError } = api.maintenance.procedures.queryMaintenanceProcedures.useGetMaintenanceProcedureByTag({ procedure_tag })
    if (isError) return null 
    return (<MenuItem
        icon={selected ? "tick" : "blank"}
        text={isLoading ? "... " : mp.text}
        onClick={handleClick}
        onFocus={handleFocus}
        active={modifiers.active}
        labelElement={<div style={{
            maxWidth: "24rem",
            textAlign: "right",
            float: "right",
            textWrap: "wrap",
            marginRight: "1rem"
        }}>{_.has(mp,"description") ? mp.description : "..."}</div>}>
        
    </MenuItem>
    )
}


/**
 * @description MaintenanceProcedureInput component for selecting a MaintenanceProcedure with minimal appearance. Does not mean that 
 * only a single MaintenanceProcedure can be selected, but the button design is minimal.
 * @param {Object} props 
 * @param {Array} props.selectedItems The currently selected item tags 
 * @returns 
 */
export function MaintenanceProcedureInput({ selectedItems = [], onItemSelect, isRequired = true, helperText = "", inline = false, showLabel = true, disabled = false }) {
    const [queryString, setQueryString] = useState("")
    const debouncedString = useDebounce(queryString, 200)
    const { data: items, isLoading, isFetching } = api.maintenance.procedures.queryMaintenanceProcedures.useGetMaintenanceProcedureByQuery({ search_string : debouncedString})
    /**
     * @description Handles the item rendering
     * @param {*} item The MaintenanceProcedure item
     * @returns 
     */
    const renderMaintenanceProcedure = (item, { handleClick, handleFocus, index, modifiers, query }) => {
        return <MaintenanceProcedureMenuItem key={`${item}-${index}`}
            {...{
                selected : _.includes(selectedItems, item.procedure_tag),
                procedure_tag: item,
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
            itemRenderer={renderMaintenanceProcedure}
            onQueryChange={queryString => setQueryString(queryString)}
            onItemSelect={procedure_tag => onItemSelect(procedure_tag)}
            menuProps={{style : {minWidth : "750px", minHeight : "50vh"}}}>
            
            <Button icon={"plus"} minimal={true} intent="primary" loading={isLoading} />
            </Select>
        )
}


