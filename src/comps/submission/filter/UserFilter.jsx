import { useState } from "react"
import _ from "lodash"
import useDebounce from "../../../hooks/useDebounce"
import { addItemToArrayOrRemoveItIfPresent } from "../../../services/arrays/transforms"
import { getUserFullName } from "../../../services/format/user"
import { api } from "@/api"
import { UserMenuItem } from "@/comps/core/input/api/UserInput"
import { Select } from "@blueprintjs/select"

export function UserDatasetFilter({ setSubmissionFilter, submissionFilter, disabled = false }) {
    const [searchString, setSearchString] = useState("")
    const debouncedString = useDebounce(searchString, 300)

    const selectedUsers = submissionFilter.user || []

    const { data: userResults, isLoading } = api.users.queryByQuery.useGetUserByQuery(
        { search_string: debouncedString, limit: 20 },
        { staleTime : 6000 }
    )

    const renderUser = (item, { handleClick, handleFocus, index, modifiers, query }) => { 
        const selected = _.has(submissionFilter, "user") && _.isArray(submissionFilter.user) && submissionFilter.user.some(u => u.tag === item)
        return <UserMenuItem tag={item} selected={selected} {...{handleClick, handleFocus, modifiers, selected}} />


    }
    

    const onUserSelect = (userTag) => {
        const newArray = addItemToArrayOrRemoveItIfPresent({
            array: selectedUsers,
            item: { tag: userTag },
        })
        setSubmissionFilter(prevValues => ({
            ...prevValues,
            user: newArray,
        }))
        setSearchString("")
    }

    const handleRemove = (userTag) => {
        const newArray = selectedUsers.filter(u => u.tag !== userTag)
        setSubmissionFilter(prevValues => ({
            ...prevValues,
            user: newArray,
        }))
    }

    return (
        <div style={{ width: "100%", paddingRight: "0.1rem" }}>
            <h4>Users</h4>
            {/* <input
                className="search-input"
                value={searchString}
                onChange={(e) => setSearchString(e.target.value)}
                placeholder="Search by name..."
                style={{ width: "100%" }}
            /> */}
            
            {/* {_.isArray(userResults) && userResults.length > 0 ? (
                <div style={{ marginTop: "0.25rem" }}>
                    {userResults
                        .filter(tag => !selectedUsers.some(su => su.tag === tag))
                        .map(tag => (
                            <UserSearchResult key={tag} tag={tag} onSelect={() => onUserSelect(tag)} />
                        ))}
                </div>
            ) : null} */}


             <Select
                            minimal
                            filterable={false}
                            menuProps={{ style: { minWidth: "500px", maxHeight: "40vh" } }}
                            disabled={disabled}
                            items={_.isArray(userResults) ? userResults : []}
                            itemRenderer={renderUser}
                            onItemSelect={onUserSelect}
                        >
            
                            <input
                                className="search-input"
                                type="text"
                                placeholder="Search for users ..."
                                value={searchString}
                                onChange={(e) => setSearchString(e.target.value)}
                />
                
            
                        </Select>
            {isLoading ? <div className="font-size--smallest">Searching...</div> : null}
            <div className="font-size--smallest" style={{ marginTop: "0.25rem" }}>
                Submissions created or collaborated on by the selected user(s) will be displayed.
            </div>
            {selectedUsers.length > 0 && (
                <div style={{ marginTop: "0.5rem" }}>
                    {selectedUsers.map(u => (
                        <UserFilterDisplay key={u.tag} tag={u.tag} onRemove={() => handleRemove(u.tag)} />
                    ))}
                </div>
            )}
        </div>
    )
}

function UserSearchResult({ tag, onSelect }) {
    const { data: user } = api.users.core.useGetPublicUserByTag({ tag }, { enabled: !!tag })
    return (
        <div
            onClick={onSelect}
            style={{ padding: "0.4rem 0.5rem", cursor: "pointer", borderRadius: "3px" }}
            className="attribute__filter__button"
        >
            {user ? getUserFullName(user) : tag}
        </div>
    )
}

function UserFilterDisplay({ tag, onRemove }) {
    const { data: user } = api.users.core.useGetPublicUserByTag({ tag }, { enabled: !!tag })

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.5rem",
            marginBottom: "0.5rem",
            backgroundColor: "#f5f5f5",
            borderRadius: "3px"
        }}>
            <div style={{ fontWeight: "500" }}>
                {user ? getUserFullName(user) : tag}
            </div>
            <button
                onClick={onRemove}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.5rem", color: "#666", padding: "0 0.5rem" }}
            >
                ×
            </button>
        </div>
    )
}