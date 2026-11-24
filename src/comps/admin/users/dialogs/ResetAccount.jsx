import { useState } from "react";
import { Dialog } from "@blueprintjs/core";
import { Callout } from "@blueprintjs/core";
import { api } from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import _ from "lodash";

export function ResetAccountDialog({ tag, isOpen, onClose }) {
    const queryClient = useQueryClient();
    const [resetError, setResetError] = useState(undefined)
    const { mutate: resetAccount, isPending } = api.users.edit.usePostResetUserAccount({
        onSuccess: () => {
            setResetError(undefined)
            if (_.isFunction(onClose)) onClose(true)
        },
        onError: (error) => {
            setResetError(error?.response?.data?.detail || "Failed to reset user account.")
        }
    })

    const handleReset = () => {
        resetAccount({ tag })
    }

    const handleClose = () => {
        setResetError(undefined)
        if (_.isFunction(onClose)) onClose(false)
    }

    return (
        <Dialog isOpen={isOpen} onClose={handleClose} title="Reset user account">
            <div className="padding--medium">
                <p>
                    Resetting the account of <strong>{tag}</strong> generates a new random
                    password and disables the user's multi-factor authentication.
                    The new password is sent to the user's email address. The user logs in
                    with the new password and sets up multi-factor authentication again.
                </p>
                {_.isString(resetError) ? (
                    <Callout intent="danger" style={{ marginBottom: 12 }}>
                        {resetError}
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
                        disabled={isPending}
                        className={`dialog-button bg--blue-light ${isPending ? "opacity--disabled" : ""}`}
                        type="button"
                        onClick={handleReset}
                    >
                        {isPending ? "Resetting..." : "Reset account"}
                    </button>
                </div>
            </div>
        </Dialog>
    );
}
