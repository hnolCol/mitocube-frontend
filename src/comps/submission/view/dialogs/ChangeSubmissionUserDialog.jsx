import { Button, Dialog, DialogBody, DialogFooter } from "@blueprintjs/core";
import APIError from "../../../core/error/APIerror";
import { UserInput } from "../../../core/input/api/UserInput";
import { useGetPublicUserByTag } from "../../../../hooks/queries/user.hooks";
import _ from "lodash"
import Loading from "../../../core/base/loading";
import { usePostSubmissionOwner } from "../../../../hooks/queries/submission.hooks";
import { useState } from "react";


/**
 * @description A controlled attribute selection dialog (@blueprintjs) that is used to enter dataset attributes upon a state change.
 * @param {Object} props 
 * @param {import("../../../../types/submissions").Submission} props.submission - The submission for which the attribute selection dialog is created and which likely changes.
 * @param {Boolean} props.isOpen If the Dialog window is open.
* @returns {React.ReactElement} 
 */
export function ChangeSubmissionUserDialog({
    submission,
    setChangeOwnerDialog,
    isOpen = true,
}) {
    
    const [selectedOwner, setSelectedOwner] = useState({})
    const { isLoading: getPrevOwnerIsLoading, isFetching: getPrevOwnerIsFetching, isError : getPrevOwnerIsError, error : getPrevOwnerError } = useGetPublicUserByTag(
        { tag: submission.user_tag },
        { enabled: _.isObject(submission) && _.has(submission, "user_tag"), onSuccess : (prevOwner) => setSelectedOwner(prevOwner) }
    )
    const {mutate, isLoading, reset, isSuccess, isError, error } = usePostSubmissionOwner()
 
    const handleSubmit = () => {

        mutate({submission_tag : submission.tag, user_tag : selectedOwner.tag})
    }
    
    /**
     * @description Handle the user selection (e.g. callback when a user is selected.)
     * @param {String} callbackKey 
     * @param {import("../../../../types/users").PublicUser} user 
     */
    const handleUserSelection = (callbackKey, user) => {
        setSelectedOwner(user)
    }

    const onClose = () => {
        //resetDialog()
        reset()
        setChangeOwnerDialog(prevValues => {
            return {
                ...prevValues,
                isOpen: false,
            }
        })
    }
    const sameOwnerSelected = !_.isEmpty(selectedOwner) && selectedOwner.label === submission.user_label
   
    return <Dialog isOpen={isOpen} title="Change project owner" style={{ width: "min(70vw, 900px)", height : "min(50vh,400px)" }} onClose={onClose}>
        <DialogBody>
        <div className="flex flex-column padding--medium">
                <h3>Change the owner of the project : {submission.title} ({submission.label})</h3>
                {getPrevOwnerIsFetching || getPrevOwnerIsLoading ? <Loading /> : getPrevOwnerIsError ? <APIError error={getPrevOwnerError}/> :  isError ? <APIError error={error} /> : 
                    <UserInput showIsRequired={false} showLabel={false} onUserSelect={handleUserSelection} selectedUsers={[selectedOwner]} disabled={isLoading || isSuccess} />}
            </div>
            {sameOwnerSelected ? <p><strong>Selected user equals previous owner.</strong></p> : null}
        </DialogBody>
        <DialogFooter actions={[<div className="flex">
            <Button text="Submit" disabled={isSuccess || isLoading } onClick={handleSubmit} />
            <Button text={isSuccess?"Done":"Cancel"} intent={isSuccess?"primary":"danger"} onClick={onClose} /></div>]} />
</Dialog>
}