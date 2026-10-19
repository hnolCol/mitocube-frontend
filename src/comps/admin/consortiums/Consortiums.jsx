import { Button } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import _ from "lodash";
import { api } from "@/api";
import { AddConsortiumDialog } from "./AddConsortium";
import { ConsortiumContainer } from "./ConsortiumContainer";
import { EditConsortiumGroupsDialog } from "./EditConsortiumGroups";
import { ConsortiumSubmissionsDialog } from "./Submissions";
import { OptionButton } from "../../core/base/buttons/OptionButton";
import { useSearchParamState } from "../../../hooks/useSearchParamState";

const LIMIT_OPTIONS = [20, 50, 100, 200]

/**
 * @description Displays the consortiums and allows to modify them.
 * @returns {JSX.Element} The admin consortium view.
 */
export function AdminConsortium({ }) {
    const [refetchTrigger, setRefetchTrigger] = useState(undefined)
    const [isAddDialogOpen, setIsOpen] = useState(false)
    const [editGroupsDialog, setEditGroupsDialog] = useState({ isOpen: false, tag: undefined, title: undefined })
    const [submissionsDialog, setSubmissionsDialog] = useState({ isOpen: false, tag: undefined, title: undefined })

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
        <ConsortiumSubmissionsDialog
            isOpen={submissionsDialog.isOpen}
            tag={submissionsDialog.tag}
            title={submissionsDialog.title}
            onClose={() => setSubmissionsDialog({ isOpen: false, tag: undefined, title: undefined })} />

        <h2>Consortiums</h2>

        <Button
            minimal={true}
            onClick={() => setIsOpen(prevValue => !prevValue)}
            icon={"plus"} />

        <ConsortiumView
            refetchTrigger={refetchTrigger}
            setEditGroupsDialog={setEditGroupsDialog}
            setSubmissionsDialog={setSubmissionsDialog} />
    </div>
}

/**
 * @description Lists the consortiums with search and limit options.
 * @param {Object} props
 * @param {Number} props.refetchTrigger Triggers a refetch of the consortium list
 * @param {Function} props.setEditGroupsDialog Setter for the edit groups dialog state
 * @param {Function} props.setSubmissionsDialog Setter for the submissions dialog state
 * @returns {JSX.Element} The consortium list view.
 */
export function ConsortiumView({ refetchTrigger, setEditGroupsDialog, setSubmissionsDialog }) {
    const { searchString, setSearchString, debounced, limit, setLimit } = useSearchParamState({ limitOptions: LIMIT_OPTIONS })

    const { data: consortium_tags, refetch } = api.consortiums.useGetConsortiums(
        { limit, search_string: debounced || undefined },
        { staleTime: 0 }
    )

    useEffect(() => {
        if (refetchTrigger !== undefined) {
            refetch()
        }
    }, [refetchTrigger])

    return (
        <div className="flex flex-column margin--medium padding--medium" style={{ gap: "0.4rem", overflowY: "scroll" }}>
            <input
                className="search-input"
                placeholder="Search consortiums..."
                value={searchString}
                onChange={(e) => setSearchString(e.target.value)}
            />

            <div className="flex" style={{ marginBottom: "0.75rem", flexShrink: 0 }}>
                {LIMIT_OPTIONS.map(option => (
                    <OptionButton key={option} onClick={() => setLimit(option)} isSelected={option === limit}>
                        {option}
                    </OptionButton>
                ))}
            </div>

            <ConsortiumContainer
                tags={consortium_tags}
                setEditGroupsDialog={setEditGroupsDialog}
                setSubmissionsDialog={setSubmissionsDialog}
            />
        </div>
    )
}
