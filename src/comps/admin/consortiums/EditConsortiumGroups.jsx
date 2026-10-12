import { Dialog, DialogBody } from "@blueprintjs/core";
import _ from "lodash";
import { api } from "@/api";

/**
 * @description Selectable research group using the 'isSelected' state (managed from outside).
 * @param {Object} props
 * @param {String} props.tag Research group tag
 * @param {Boolean} props.isSelected
 * @param {Function} props.onSelect
 * @param {Function} props.onRemove
 * @param {Boolean} props.isLoading
 * @returns {JSX.Element} The selectable research group item.
 */
function SelectableResearchGroup({ tag, isSelected, onSelect, onRemove, isLoading }) {
    const { data: research_group, isSuccess } = api.researchgroups.useGetResearchGroupByTag({ tag }, { enabled: _.isString(tag) })
    return <div className="padding--little div--round" style={{ backgroundColor: "#fefefe" }}>
        {isSuccess && _.isObject(research_group) ?
            <div className="flex padding--little center-items" style={{ justifyContent: "space-between" }}>
                <div className="flex flex-column">
                    <div>{research_group.text} ({research_group.abbreviation})</div>
                    <div className="font-size--smallest">{research_group.institute}</div>
                </div>
                <div style={{ float: "right" }}>
                    {isSelected ?
                        <button className="dialog-button" disabled={isLoading} onClick={() => onRemove(tag)}>Remove</button> :
                        <button className="dialog-button" disabled={isLoading} onClick={() => onSelect(tag)}>Add</button>}
                </div>
            </div> : null}
    </div>
}

/**
 * @description Dialog to edit the research groups of a consortium. The users of a consortium are
 * the members of its research groups. Users can be added by adding their research group.
 * @param {Object} props
 * @param {Boolean} props.isOpen
 * @param {String} props.tag Consortium tag
 * @param {String} props.title
 * @param {Function} props.onClose
 * @returns {JSX.Element} The edit consortium groups dialog.
 */
export function EditConsortiumGroupsDialog({ isOpen, tag, title, onClose }) {
    const { data: group_tags, isLoading: groupsIsLoading, refetch } = api.consortiums.useGetConsortiumGroups({ tag }, { enabled: _.isString(tag) && isOpen })
    const { data: user_tags } = api.consortiums.useGetConsortiumUsers({ tag }, { enabled: _.isString(tag) && isOpen })
    const { mutate: postGroups, isPending: postIsPending } = api.consortiums.usePostConsortiumGroups()
    const { mutate: deleteGroups, isPending: deleteIsPending } = api.consortiums.useDeleteConsortiumGroups()
    const { data: all_group_tags, isSuccess: isSearchSuccess } = api.researchgroups.useGetResearchGroupsByQuery({ limit: 100 }, { enabled: isOpen })

    const isPending = postIsPending || deleteIsPending

    const addGroup = (group_tag) => {
        postGroups({ tag, group_tags: [group_tag] }, { onSuccess: () => refetch() })
    }

    const removeGroup = (group_tag) => {
        deleteGroups({ tag, group_tags: [group_tag] }, { onSuccess: () => refetch() })
    }

    return <Dialog isOpen={isOpen} canEscapeKeyClose title={title} onClose={onClose}>
        <DialogBody>
            {_.isString(tag) && _.isArray(user_tags) ?
                <div className="font-size--small margin-bottom--little">
                    Users in consortium (via its research groups) : <strong>{user_tags.length}</strong>
                </div> : null}
            <h4>Research groups of the consortium</h4>
            <div className="flex flex-column container--scroll-y-hide-x padding--medium" style={{ height: "35vh", gap: "0.5rem" }}>
                {groupsIsLoading ? "Loading research groups..." :
                    _.isArray(group_tags) && group_tags.length > 0 ?
                        group_tags.map(group_tag => <SelectableResearchGroup
                            key={group_tag}
                            tag={group_tag}
                            isSelected={true}
                            onRemove={removeGroup}
                            isLoading={isPending} />) :
                        <span>No research groups yet.</span>}
            </div>
            <h4>Add research group</h4>
            <div className="flex flex-column container--scroll-y-hide-x padding--medium" style={{ height: "35vh", gap: "0.5rem" }}>
                {isSearchSuccess && _.isArray(all_group_tags) ?
                    _.difference(all_group_tags, group_tags).map(group_tag => <SelectableResearchGroup
                        key={group_tag}
                        tag={group_tag}
                        isSelected={false}
                        onSelect={addGroup}
                        isLoading={isPending} />) : null}
            </div>
        </DialogBody>
    </Dialog>
}
