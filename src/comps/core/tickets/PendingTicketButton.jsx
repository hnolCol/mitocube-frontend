import { useState } from "react"
import _ from "lodash"
import { Button, Dialog, DialogBody, DialogFooter } from "@blueprintjs/core"
import { api } from "@/api"
import AdminTicketQueue from "./AdminTicketQueue"   // adjust path if needed

const ADMIN_ROLE = 4   // must match UserRolesEnum.ADMIN in the backend

/**
 * @description Topbar button for admins that opens the support ticket queue in a dialog.
 * Always shown for admins so tickets can be replied to or resolved at any time.
 * Highlighted (warning) when tickets are awaiting a reply (new, or the user answered last).
 * @param {Object} props
 * @param {Number} props.userRole - The role of the current user.
 * @returns {JSX.Element|null}
 */
export function PendingTicketsButton({ userRole, userTag }) {
    const isAdmin = _.isNumber(userRole) && userRole >= ADMIN_ROLE
    const [isOpen, setIsOpen] = useState(false)
    const { data: tickets, isLoading } = api.tickets.useGetTicketQueue(
        {}, { enabled: isAdmin, staleTime: 60000, refetchInterval: 60000, retry: false }
    )

    const pendingCount = _.isArray(tickets)
        ? tickets.filter((t) => t.awaiting_reply && t.status !== "Resolved").length
        : 0
    const openCount = _.isArray(tickets)
        ? tickets.filter((t) => t.status !== "Resolved").length
        : 0

    if (!isAdmin || isLoading) return null

    return <>
        <div className="flex flex-column justify-center margin--little">
            <Button
                minimal={true}
                small={true}
                intent={pendingCount > 0 ? "warning" : "none"}
                icon="help"
                text={pendingCount > 0
                    ? `Support tickets (${pendingCount} new)`
                    : `Support tickets (${openCount} open)`}
                onClick={() => setIsOpen(true)} />
        </div>
        <Dialog
            isOpen={isOpen}
            title="Support tickets"
            onClose={() => setIsOpen(false)}
            style={{ width: "80vw", height: "80vh" }}>
            <DialogBody style={{ height: "100%", minHeight: 0 }}>
                <AdminTicketQueue userTag={userTag} />
            </DialogBody>
            <DialogFooter actions={<Button text="Close" onClick={() => setIsOpen(false)} />} />
        </Dialog>
    </>
}