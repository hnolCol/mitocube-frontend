import { MultiSelect } from "@blueprintjs/select"
import { useGetPublicUserInfo } from "../../../hooks/queries/user.hooks"
import _ from "lodash"
import { FormGroup, MenuItem } from "@blueprintjs/core"
import { addItemToArrayOrRemoveItIfPresent } from "../../../services/arrays/transforms"
import Loading from "../base/loading"




function UserSelection({ authenticationStatus, onUserSelection, selectedUsers, formGroupProps = {label : "Collaborators"}}) {
    const { isLoading, isFetching, isSuccess, data : users } = useGetPublicUserInfo()
    const renderUser = (item, props) => {
        const itemText = `${item.firstname} ${item.lastname}`
        return <MenuItem
            text={itemText}
            key={`${item.label}`} //must be unique
            labelElement={<div className="labelelement-wrap--fixed-width">{`${item.institute} - ${item.research_group} - ${item.email}`}</div>}
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
            isSuccess && _.isArray(users) && users.length > 0 ? 
                <div className="intent-margin-top--little">
                    <FormGroup {...formGroupProps}>
                <MultiSelect
                    itemRenderer={renderUser}
                    items={users.filter(user => user.label !== authenticationStatus.label)}
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
                : null}
            {isLoading || isFetching ? <Loading /> : null}
        </div>
    )
}

export default UserSelection