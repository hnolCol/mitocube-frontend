import { useState } from "react"
import useDebounce from "../../../../hooks/useDebounce"
import { Button, FormGroup, MenuItem } from "@blueprintjs/core"
import { getUserFullName } from "../../../../services/format/user"
import { MultiSelect } from "@blueprintjs/select"
import _ from "lodash"
import { api } from "@/api"; 
import { use } from "react"


export function UserFullName({ tag }) {
    const { data: user, isSuccess } = api.users.modify.useGetPublicUserByTag({tag}, {enabled : _.isString(tag)})
    return isSuccess ? <span>{getUserFullName(user)}</span> : null 
}

export function UserMenuItem({ tag, handleClick, handleFocus, modifiers }) {
    
    const { data: user, isSuccess } = api.users.modify.museGetPublicUserByTag({tag}, {enabled : _.isString(tag)})
    return isSuccess ? <MenuItem
        key={tag}
        text={getUserFullName(user)}
        onClick={handleClick} onFocus={handleFocus} active={modifiers.active}
        labelElement={<div style={{ maxWidth: "24rem", textAlign: "right", float: "right", textWrap: "wrap", marginRight: "1rem" }}><div><h4>{user.research_group}</h4><p>{user.institute}</p></div></div>}/> : null 
}


/**
 * 
 * @param {Object} props 
 * @param {String[]} props.selected_users
 * @returns 
 */
export function UserInput({selected_users = [], onUserSelect, isRequired = true, helperText = "", inline = false, showLabel = true, callbackKey = "", disabled = false, label = "Collaborators", showIsRequired = false, matchTargetWidth = true, limit  = 20}) {
    const [queryString,setQueryString] = useState("")
    const debouncedString = useDebounce(queryString, 200)

    const { data : user_tags, isLoading, isFetching } = api.users.queryByQuery.useGetUserByQuery({search_string : debouncedString, limit})
    /**
     * 
     * @param {} user 
     * @param {*} param1 
     * @returns 
     */
    const renderUser = (user_tag, { handleClick, handleFocus, index, modifiers, query }) => {
        return <UserMenuItem tag={user_tag} {...{ handleClick, handleFocus, modifiers}} />
     
    }
    /**
     * @description Handles the user selection,prevents propagation by default.Calls the callback onUserSelection.
     * @param {Object} user
     * @param {MouseEvent} e
     */
    const handleUserSelection = (user_tag, e) => {
        if (_.isFunction(e.stopPropagation)) {
            e.stopPropagation()
        }
       
        onUserSelect(callbackKey, user_tag)
    }

    const renderValue = (item) => {
        console.log(item)
        return <UserFullName tag={item} />
    }
    return <FormGroup
    style={{margin : "0.1rem"}}
    label={showLabel ? label :undefined}
    labelInfo={showIsRequired ? isRequired ? "(required)" : "(optional)" : undefined}
    inline={inline}
    fill={true}
    disabled={disabled}
        helperText={helperText}>
        
        <MultiSelect
            disabled={disabled}
            itemRenderer={renderUser}
            items={_.isArray(user_tags) ? user_tags : []}
            tagRenderer={renderValue}
            selectedItems={selected_users}
            onItemSelect={handleUserSelection}
            onRemove={handleUserSelection}
            resetOnSelect={true}
            query={queryString}
            fill = {true}
            onQueryChange={(query) => setQueryString(query)}
            popoverProps={{ minimal: true, matchTargetWidth }}
            menuProps={{style : {minWidth:"700px"}}}
            tagInputProps={{
                rightElement : <Button icon="blank" minimal={true} loading={isLoading || isFetching} intent="primary" />,
                inputProps : {intent : "primary"},
                tagProps: { minimal: true },
                placeholder : "User search starts on typing ..."
            }}
            initialContent={null}
            />
        </FormGroup>
}