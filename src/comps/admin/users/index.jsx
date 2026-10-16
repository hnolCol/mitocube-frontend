import { api } from "@/api"; import { useState } from "react";
import useDebounce from "../../../hooks/useDebounce"
import { UserCount } from "./Count";
import _ from "lodash"
import { UserItem } from "./UserItem";
import  { motion } from "framer-motion";
import { Dialog } from "@blueprintjs/core";
import { AddUserDialog } from "./dialogs/AddUser";
import { UserRoleSelection } from "./UserRoleSelection";

const ROLE_FILTER_NONE = -1

export function UsersAdminView({ authenticationStatus }) {
    const [dialogState, setDialogState] = useState({ isOpen: false })
    const [searchString, setSearchString] = useState()
    const [selectedRole, setSelectedRole] = useState(ROLE_FILTER_NONE)
    const debouncedSearchString = useDebounce(searchString, 30)
    const roles = selectedRole === ROLE_FILTER_NONE ? undefined : [selectedRole]
    const { data: user_tags } = api.users.queryByQuery.useGetUserByQuery({
        search_string: debouncedSearchString,
        roles,
        limit: 50
    });
    const isAdmin = _.toNumber(authenticationStatus?.role) === 4
    return (
        <div style={{
            width: "90vw",
            height : "85vh",
            margin: "40px auto",
            padding: 32,
            background: "#fff",
            borderRadius: 10,
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)"
        }}>
            <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24, letterSpacing: -1 }}>Users Admin</h2>
            <Dialog isOpen={dialogState.isOpen} onClose={() => setDialogState({ isOpen: false })} title="Add new user">
                <AddUserDialog onCancel={() => setDialogState({ isOpen: false })} />
            </Dialog>
            <div style={{ marginBottom: 24 }}>
                <div className="flex center-items">
                <input
                    className="search-input"
                    type="text"
                    placeholder="Search users ..."
                    value={searchString || ""}
                    onChange={(e) => setSearchString(e.target.value)}
                    />
                    <motion.button
                        whileHover={{backgroundColor : "#fff"}}
                        className="action-button"
                        aria-label="Add Metatext"
                        onClick={() => setDialogState({ isOpen: true, edit: false, text: "", title: "" })}
                    >
                        <span style={{ fontWeight: "bold", lineHeight: "1" }}>+</span>
                    </motion.button>
                    </div>
                <div className="flex center-items margin-top--little">
                    <span className="font-size--small" style={{ marginRight: "0.5rem" }}>Filter by role:</span>
                    <UserRoleSelection
                        selectedRole={selectedRole}
                        onRoleChange={(role_tag) => setSelectedRole(prev => prev === _.toNumber(role_tag) ? ROLE_FILTER_NONE : _.toNumber(role_tag))}
                    />
                </div>
                <div style={{ color: "#666", fontSize: 15 }}>
                    {_.isArray(user_tags) ? (
                        <div className="flex flex-column">
                            <div>
                                <span>
                                <strong>{user_tags.length}</strong> / <UserCount />{" "}
                                <span style={{ fontSize: 13, color: "#aaa" }}>(shown/total)</span>
                                </span>
                            {_.isString(searchString) && debouncedSearchString.length > 0 ? (
                                    <span className="padding-left--little">
                                            <strong>Search term:</strong> {debouncedSearchString}
                                    </span>
                            ) : null}
                            </div>
                            <div className="flex flex-column" style={{height : "65vh", overflowY: "scroll"}}>
                                {user_tags.map((user_tag, idx) => (
                                    <div key={`${user_tag}-${idx}`} className="margin-right--little margin-bottom--little">
                                        <UserItem  tag={user_tag} canBlock={isAdmin} canEditRole={isAdmin} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    )
}
