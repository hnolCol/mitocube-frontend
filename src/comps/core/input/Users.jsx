import { MultiSelect, Select } from "@blueprintjs/select"
import { useGetPublicUserInfo } from "../../../hooks/queries/user.hooks"
import _ from "lodash"
import { Button, Menu, MenuItem } from "@blueprintjs/core"
import { useState } from "react"
import { addItemToArrayOrRemoveItIfPresent } from "../../../services/arrays/transforms"



function UserSelection({ authenticationStatus }) {

    const { isLoading, isFetching, isSuccess, data } = useGetPublicUserInfo({ tokenString: authenticationStatus.token })
    
    const [selectedUsers, setSelectedUsers] = useState([])

    const renderUser = (item, props) => {
        
        return <MenuItem
            text={`${item.firstname} ${item.lastname}`}
            key={`${item.firstname}`}
            label={`${item.institute} - ${item.research_group}`}
            onClick={props.handleClick}
            onFocus={props.handleFocus}
            active={props.modifiers.active}
            icon={selectedUsers.includes(item)?"tick":"user"}
            shouldDismissPopover={true}/>
    }
    const renderSelectedItemAsTag = (item) => {
        return item.firstname
    }

    return (
        
        <div>{
            isSuccess && _.isArray(data.users) && data.users.length > 0 ? 
            <div>
                <MultiSelect
                    itemRenderer={renderUser}
                    items={data.users}
                    tagRenderer={renderSelectedItemAsTag}
                    onItemSelect={(item) => setSelectedUsers(addItemToArrayOrRemoveItIfPresent({array : selectedUsers, item}))}
                    popoverProps={{ matchTargetWidth: true, minimal: true }}
                    tagInputProps={{minimal : true, large : false, round : true}}
                    resetOnSelect={true}
                    fill={true}
                    selectedItems={selectedUsers}/>
            </div>
                :null }
        </div>
    )
}

export default UserSelection