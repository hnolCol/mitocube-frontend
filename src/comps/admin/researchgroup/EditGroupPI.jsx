import { Dialog, DialogBody } from "@blueprintjs/core";
import { useEffect } from "react";
import _ from "lodash";
import { api } from "@/api";
import { UserInput } from "@/comps/core/input/api/UserInput";
import { Loading } from "../../core/base/states/Loading";

/**
 * @description Dialog to edit the PI (head) of a research group. Changes are applied
 * immediately; no save is required.
 * @param {Object} props
 * @param {String} props.tag Research group tag
 * @param {Boolean} props.isOpen
 * @param {Function} props.onClose
 * @returns {JSX.Element} The edit research group PI dialog.
 */
export function EditResearchGroupPIDialog({ tag, isOpen, onClose }) {
    const { data: head_tags, isLoading, isSuccess, refetch } = api.researchgroups.useGetResearchGroupHeads({ tag }, { enabled: _.isString(tag) && isOpen })
    const { mutate: postHead, isPending: postHeadIsPending } = api.researchgroups.usePostResearchGroupHead()
    const { mutate: deleteHead, isPending: deleteHeadIsPending } = api.researchgroups.useDeleteResearchGroupHead()

    useEffect(() => {
        if (isOpen) refetch()
    }, [isOpen])

    const addHead = (user_tag) => {
        postHead({ tag, user_tag }, { onSuccess: () => refetch() })
    }

    const removeHead = (user_tag) => {
        deleteHead({ tag, user_tag }, { onSuccess: () => refetch() })
    }

    return <Dialog isOpen={isOpen} onClose={onClose} canEscapeKeyClose canOutsideClickClose title="Edit PI">
        <DialogBody>
            <h3>Edit the Principal Investigator (PI).</h3>
            <span>Selecting a user makes them a head (PI) of the research group. Removing a tag removes the user as head (PI). Changes are applied immediately.</span>
            {isLoading ? <Loading /> :
                <UserInput
                    label="Principal Investigator (PI)"
                    helperText="The selected user is made a head (PI) of the research group. Removing a tag removes the user as head (PI)."
                    showIsRequired={false}
                    selected_users={_.isArray(head_tags) ? head_tags : []}
                    onUserSelect={(key, user_tag) => {
                        if (_.isArray(head_tags) && head_tags.includes(user_tag)) {
                            removeHead(user_tag)
                        } else {
                            addHead(user_tag)
                        }
                    }} />}
        </DialogBody>
    </Dialog>
}
