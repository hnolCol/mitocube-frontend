import { Button } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import _ from "lodash";
import { api } from "@/api";
import { AddConsortiumDialog } from "./AddConsortium";
import { ConsortiumContainer } from "./ConsortiumContainer";
import { EditConsortiumGroupsDialog } from "./EditConsortiumGroups";
import { EditConsortiumUsersDialog } from "./EditConsortiumUsers";
import { ConsortiumMembershipRequestsDialog } from "./ConsortiumMembershipRequests";
import { ConsortiumSubmissionsDialog } from "./Submissions";
import { OptionButton } from "../../core/base/buttons/OptionButton";
import { useSearchParamState } from "../../../hooks/useSearchParamState";

const LIMIT_OPTIONS = [20, 50, 100, 200]

const CURATOR_ROLE = 3

/**
 * @description Displays the consortiums and allows to modify them. Admins and curators can
 * create consortiums and edit their research groups, group curators and heads (PIs) can only
 * edit the members of their own research groups within the consortiums of their groups.
 * @param {Object} props
 * @param {Number} props.userRole Role of the current user
 * @returns {JSX.Element} The admin consortium view.
 */
export function AdminConsortium({ userRole = 0 }) {
    const isCurator = userRole >= CURATOR_ROLE
    const [refetchTrigger, setRefetchTrigger] = useState(undefined)
    const [isAddDialogOpen, setIsOpen] = useState(false)
    const [editGroupsDialog, setEditGroupsDialog] = useState({ isOpen: false, tag: undefined, title: undefined })
    const [editUsersDialog, setEditUsersDialog] = useState({ isOpen: false, tag: undefined, title: undefined })
    const [submissionsDialog, setSubmissionsDialog] = useState({ isOpen: false, tag: undefined, title: undefined })
    const [isMembershipRequestsDialogOpen, setIsMembershipRequestsDialogOpen] = useState(false)

    const handleAddDialogClose = () => {
        setIsOpen(false)
        setRefetchTrigger(Math.random())
    }

    return <div>
        <AddConsortiumDialog
            isOpen={isAddDialogOpen}
            onClose={handleAddDialogClose} />
        <EditConsortiumGroupsDialog
            isOpen={editGroupsDialog.isOpen}
            tag={editGroupsDialog.tag}
            title={editGroupsDialog.title}
            onClose={() => setEditGroupsDialog({ isOpen: false, tag: undefined, title: undefined })} />
        <EditConsortiumUsersDialog
            isOpen={editUsersDialog.isOpen}
            tag={editUsersDialog.tag}
            title={editUsersDialog.title}
            userRole={userRole}
            onClose={() => setEditUsersDialog({ isOpen: false, tag: undefined, title: undefined })} />
        <ConsortiumSubmissionsDialog
            isOpen={submissionsDialog.isOpen}
            tag={submissionsDialog.tag}
            title={submissionsDialog.title}
            onClose={() => setSubmissionsDialog({ isOpen: false, tag: undefined, title: undefined })} />
        <ConsortiumMembershipRequestsDialog
            isOpen={isMembershipRequestsDialogOpen}
            onClose={() => setIsMembershipRequestsDialogOpen(false)} />

        <h2>Consortiums</h2>

        {isCurator ?
            <Button
                minimal={true}
                onClick={() => setIsOpen(prevValue => !prevValue)}
                icon={"plus"} /> : null}

        {isCurator ?
            <Button
                minimal={true}
                icon={"swap"}
                text="Membership requests"
                onClick={() => setIsMembershipRequestsDialogOpen(true)} /> : null}

        <ConsortiumView
            refetchTrigger={refetchTrigger}
            isCurator={isCurator}
            setEditGroupsDialog={setEditGroupsDialog}
            setEditUsersDialog={setEditUsersDialog}
            setSubmissionsDialog={setSubmissionsDialog} />
    </div>
}

/**
 * @description Lists the consortiums with search and limit options.
 * @param {Object} props
 * @param {Number} props.refetchTrigger Triggers a refetch of the consortium list
 * @param {Boolean} props.isCurator Whether the current user is at least a curator (role 3),
 * only those can create consortiums and edit their research groups
 * @param {Function} props.setEditGroupsDialog Setter for the edit groups dialog state
 * @param {Function} props.setEditUsersDialog Setter for the edit members dialog state
 * @param {Function} props.setSubmissionsDialog Setter for the submissions dialog state
 * @returns {JSX.Element} The consortium list view.
 */
export function ConsortiumView({ refetchTrigger, isCurator, setEditGroupsDialog, setEditUsersDialog, setSubmissionsDialog }) {
    const { searchString, setSearchString, debounced, limit, setLimit } = useSearchParamState({ limitOptions: LIMIT_OPTIONS })

    const { data: all_consortium_tags, refetch: refetchAll } = api.consortiums.useGetConsortiums(
        { limit, search_string: debounced || undefined },
        { enabled: isCurator, staleTime: 0 }
    )
    const { data: my_consortium_tags, refetch: refetchMine } = api.consortiums.useGetUserConsortiums(
        { limit: undefined },
        { enabled: !isCurator, staleTime: 0 }
    )

    const consortium_tags = isCurator ? all_consortium_tags : my_consortium_tags
    const refetch = isCurator ? refetchAll : refetchMine

    useEffect(() => {
        if (refetchTrigger !== undefined) {
            refetch()
        }
    }, [refetchTrigger])

    return (
        <div className="flex flex-column margin--medium padding--medium" style={{ gap: "0.4rem", overflowY: "scroll" }}>
            {isCurator ?
                <input
                    className="search-input"
                    placeholder="Search consortiums..."
                    value={searchString}
                    onChange={(e) => setSearchString(e.target.value)}
                /> : null}

            {isCurator ?
                <div className="flex" style={{ marginBottom: "0.75rem", flexShrink: 0 }}>
                    {LIMIT_OPTIONS.map(option => (
                        <OptionButton key={option} onClick={() => setLimit(option)} isSelected={option === limit}>
                            {option}
                        </OptionButton>
                    ))}
                </div> : null}

            <ConsortiumContainer
                tags={consortium_tags}
                canEditGroups={isCurator}
                setEditGroupsDialog={setEditGroupsDialog}
                setEditUsersDialog={setEditUsersDialog}
                setSubmissionsDialog={setSubmissionsDialog}
            />
        </div>
    )
}