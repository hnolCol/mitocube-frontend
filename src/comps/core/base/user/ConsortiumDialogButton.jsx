import { useState } from "react"
import _ from "lodash"
import { Button, Dialog, DialogBody, DialogFooter, Tabs, Tab } from "@blueprintjs/core"
import { api } from "@/api"
import { ConsortiumText } from "@/comps/submission/view/ConsortiumText"
import { ConsortiumTermsWarning } from "@/comps/core/base/user/ConsortiumTermsButton"
import { ConsortiumShareDecisionsContent } from "@/comps/core/base/user/ConsortiumShareDecisionsButton"
import { ConsortiumMembershipRequestsContent } from "@/comps/core/base/user/ConsortiumMembershipRequestsButton"
import { ConsortiumPermissionsFlow } from "./ConsortiumPermissionFlow"

/**
 * @description The single consortium button in the topbar that pools the consortium
 * membership and share features into one tabbed dialog: the members tab shows the
 * pending membership requests (to accept or deny for group curators and heads/PIs,
 * including requests filed by standard users) and the members of the users research
 * groups to add or remove directly; the shares tab shows the pending share requests
 * (final approval by the head (PI) of the owners research group) and the approved
 * shares per consortium; the permissions tab explains the flow of the permissions.
 * Renders nothing if the user is not a member of any consortium.
 * @param {Object} props
 * @param {String} props.userTag Tag of the current user
 * @param {Number} props.userRole Role of the current user
 * @returns {JSX.Element|null} The pooled consortium button with dialog.
 */
export function ConsortiumDialogButton({ userTag, userRole = 0 }) {
    const [isOpen, setIsOpen] = useState(false)
    const [activeTab, setActiveTab] = useState("members")
    const { data: userConsortiums, isLoading } = api.consortiums.useGetUserConsortiums(
        {}, { staleTime: 300000, retry: false }
    )
    if (isLoading) return null
    if (!_.isArray(userConsortiums) || userConsortiums.length === 0) return null

    return <>
        <div className="flex flex-column justify-center margin--little">
            <Button
                minimal={true}
                small={true}
                icon="diagram-tree"
                text="Consortium"
                onClick={() => setIsOpen(true)} />
        </div>
        <Dialog
            isOpen={isOpen}
            title="Consortium"
            onClose={() => setIsOpen(false)}
            style={{ width: "50vw", height: "70vh" }}>
            <DialogBody className="div--expand">
                <div style={{ overflowY: "auto", height: "100%", paddingRight: "0.5rem" }}>
                    <ConsortiumTermsWarning />
                    {userConsortiums.length === 1 ? <div className="font-size--small">
                        You are a member of: <ConsortiumText tag={userConsortiums[0]} />
                    </div> :
                        userConsortiums.length > 1 ? <div className="font-size--small">
                            You are a member of {userConsortiums.length} consortiums.
                        </div> : null}
                    <Tabs
                        renderActiveTabPanelOnly={true}
                        selectedTabId={activeTab}
                        onChange={(tab_id) => setActiveTab(tab_id)}>
                        <Tab id="members" title="Members" panel={<ConsortiumMembershipRequestsContent userTag={userTag} userRole={userRole} />} />
                        <Tab id="shares" title="Shares" panel={<ConsortiumShareDecisionsContent />} />
                        <Tab id="permissions" title="Permissions" panel={<ConsortiumPermissionsFlow />} />
                    </Tabs>
                </div>
            </DialogBody>
            <DialogFooter actions={<Button text="Close" onClick={() => setIsOpen(false)} />} />
        </Dialog>
    </>
}