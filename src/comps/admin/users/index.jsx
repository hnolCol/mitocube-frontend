import { api } from "@/api"
import { useState } from "react"
import useDebounce from "../../../hooks/useDebounce"
import { UserCount } from "./Count"
import _ from "lodash"
import { Alert, Dialog } from "@blueprintjs/core"
import { UserItem } from "./UserItem"
import { AddButton } from "@/comps/core/base/buttons/AddButton"
import { AddUserDialog } from "./dialogs/AddUser"
import { UserRoleSelection } from "./UserRoleSelection"

const ROLE_FILTER_NONE = -1
const LIMIT_OPTIONS = [10, 25, 50, 100]

export function UsersAdminView({ authenticationStatus }) {

    const [dialogState, setDialogState] = useState({ isOpen: false })
    const [alertState, setAlertState] = useState({ isOpen: false })
    const [searchString, setSearchString] = useState("")
    const [limit, setLimit] = useState(LIMIT_OPTIONS[0])
    const [selectedRole, setSelectedRole] = useState(ROLE_FILTER_NONE)

    const debouncedSearchString = useDebounce(searchString, 300)
    const roles = selectedRole === ROLE_FILTER_NONE ? undefined : [selectedRole]

    const { data: user_tags, isLoading, isError } = api.users.queryByQuery.useGetUserByQuery({
        search_string: debouncedSearchString,
        roles,
        limit
    })

    const isAdmin = _.toNumber(authenticationStatus?.role) === 4

    return (
        <div
            className="div--expand padding--medium"
            style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}
        >
            <div className="flex flex-column margin--medium padding--medium" style={{ gap: "0.4rem" }}>
                <h3>Users</h3>
                <div className="flex">
                    <Alert
                        isOpen={alertState.isOpen}
                        intent="success"
                        confirmButtonText="OK"
                        onConfirm={() => setAlertState({ isOpen: false })}
                        onClose={() => setAlertState({ isOpen: false })}
                    >
                        <p>User created successfully.</p>
                    </Alert>
                    <Dialog isOpen={dialogState.isOpen} onClose={() => setDialogState({ isOpen: false })} title="Add new user">
                        <AddUserDialog
                            onCancel={() => setDialogState({ isOpen: false })}
                            onCreated={() => {
                                setDialogState({ isOpen: false })
                                setAlertState({ isOpen: true })
                            }}
                        />
                    </Dialog>
                    <AddButton onSelect={() => setDialogState({ isOpen: true })} />
                </div>
                <div className="flex flex-column div--expand padding--medium" style={{ gap: "0.4rem", minHeight: 0 }}>
                    <input
                        className="search-input"
                        type="text"
                        placeholder="Search users ..."
                        value={searchString}
                        onChange={(e) => setSearchString(e.target.value)}
                    />
                    <div className="flex center-items" style={{ gap: "0.5rem" }}>
                        <span className="font-size--small">Filter by role:</span>
                        <UserRoleSelection
                            selectedRole={selectedRole}
                            onRoleChange={(role_tag) => setSelectedRole(prev => prev === _.toNumber(role_tag) ? ROLE_FILTER_NONE : _.toNumber(role_tag))}
                        />
                        <span className="font-size--small padding-left--little">Limit:</span>
                        {LIMIT_OPTIONS.map(option => (
                            <button
                                key={option}
                                className={"padding--little margin-left--little"}
                                style={{
                                    backgroundColor: option === limit ? "#efefef" : "transparent",
                                    borderRadius: "5px",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: "0.8rem",
                                    fontWeight: option === limit ? 600 : 400
                                }}
                                onClick={() => setLimit(option)}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                    <div style={{ height: "1.5rem" }}>
                        {isError ? <span className="font-size--small" style={{ color: "#a82a2a" }}>Error loading users.</span> : null}
                        {isLoading ? <span className="font-size--small">Searching...</span> : null}
                    </div>
                    <div className="flex center-items font-size--small" style={{ color: "#666", gap: "0.3rem" }}>
                        <strong>{_.isArray(user_tags) ? user_tags.length : 0}</strong>
                        <span>/ <UserCount /> users (shown/total)</span>
                    </div>
                    <div style={{ height: "70vh", overflowY: "scroll", paddingBottom: "3rem", paddingRight: "0.5rem" }} className="flex flex-column">
                        {_.isArray(user_tags) ? user_tags.map((user_tag, idx) => (
                            <div key={`${user_tag}-${idx}`} className="margin-bottom--little">
                                <UserItem tag={user_tag} canBlock={isAdmin} canEditRole={isAdmin} />
                            </div>
                        )) : null}
                    </div>
                </div>
            </div>
        </div>
    )
}
