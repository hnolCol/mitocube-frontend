import { Button, Dialog, DialogBody, DialogFooter, Spinner, TextArea } from "@blueprintjs/core";
import { LiteralAttributeSelection } from "../../new/attribute/select/LiteralAttributeSelection";
import { useEffect, useState } from "react";
import PropTypes from "prop-types"
import APIError from "../../../core/error/APIerror";
import { mapAttributeTagsToAttributes } from "../../../../services/attributes";
import MetaText from "../../new/MetaText";
import { AxiosError } from "axios";
import { UserInput } from "../../../core/input/api/UserInput";
import { useGetPublicUserByLabel } from "../../../../hooks/queries/user.hooks";
import _ from "lodash"
import { usePostSubmissionOwner } from "../../../../hooks/queries/submission.hooks";
import Loading from "../../../core/base/loading";
// AttributeSelectionDialog.propTypes = {
//     authenticationStatus: PropTypes.object.isRequired,
//     attributesByTag: PropTypes.object.isRequired,
//     attributeFilter: PropTypes.object.isRequired,
//     prevSelectedAttributes: PropTypes.object,
//     isOpen: PropTypes.bool.isRequired,
//     onSubmit: PropTypes.func.isRequired,
//     isLoading: PropTypes.bool,
//     success : PropTypes.bool
// }

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
    const { isLoading: getPrevOwnerIsLoading, isFetching: getPrevOwnerIsFetching, isError : getPrevOwnerIsError, error : getPrevOwnerError } = useGetPublicUserByLabel(
        { label: submission.user_label },
        { enabled: _.isObject(submission) && _.has(submission, "user_label"), onSuccess : (prevOwner) => setSelectedOwner(prevOwner) }
    )
    const {mutate, isLoading, reset, isSuccess, isError, error } = usePostSubmissionOwner()
 
    const handleSubmit = () => {

        mutate({submission_label : submission.label, user_label : selectedOwner.label})
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