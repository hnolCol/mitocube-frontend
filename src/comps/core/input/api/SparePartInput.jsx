import { Button, FormGroup, MenuItem } from "@blueprintjs/core"
import { MultiSelect, Select } from "@blueprintjs/select"
import { useState } from "react"
import useDebounce from "../../../../hooks/useDebounce"
import _ from "lodash"
import hooks from "@mitocube/api-hooks"
import "./style.css"

import {copyTextToClipboard} from "../../../../services/clipboard"

import {openInNewTab} from "../../../../services/tabs/newtab"
function SparePartMenuItem({ tag, handleClick, handleFocus, index, modifiers, query, selected}) {
    
    const { data: sparepart, isSuccess, isLoading, isError } = hooks.maintenance.spareparts.useGetSparePartByTag({ tag })
    if (isError) return null 
    return (<MenuItem
        icon={selected ? "tick" : "blank"}
        text={isLoading ? "... " : sparepart.text}
        onClick={handleClick}
        onFocus={handleFocus}
        active={modifiers.active}
        labelElement={<div style={{
            maxWidth: "24rem",
            textAlign: "right",
            float: "right",
            textWrap: "wrap",
            marginRight: "1rem"
        }}>
            
            <div className="flex flex-column">
                <div>{_.has(sparepart, "company") ? sparepart.company : "..."}</div>
                <div>{_.has(sparepart, "product_id") ? <div className="flex" style={{ float: "right" }}><strong>{sparepart.product_id}</strong>
                    {/* //button to copy the product id  */}
                    <Button icon={"clipboard"}
                    minimal
                    small
                    fill={false}
                    onClick={e => {
                        e.stopPropagation()
                        copyTextToClipboard(sparepart.product_id)                
                    }} /> </div> : "..."}
                    {_.has(sparepart, "link") && sparepart.link.length > 0 ?
                        //link to webpage if available 
                    <Button icon={"arrow-right"}
                        minimal
                        small
                        fill={false}
                        onClick={e => {
                            e.stopPropagation()
                            openInNewTab(sparepart.link)
                                    
                        }} /> : null}
                </div>
                <div>{_.has(sparepart, "price") && sparepart.price > 0 ? <strong>{sparepart.price} €</strong> : "na" }</div>
                
                <div className="font-size--small">{_.has(sparepart, "description") ? sparepart.description : "..."}</div>
                        
            </div>
                
            
            
        </div>}>
        
    </MenuItem>
    )
}


/**
 * @description SparePartInput component for selecting a SparePart with minimal appearance. Does not mean that 
 * only a single SparePart can be selected, but the button design is minimal.
 * @param {Object} props 
 * @param {Array} props.selectedItems The currently selected item tags 
 * @returns 
 */
export function SparePartInput({ selectedItems = [], onItemSelect, isRequired = true, helperText = "", inline = false, showLabel = true, disabled = false }) {
    const [queryString, setQueryString] = useState("")
    const debouncedString = useDebounce(queryString, 200)
    const { data: items, isLoading, isFetching } = hooks.maintenance.spareparts.useGetSparePartByQuery({ search_string: debouncedString })    

    /**
     * @description Handles the item rendering
     * @param {*} item The SparePart item
     * @returns 
     */
    const renderSparePart = (item, { handleClick, handleFocus, index, modifiers, query }) => {
        return <SparePartMenuItem key={`${item}-${index}`}
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
            itemRenderer={renderSparePart}
            onQueryChange={queryString => setQueryString(queryString)}
            onItemSelect={sparepart_tag => onItemSelect(sparepart_tag)}>
            
            <Button icon={"plus"} minimal={true} intent="primary" />
            </Select>
        )
}




export function SparePartsInput({selectedItems = [], onItemSelect, isRequired = true, helperText = "", inline = false, showLabel = true, disabled = false}) {
    
    const [queryString, setQueryString] = useState("")
    const debouncedString = useDebounce(queryString,200)
    const { data: items, isLoading, isFetching } = hooks.maintenance.spareparts.useGetSparePartByQuery({ search_string: debouncedString })    
    
    const renderSparePart = (item, { handleClick, handleFocus, index, modifiers, query }) => {
        return <SparePartMenuItem key={`${item}-${index}`}
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
            itemRenderer={renderSparePart}
            items={_.isArray(items) ? items : []}
            tagRenderer={renderValue}
            selectedItems={selectedItems}
            onItemSelect={handleItemSelection}
            onRemove={handleItemSelection}
            resetOnSelect={true}
            query={queryString}
            placeholder="Select SparePart..."
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
