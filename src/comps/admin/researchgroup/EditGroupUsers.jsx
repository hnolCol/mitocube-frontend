import { Dialog, DialogBody } from "@blueprintjs/core";
import _ from "lodash"
import { EditableUserList } from "../../core/base/user/EditUserList";
import { api } from "@/api"; 


export function EditResearchGroupUsersDialog({ isOpen, tag, onClose, title }) {
    
    const { data: user_tags, isLoading: userIsLoading, isSuccess: userIsSuccess, refetch } = api.researchgroups.useGetResearchGroupUsers({ tag }, { enabled: _.isString(tag) && isOpen })
    const { mutate: postUser, isLoading: postUserIsLoading } = api.researchgroups.usePostResearchGroupUsers()
    const { mutate: deleteUser, isLoading: deleteUserIsLoading } = api.researchgroups.useDeleteResearchGroupUsers()

    const addUser = (user_tag) => {
        postUser({tag, user_tags : [user_tag]}, {onSuccess : () =>  refetch()})
    }

    const removeUser = (user_tag) => {
        deleteUser({tag, user_tags : [user_tag]}, {onSuccess : () =>  refetch()})
    }


    return <Dialog isOpen={isOpen} canEscapeKeyClose title={title} onClose={onClose}>
        
        <DialogBody>
            {_.isArray(user_tags) ? <EditableUserList selected_user_tags={user_tags} title={""} onSelect={addUser} onRemove={removeUser} isLoading={postUserIsLoading || deleteUserIsLoading} /> : null }
        </DialogBody>
    </Dialog>
}