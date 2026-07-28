import { getUserFullName } from "../../../services/format/user"
import _ from "lodash"
import { useState } from "react"
import { Popover, Button, InputGroup, Menu, MenuItem, Spinner } from "@blueprintjs/core"
import { useQueryClient } from "@tanstack/react-query"

import { api } from "@/api"; 


export function Author({ user_tag }) { 

    const { data: user } = api.users.core.useGetPublicUserByTag({ tag: user_tag }, { enabled: !!user_tag, staleTime: 1000 * 60 * 5 }) //5 minutes
    return (<div>
        {user ? getUserFullName(user) : "Loading..."}
    </div>)
}


/**
 * @description Searchable author picker. Calls onUserSelected(user_tag) when a result is clicked.
 *
 */
function AuthorChange({ onUserSelected, excludedUserTags = [] }) {
    const [searchText, setSearchText] = useState("")

    const { data: results, isFetching } = api.users.queryByQuery.useGetUserByQuery(
        { search_string: searchText, limit: 15 },
        { enabled: searchText.length > 0 }
    )

    const resultTags = _.isArray(results)
        ? results.filter(tag => !excludedUserTags.includes(tag))
        : []

    return (
        <div style={{ minWidth: "260px" }}>
            <InputGroup
                placeholder="Search users by name or email..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                leftIcon="search"
                autoFocus
            />
            <div style={{ maxHeight: "200px", overflowY: "auto", marginTop: "0.25rem" }}>
                {isFetching ? <Spinner size={20} /> : (
                    <Menu>
                        {resultTags.length > 0 ? resultTags.map(user_tag => (
                            <MenuItem
                                key={user_tag}
                                text={<Author user_tag={user_tag} />}
                                onClick={() => onUserSelected(user_tag)}
                            />
                        )) : searchText.length > 0 ? <div className="padding--little font-size--smallest">No users found.</div> : null}
                    </Menu>
                )}
            </div>
        </div>
    )
}


/**
 * @description Popover content for editing the creator and collaborators of a submission.
 */
