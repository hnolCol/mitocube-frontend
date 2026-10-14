import { useState } from "react";
import { Dialog } from "@blueprintjs/core";
import { Callout } from "@blueprintjs/core";
import { api } from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import _ from "lodash";

export function BlockUserDialog({ tag, isOpen, onClose }) {
    const queryClient = useQueryClient();
    const [blockError, setBlockError] = useState(undefined)
    const { mutate: blockUser, isPending } = api.users.active.usePostBlockUser({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getUserActive", tag] })
            queryClient.invalidateQueries({ queryKey: ["getPublicUserByLabel", tag] })
            setBlockError(undefined)
            if (_.isFunction(onClose)) onClose(true)
        },
        onError: (error) => {
            setBlockError(error?.response?.data?.detail || "Failed to block user.")
        }
    })

    const handleBlock = () => {
        blockUser({ tag })
    }

    const handleClose = () => {
        setBlockError(undefined)
        if (_.isFunction(onClose)) onClose(false)
    }

    return (
        <Dialog isOpen={isOpen} onClose={handleClose} title="Block user">
            <div className="padding--medium">
                <p>
                    Blocking the user <strong>{tag}</strong> will prevent the user from logging in.
                    The user is not deleted and can be unblocked again later.
                </p>
                {_.isString(blockError) ? (
                    <Callout intent="danger" style={{ marginBottom: 12 }}>
                        {blockError}
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
                        onClick={handleBlock}
                    >
                        {isPending ? "Blocking..." : "Block user"}
                    </button>
                </div>
            </div>
        </Dialog>
    );
}
