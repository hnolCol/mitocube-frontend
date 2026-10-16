import { useState } from "react";
import { Dialog, Callout } from "@blueprintjs/core";
import { api } from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import _ from "lodash";
import { UserRoleSelection } from "../UserRoleSelection";
import { UserFullName } from "@/comps/core/input/api/UserInput";

/**
 * @description Dialog to change the role of a user (admin only). Shows the current role
 * as preselected and the role options from the backend; saving posts the new role to
 * the admin-only role change endpoint.
 * @param {Object} props
 * @param {String} props.tag The user tag whose role should be changed
 * @param {Number} props.role The current role of the user
 * @param {Boolean} props.isOpen Whether the dialog is open
 * @param {Function} props.onClose Callback when the dialog is closed
 * @returns {JSX.Element} The edit user role dialog.
 */
export function EditUserRoleDialog({ tag, role, isOpen, onClose }) {
    const queryClient = useQueryClient();
    const [selectedRole, setSelectedRole] = useState(role)
    const [roleError, setRoleError] = useState(undefined)
    const { mutate: changeRole, isPending } = api.users.queryByQuery.usePostUserRoleChange({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getUserRoles", tag] })
            queryClient.invalidateQueries({ queryKey: ["getUserQuery"] })
            setRoleError(undefined)
            if (_.isFunction(onClose)) onClose(true)
        },
        onError: (error) => {
            setRoleError(error?.response?.data?.detail || "Failed to change the user role.")
        }
    })
    const handleRoleChange = (role_tag) => setSelectedRole(_.toNumber(role_tag))
    const handleClose = () => {
        setSelectedRole(role)
        setRoleError(undefined)
        if (_.isFunction(onClose)) onClose(false)
    }
    const handleSave = () => changeRole({ user_tag: tag, role: selectedRole })
    return (
        <Dialog isOpen={isOpen} onClose={handleClose} title="Edit user role">
            <div className="padding--medium">
                <p>
                    Change the role of <UserFullName tag={tag} /> (<strong>{tag}</strong>).
                    Curators can review and curate submissions, admins have full access.
                </p>
                <UserRoleSelection selectedRole={selectedRole} onRoleChange={handleRoleChange} />
                {_.isString(roleError) ? (
                    <Callout intent="danger" style={{ marginBottom: 12 }}>
                        {roleError}
                    </Callout>
                ) : null}
                <div className="flex justify-end gap--small">
                    <button
                        disabled={isPending}
                        className="dialog-button"
                        type="button"
                        onClick={handleClose}
                    >
                        Cancel
                    </button>
                    <button
                        disabled={isPending || _.isEqual(selectedRole, role)}
                        className={`dialog-button bg--blue-light ${isPending || _.isEqual(selectedRole, role) ? "opacity--disabled" : ""}`}
                        type="button"
                        onClick={handleSave}
                    >
                        {isPending ? "Saving..." : "Save role"}
                    </button>
                </div>
            </div>
        </Dialog>
    );
}
