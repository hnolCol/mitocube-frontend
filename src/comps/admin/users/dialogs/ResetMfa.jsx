import { useState } from "react";
import { Dialog } from "@blueprintjs/core";
import { Callout } from "@blueprintjs/core";
import { api } from "@/api";
import _ from "lodash";

export function ResetMfaDialog({ tag, isOpen, onClose }) {
    const [resetError, setResetError] = useState(undefined)
    const { mutate: resetMfa, isPending } = api.users.edit.usePostResetUserMfa({
        onSuccess: () => {
            setResetError(undefined)
            if (_.isFunction(onClose)) onClose(true)
        },
        onError: (error) => {
            setResetError(error?.response?.data?.detail || "Failed to reset MFA.")
        }
    })

    const handleReset = () => {
        resetMfa({ tag })
    }

    const handleClose = () => {
        setResetError(undefined)
        if (_.isFunction(onClose)) onClose(false)
    }

    return (
        <Dialog isOpen={isOpen} onClose={handleClose} title="Reset multi-factor authentication">
            <div className="padding--medium">
                <p>
                    Resetting the multi-factor authentication of <strong>{tag}</strong> does
                    not change the password. Upon the next login, the user is asked to set up
                    multi-factor authentication again, for example after losing access to the
                    authentication device. The user is notified by email.
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
                        {isPending ? "Resetting..." : "Reset MFA"}
                    </button>
                </div>
            </div>
        </Dialog>
    );
}
