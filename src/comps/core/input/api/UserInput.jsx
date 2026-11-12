import { useEffect, useState } from "react"
import useDebounce from "../../../../hooks/useDebounce"
import { Button, FormGroup, MenuItem, Tag } from "@blueprintjs/core"
import { getUserFullName } from "../../../../services/format/user"
import { MultiSelect } from "@blueprintjs/select"
import _ from "lodash"
import { api } from "@/api"; 
import { ResearchGroupText } from "@/comps/admin/researchgroup/ResearchGroupText"

const ROLE_LABELS = { 2: "Group Curator", 3: "Curator", 4: "Admin" }

/**
 * @description Reports the head (PI / group curator) tags of one research group upward.
 * Renders nothing. Used to pin the own group curators in the UserInput dropdown.
 * @param {Object} props
 * @param {String} props.group_tag Research group tag
 * @param {Function} props.onHeads Callback with the array of head user tags
 * @returns {null}
 */
function GroupHeadsProbe({ group_tag, onHeads }) {
    const { data: head_tags } = api.researchgroups.useGetResearchGroupHeads({ tag: group_tag }, { enabled: _.isString(group_tag) })
    useEffect(() => {
        if (_.isArray(head_tags)) onHeads(head_tags)
    }, [group_tag, head_tags])
    return null
}


export function UserFullName({ tag }) {
    const { data: user, isSuccess } = api.users.core.useGetPublicUserByTag({tag}, {enabled : _.isString(tag)})
    return isSuccess ? <span>{getUserFullName(user)}</span> : null 
}

export function UserMenuItem({ tag, handleClick, handleFocus, modifiers, selected = false }) {
    
    const { data: user, isSuccess } = api.users.core.useGetPublicUserByTag({ tag }, { enabled: _.isString(tag) })
    const { data : research_groups, isSuccess : isResearchGroupSuccess } = api.researchgroups.useGetResearchGroupsByQuery({user_tags : tag}, {enabled : isSuccess && _.isString(tag)})
    const { data: role } = api.users.roles.useGetUserRoleByTag({ tag }, { enabled: _.isString(tag), staleTime: 300000 })
    const roleLabel = _.isFinite(_.toNumber(role)) ? ROLE_LABELS[_.toNumber(role)] : undefined
    return isSuccess ? <MenuItem
        key={tag}
        icon={selected ? "tick" : "blank"}
        text={getUserFullName(user)}
        onClick={handleClick} onFocus={handleFocus} active={modifiers.active}
        labelElement={
            <div style={{ maxWidth: "20rem", textAlign: "right", float: "right", textWrap: "wrap", marginRight: "1rem", fontSize : "0.6rem" }}>
                {roleLabel ? <Tag minimal={true} intent={_.toNumber(role) >= 3 ? "danger" : "primary"} style={{ marginBottom: 2 }}>{roleLabel}</Tag> : null}
                <div>{isResearchGroupSuccess && _.isArray(research_groups) ?
                    research_groups.map(rg_tag => <ResearchGroupText key={rg_tag} research_group_tag={rg_tag} />) : null}
                </div></div>} /> : null 
}


/**
 * 
 * @param {Object} props 
 * @param {String[]} props.selected_users
 * @returns 
 */
export function UserInput({selected_users = [], onUserSelect, isRequired = true, helperText = "", inline = false, showLabel = true, callbackKey = "", disabled = false, label = "Collaborators", showIsRequired = false, matchTargetWidth = true, limit  = 20, current_user_tag = undefined}) {
    const [queryString,setQueryString] = useState("")
    const debouncedString = useDebounce(queryString, 200)
    const [groupCuratorTags, setGroupCuratorTags] = useState([])

    const { data : user_tags, isLoading, isFetching } = api.users.queryByQuery.useGetUserByQuery({search_string : debouncedString, limit})

    // own research groups -> their heads (group curators), excluding the asking user
    const { data: myGroups } = api.researchgroups.useGetResearchGroupsOfUser(
        { user_tag: current_user_tag }, { enabled: _.isString(current_user_tag), staleTime: 300000 }
    )
    const handleHeads = (tags) => {
        setGroupCuratorTags(prev => _.uniq([...prev, ...tags]))
    }
    // pinned first so the own group curator always shows up (e.g. when composing a
    // support message), even with an empty query; never pin the asking user themself
    const pinnedCurators = _.isArray(groupCuratorTags) ? groupCuratorTags.filter(t => t !== current_user_tag) : []
    const items = _.uniq([...pinnedCurators, ...(_.isArray(user_tags) ? user_tags : [])])
    /**
     * 
     * @param {} user 
     * @param {*} param1 
     * @returns 
     */
    const renderUser = (user_tag, { handleClick, handleFocus, index, modifiers, query }) => {
        return <UserMenuItem key={user_tag} tag={user_tag} {...{ handleClick, handleFocus, modifiers}} />
     
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
        
        <>
        {_.isString(current_user_tag) && _.isArray(myGroups) ? myGroups.map(g => (
            <GroupHeadsProbe key={g} group_tag={g} onHeads={handleHeads} />
        )) : null}
        <MultiSelect
            disabled={disabled}
            itemRenderer={renderUser}
            items={items}
            tagRenderer={renderValue}
            selectedItems={selected_users}
            onItemSelect={handleUserSelection}
            onRemove={handleUserSelection}
            resetOnSelect={false}
            query={queryString}
            fill = {true}
            onQueryChange={(query) => setQueryString(query)}
            popoverProps={{ minimal: true, matchTargetWidth }}
            menuProps={{style : {minWidth:"700px"}}}
            tagInputProps={{
                rightElement : <Button icon="blank" minimal={true} loading={isLoading || isFetching} intent="primary" />,
                inputProps : {intent : "primary"},
                tagProps: { minimal: true },
                placeholder : "Find a colleague ..."
            }}
            
            />
        </>
        </FormGroup>
}