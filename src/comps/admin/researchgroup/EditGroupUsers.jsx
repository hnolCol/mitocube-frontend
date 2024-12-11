import { Dialog, DialogBody } from "@blueprintjs/core";
import { useDeleteResearchGroupUsers, useGetResearchGroupUsers, usePostResearchGroupUsers } from "../../../hooks/queries/researchgroup.hooks";
import _ from "lodash"
import { EditableUserList } from "../../core/base/user/EditUserList";
export function EditResearchGroupUsersDialog({ isOpen, tag, onClose, title }) {
    
    const { data: users, isLoading: userIsLoading, isSuccess: userIsSuccess, refetch } = useGetResearchGroupUsers({ tag }, { enabled: _.isString(tag) && isOpen })
    const { mutate: postUser, isLoading: postUserIsLoading } = usePostResearchGroupUsers()
    const { mutate: deleteUser, isLoading: deleteUserIsLoading } = useDeleteResearchGroupUsers()

    const addUser = (user_tag) => {
        postUser({tag, user_tags : [user_tag]}, {onSuccess : () =>  refetch()})
    }

    const removeUser = (user_tag) => {
        deleteUser({tag, user_tags : [user_tag]}, {onSuccess : () =>  refetch()})
    }


    return <Dialog isOpen={isOpen} canEscapeKeyClose title={title} onClose={onClose}>
        <div>Changes are automatically saved.</div>
        <DialogBody>
            {_.isArray(users) ? <EditableUserList selected_user_tags={users} title={""} onSelect={addUser} onRemove={removeUser} isLoading={postUserIsLoading || deleteUserIsLoading} /> : null }
        </DialogBody>
    </Dialog>
}