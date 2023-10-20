import { MultiSelect, Select } from "@blueprintjs/select"
import { useGetPublicUserInfo } from "../../../hooks/queries/user.hooks"
import _ from "lodash"
import { Button, FormGroup, Menu, MenuItem } from "@blueprintjs/core"
import { useState } from "react"
import { addItemToArrayOrRemoveItIfPresent } from "../../../services/arrays/transforms"

function UserSelection({ authenticationStatus, onUserSelection, selectedUsers, formGroupProps = {label : "Collaborators"}}) {

    const { isLoading, isFetching, isSuccess, data } = useGetPublicUserInfo({ tokenString: authenticationStatus.token })
    
    console.log(onUserSelection,selectedUsers,authenticationStatus)

    const renderUser = (item, props) => {
        const itemText = `${item.firstname} ${item.lastname}`
        return <MenuItem
            text={itemText}
            key={`${item.label}`} //must be unique
            label={`${item.institute} - ${item.research_group} - ${item.email}`}
            onClick={props.handleClick}
            onFocus={props.handleFocus}
            active={props.modifiers.active}
            icon={selectedUsers.includes(item)?"tick":"user"}
            shouldDismissPopover={true}/>
    }
    const renderSelectedItemAsTag = (item) => {
        return item.firstname
    }

    const handleUserSelection = (item) => {
        const updatedUserSelection = addItemToArrayOrRemoveItIfPresent({ array: selectedUsers, item })
        onUserSelection(updatedUserSelection)
    }

    return (
        
        <div>{
            isSuccess && _.isArray(data.users) && data.users.length > 0 ? 
                <div className="intent-margin-top--little">
                    <FormGroup {...formGroupProps}>
                <MultiSelect
                    itemRenderer={renderUser}
                    items={data.users.filter(user => user.label !== authenticationStatus.label)}
                    tagRenderer={renderSelectedItemAsTag}
                    onItemSelect={(item) => handleUserSelection(item)}
                    popoverProps={{ matchTargetWidth: true, minimal: true }}
                    tagInputProps={{minimal : true, large : false, round : true}}
                    resetOnSelect={true}
                    fill={true}
                        selectedItems={selectedUsers}
                            onRemove={(item) => handleUserSelection(item)} />
                    </FormGroup>
            </div>
                :null }
        </div>
    )
}

export default UserSelection