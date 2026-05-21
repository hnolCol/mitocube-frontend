import { useState } from "react";
import useDebounce from "../../../../hooks/useDebounce";
import _ from "lodash"
import { RemoveButton } from "../buttons/RemoveButton";
import PropTypes from "prop-types"
import { AddButton } from "../buttons/AddButton";
import { UserIcon } from ".";
import { motion } from "framer-motion";
import { api } from "@/api";



SelectableUser.propTypes = {
    tag: PropTypes.string.isRequired,
    onSelect: PropTypes.func.isRequired,
    isSelected: PropTypes.bool.isRequired,
    onRemove: PropTypes.func,
}

SelectableUser.defaultProps = {
    isSelected: false 
}
/**
 * @description Selectable users using the 'isSelected' state (managed from outisde) and function to remove (onRemove) or
 * to select the user from a list (onSelect)
 * @param {*} param0 
 * @returns 
 */
function SelectableUser({ tag, onRemove, onSelect, isSelected, isLoading }) {
    //get public user data
    const { data: user, isSuccess } = api.users.core.useGetPublicUserByTag({ tag },{ enabled : _.isString(tag)})

    return (<motion.div className="padding--little div--round" style={{backgroundColor : "#fefefe"}} whileHover={{backgroundColor : "#efefef"}}>
        {isSuccess && _.isObject(user) ? <div className="flex padding--little center-items" style={{justifyContent: "space-between"}}>
            <div><UserIcon text={user.firstname.charAt(0) + user.lastname.charAt(0)} /></div>
            <div style={{ justifyContent: "center" }} className="flex flex-column"><div>{user.firstname} {user.lastname}</div></div>
            <div style={{float: "right"}}>
            {isSelected ?
                <RemoveButton isLoading={isLoading} fontColor={"#000000"} onRemove={() => onRemove(tag)} />
                : 
                    <AddButton isLoading={isLoading} fontColor={"#000000"} onSelect={() => onSelect(tag)} />}
            </div>
        </div> : null}
    </motion.div>)

}




/**
 * @description Component to edit users. 
 * @param {*} param0 
 * @returns 
 */
export function EditableUserList({ selected_user_tags, title = "User Selected", onRemove, onSelect, isLoading }) {

    const [query, setQuery] = useState()
    const debounceQuery = useDebounce(query, 500)
    
    const { data: user_tags, isSuccess : isUserSuccess } = api.users.queryByQuery.useGetUserByQuery({ search_string: debounceQuery })
    
    return (<div>
        
        {_.isString(title) && title.length > 0 ? <h3>{title}</h3> : null}
        
        <input type="text" className="search-input" placeholder="Search user" isRequired={false} onChange={(e) => setQuery(e.target.value)} />
        
        <div className="font-size--smallest margin-left--little">
            {_.isObject(user_tags) && isUserSuccess ?
                <span>Selected users: <strong>{selected_user_tags.length}</strong>. {_.isString(query) && query.length > 0 ? `Querying '${query}' results in ${user_tags.length} users. ` : ""} </span> : null}
        </div>
        
        <div className="flex flex-column container--scroll-y-hide-x padding--medium" style={{ height: "35vh", gap : "0.5rem" }}>
            {isUserSuccess ? user_tags.map(user_tag => <SelectableUser
                isSelected={selected_user_tags.includes(user_tag)}
                tag={user_tag}
                isLoading={isLoading}
                onSelect={onSelect}
                onRemove={onRemove} />) : null}
            
        </div>
        {/* <Button text="Save" onClick={() => onSave(selectedUsers)}/> */}
    </div>)
}