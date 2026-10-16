import { api } from "@/api"; import { useNavigate } from "react-router"
import { motion } from "framer-motion"
import { Tag } from "@blueprintjs/core"
import { useState } from "react"
import _ from "lodash"
import { CreatedAt } from "../../core/metrics/CreatedAt"
import { BlockUserDialog } from "./dialogs/BlockUser"
import { EditUserRoleDialog } from "./dialogs/EditUserRole"

const ROLE_INTENTS = {
    4: "danger",
    2: "warning"
}

export function UserItem({ tag, redirectOnClick = true, onClick, canBlock = false, canEditRole = false }) {
    const redirect = useNavigate()
    const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false)
    const [isEditRoleDialogOpen, setIsEditRoleDialogOpen] = useState(false)
    const {data : user, isLoading, isError, error} = api.users.core.useGetPublicUserByTag({tag}, {enabled: tag && tag.length > 0})
    const { data: isUserActive } = api.users.active.useGetUserIsActive({ tag }, { enabled: _.isString(tag) && tag.length > 0 })
    const { data: userRole } = api.users.roles.useGetUserRoleByTag(
        { tag }, { enabled: _.isString(tag) && tag.length > 0, retry: false })

    if (isLoading) return <div>Loading user...</div>
    if (isError) return <div>Error loading user: {error.message}</div>
    return (
        <div className="flex align-center justify-space-between submission__item__container bg--white" style={{ backgroundColor: "#fff" }}>
            <motion.button
                disabled={!isUserActive}
                style={{ backgroundColor: "#fff", border: "none" }}
                whileHover={{ backgroundColor: "#e0e0e0" }}
                onClick={(e) => {
                    onClick ? onClick(e) : null
                    // Redirect to the submission view
                    redirectOnClick ? redirect(`/admin/users/${tag}`) : null
                    e.stopPropagation()
                }}>
                            <div className="flex">
                                    <div className="flex">
                     {_.isNumber(user.created_at) ?
                        <CreatedAt createdat={user.created_at} addFromNow={false} /> : null}
                                        <span className="padding-left--little">{"|\u00a0"}{`${user.firstname} ${user.lastname}`} </span>
                    </div>
                </div>
            </motion.button>
            <div className="flex align-center gap--small">
                {_.isNumber(userRole) ?
                    <Tag
                        minimal
                        round
                        intent={ROLE_INTENTS[userRole] || "none"}
                        title={`User role: ${userRole}`}
                    >
                        {userRole === 4 ? "Admin" : userRole === 2 ? "Curator" : userRole === 1 ? "Standard" : "Guest"}
                    </Tag> : null}
                <Tag
                    minimal
                    intent={isUserActive ? "success" : "danger"}
                    title={isUserActive ? "User is active" : "User is blocked"}
                >
                    {isUserActive ? "Active" : "Blocked"}
                </Tag>
                {canEditRole ? (
                    <button
                        className="basic-button"
                        onClick={(e) => {
                            e.stopPropagation()
                            setIsEditRoleDialogOpen(true)
                        }}
                    >
                        Edit
                    </button>
                ) : null}
                {isUserActive && canBlock ? (
                    <button
                        className="basic-button"
                        onClick={(e) => {
                            e.stopPropagation()
                            setIsBlockDialogOpen(true)
                        }}
                    >
                        Block
                    </button>
                ) : null}
            </div>
            <BlockUserDialog
                tag={tag}
                isOpen={isBlockDialogOpen}
                onClose={() => setIsBlockDialogOpen(false)}
            />
            {canEditRole ? (
                <EditUserRoleDialog
                    tag={tag}
                    role={_.isNumber(userRole) ? userRole : undefined}
                    isOpen={isEditRoleDialogOpen}
                    onClose={() => setIsEditRoleDialogOpen(false)}
                />
            ) : null}
        </div>
    )
}
