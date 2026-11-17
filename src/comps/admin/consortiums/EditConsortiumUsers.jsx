import { Dialog, DialogBody } from "@blueprintjs/core";
import _ from "lodash";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { UserFullName } from "@/comps/core/input/api/UserInput";

/**
 * @description Selectable consortium member using the 'isSelected' state (managed from outside).
 * @param {Object} props
 * @param {String} props.tag User tag
 * @param {Boolean} props.isSelected
 * @param {Function} props.onSelect
 * @param {Function} props.onRemove
 * @param {Boolean} props.isLoading
 * @param {String} props.hint Optional hint text shown next to the user.
 * @returns {JSX.Element} The selectable consortium member item.
 */
function SelectableMember({ tag, isSelected, onSelect, onRemove, isLoading, hint }) {
    return <div className="padding--little div--round" style={{ backgroundColor: "#fefefe" }}>
        <div className="flex padding--little center-items justify-space-between">
            <div className="flex flex-column">
                <UserFullName tag={tag} />
                {_.isString(hint) ? <div className="font-size--smallest">{hint}</div> : null}
            </div>
            <div style={{ float: "right" }}>
                {isSelected ?
                    <button className="dialog-button" disabled={isLoading} onClick={() => onRemove(tag)}>Remove</button> :
                    <button className="dialog-button" disabled={isLoading} onClick={() => onSelect(tag)}>Add</button>}
            </div>
        </div>
    </div>
}

/**
 * @description Dialog to edit the direct members of a consortium. Research groups of the
 * consortium are eligibility anchors: their heads (PIs) are members automatically, other
 * users of the groups can be added here (requires at least curator rights, backend enforced).
 * @param {Object} props
 * @param {Boolean} props.isOpen
 * @param {String} props.tag Consortium tag
 * @param {String} props.title
 * @param {Function} props.onClose
 * @returns {JSX.Element} The edit consortium members dialog.
 */
export function EditConsortiumUsersDialog({ isOpen, tag, title, onClose }) {
    const queryClient = useQueryClient()
    const { data: user_tags, isLoading: usersIsLoading, refetch } = api.consortiums.useGetConsortiumUsers({ tag }, { enabled: _.isString(tag) && isOpen })
    const { data: eligible_user_tags } = api.consortiums.useGetConsortiumEligibleUsers({ tag }, { enabled: _.isString(tag) && isOpen })
    const { mutate: postUsers, isPending: postIsPending } = api.consortiums.usePostConsortiumUsers()
    const { mutate: deleteUsers, isPending: deleteIsPending } = api.consortiums.useDeleteConsortiumUsers()

    const isPending = postIsPending || deleteIsPending

    const invalidate = () => {
        refetch()
        queryClient.invalidateQueries({ queryKey: ["getConsortiumUsers"] })
    }

    const addUser = (user_tag) => {
        postUsers({ tag, user_tags: [user_tag] }, { onSuccess: invalidate })
    }

    const removeUser = (user_tag) => {
        deleteUsers({ tag, user_tags: [user_tag] }, { onSuccess: invalidate })
    }

    const memberTags = _.isArray(user_tags) ? user_tags : []
    const eligibleTags = _.isArray(eligible_user_tags) ? eligible_user_tags : []
    const addableTags = _.difference(eligibleTags, memberTags)

    return <Dialog isOpen={isOpen} canEscapeKeyClose title={title} onClose={onClose}>
        <DialogBody>
            {_.isString(tag) && _.isArray(user_tags) ?
                <div className="font-size--small margin-bottom--little">
                    Members of the consortium : <strong>{user_tags.length}</strong>
                </div> : null}
            <h4>Members of the consortium</h4>
            <p className="font-size--smallest">
                Adding a research group to the consortium joins its head (PI) automatically.
                Other users of the groups can be added individually here.
            </p>
            <div className="flex flex-column container--scroll-y-hide-x padding--medium" style={{ height: "35vh", gap: "0.5rem" }}>
                {usersIsLoading ? "Loading members..." :
                    memberTags.length > 0 ?
                        memberTags.map(user_tag => <SelectableMember
                            key={user_tag}
                            tag={user_tag}
                            isSelected={true}
                            onRemove={removeUser}
                            isLoading={isPending} />) :
                        <span>No members yet.</span>}
            </div>
            <h4>Add member</h4>
            <div className="flex flex-column container--scroll-y-hide-x padding--medium" style={{ height: "35vh", gap: "0.5rem" }}>
                {addableTags.length > 0 ?
                    addableTags.map(user_tag => <SelectableMember
                        key={user_tag}
                        tag={user_tag}
                        isSelected={false}
                        onSelect={addUser}
                        isLoading={isPending}
                        hint="Member of an eligible research group" />) :
                    <span>No addable users. Add research groups to the consortium first.</span>}
            </div>
        </DialogBody>
    </Dialog>
}