function AuthorsEditor({ submission_tag, users, onClose }) {
    const queryClient = useQueryClient()
    const [editTarget, setEditTarget] = useState(null) // null | "owner" | "collaborator"

    const { data: owner_tag, isLoading: isLoadingOwner, isError: isOwnerError, error: ownerError } = api.submissions.users.useGetSubmissionOwner(
        { tag: submission_tag },
        { enabled: _.isString(submission_tag), retry: false }
    )

    const { mutate: changeOwner, isLoading: isChangingOwner } = api.submissions.users.useChangeSubmissionOwner({
        onSuccess: () => {
            queryClient.invalidateQueries(["getSubmissionOwner", submission_tag])
            queryClient.invalidateQueries(["getSubmissionUsers", submission_tag])
            setEditTarget(null)
        }
    })

    const { mutate: setCollaborators, isLoading: isSettingCollaborators } = api.submissions.users.useSetSubmissionCollaborators({
        onSuccess: () => {
            queryClient.invalidateQueries(["getSubmissionUsers", submission_tag])
            setEditTarget(null)
        }
    })

    const collaborator_tags = _.isArray(users) ? users.filter(tag => tag !== owner_tag) : []

    const handleOwnerSelected = (user_tag) => {
        changeOwner({ tag: submission_tag, user_tag, add_prev_user_to_collaborators: true })
    }

    const handleCollaboratorAdd = (user_tag) => {
        const next_tags = _.uniq([...collaborator_tags, user_tag])
        setCollaborators({ tag: submission_tag, collaborators: next_tags.join(";"), replace: true })
    }

    const handleCollaboratorRemove = (user_tag) => {
        const next_tags = collaborator_tags.filter(t => t !== user_tag)
        setCollaborators({ tag: submission_tag, collaborators: next_tags.join(";"), replace: true })
    }

    return (
        <div className="padding--medium" style={{ minWidth: "300px" }}>

            <div className="margin-bottom--medium">
                <strong>Creator</strong>
                {editTarget === "owner" ? (
                    <AuthorChange excludedUserTags={owner_tag ? [owner_tag] : []} onUserSelected={handleOwnerSelected} />
                ) : (
                    <div className="flex center-items" style={{ gap: "0.5rem" }}>
                        {isLoadingOwner ? (
                            <Spinner size={16} />
                        ) : isOwnerError ? (
                            <span className="font-size--smallest intent-text--error">
                                Error: {ownerError?.response?.data?.detail || ownerError?.message || "unknown error"}
                            </span>
                        ) : owner_tag ? (
                            <Author user_tag={owner_tag} />
                        ) : (
                            <span className="font-size--smallest">No creator found.</span>
                        )}
                        <Button
                            minimal
                            small
                            icon="edit"
                            loading={isChangingOwner}
                            onClick={() => setEditTarget("owner")}
                        />
                    </div>
                )}
            </div>

            <div>
                <strong>Collaborators</strong>
                <div className="flex flex-column" style={{ gap: "0.25rem", marginTop: "0.25rem" }}>
                    {collaborator_tags.length > 0 ? collaborator_tags.map(user_tag => (
                        <div key={user_tag} className="flex center-items justify-space-between">
                            <Author user_tag={user_tag} />
                            <Button
                                minimal
                                small
                                icon="cross"
                                loading={isSettingCollaborators}
                                onClick={() => handleCollaboratorRemove(user_tag)}
                            />
                        </div>
                    )) : <div className="font-size--smallest">No collaborators yet.</div>}
                </div>

                {editTarget === "collaborator" ? (
                    <AuthorChange
                        excludedUserTags={owner_tag ? [owner_tag, ...collaborator_tags] : collaborator_tags}
                        onUserSelected={handleCollaboratorAdd}
                    />
                ) : (
                    <Button
                        minimal
                        small
                        icon="add"
                        text="Add collaborator"
                        onClick={() => setEditTarget("collaborator")}
                    />
                )}
            </div>

            <div className="flex justify-end margin-top--medium">
                <Button minimal small text="Close" onClick={onClose} />
            </div>
        </div>
    )
}


/**
 * @description Displays the authors of a submission 
 * @param {Object} props 
 * @param {String} props.submission_tag The submission tag. 
 * @param {String} props.emailSubject - An email can be sent to the authors, this string will be the subject of the 
 * email. 
 *  * @returns 
 */
export function AuthorList({ submission_tag, emailSubject = "" }) {
    

    const { data: users, isLoading, isFetching } = api.submissions.users.useGetSubmissionUsers({ tag: submission_tag })
    const [isEditOpen, setIsEditOpen] = useState(false)
    const n_users = _.isArray(users) ? users.length : 0
    return (
        <div className="flex flex-column center-items">
            <div className="flex center-items">

            {_.isArray(users) ? users
                .map((user_tag, idx) => {
                return (
                    <div className="flex margin-right--little div--round" key={`${user_tag}-${idx}`}>
                            <div className="flex" style={{color : "black"}}>
                                <strong>{<Author user_tag={user_tag} />}</strong>
                            </div>
            
                        
                        {n_users > 1?
                            idx === n_users - 2 ? <div>, and</div> : idx !== n_users - 1?<div>,</div> : null : null}
                        </div>
                )
                }) : null}

                <Popover
                    isOpen={isEditOpen}
                    onInteraction={setIsEditOpen}
                    placement="bottom"
                    content={
                        <AuthorsEditor
                            submission_tag={submission_tag}
                            users={users}
                            onClose={() => setIsEditOpen(false)}
                        />
                    }
                >
                    <Button minimal small icon="edit" onClick={() => setIsEditOpen(true)} />
                </Popover>
            </div>
        </div>
    )
}