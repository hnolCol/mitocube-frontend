import { Button, Dialog, DialogBody, DialogFooter } from "@blueprintjs/core";
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
import { useGetSubmissionMetatext, usePatchSubmission, usePatchSubmissionMetatext, usePostSubmissionOwner } from "../../../../hooks/queries/submission.hooks";
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
export function EditMetatextDialog({
    submission,
    setMetatextDialog,
    isOpen = true,
}) {
    
    const [metatext, setMetaText] = useState({})
    const submissionValid = _.isObject(submission) && !_.isEmpty(submission)
    
    useEffect(() => {
        if (submissionValid) {
            setMetaText(submission.metatext)
        }
    }, [submissionValid])
    
  


    // const { isLoading: getPrevOwnerIsLoading, isFetching: getPrevOwnerIsFetching, isError : getPrevOwnerIsError, error : getPrevOwnerError } = useGetPublicUserByLabel(
    //     { label: submission.user_label },
    //     { enabled: _.isObject(submission) && _.has(submission, "user_label"), onSuccess : (prevOwner) => setSelectedOwner(prevOwner) }
    // )

    const { mutate, isLoading, isSuccess, reset } = usePatchSubmissionMetatext()

    /**
     * 
     * @param {String} tag - The metatext tag
     * @param {String} value - The value that is typed in by the user. 
     */
    const handleMetatextChange = (tag,value) => {
        setMetaText(prevValues => {return {...prevValues,[tag] : value}})
    }

    const handleSubmit = () => {     
        mutate({label : submission.label, metatext})
    }

    const onClose = () => {
        //resetDialog()
        reset()
        setMetatextDialog(prevValues => {
            return {
                ...prevValues,
                isOpen: false,
            }
        })
    }
   
    return <Dialog isOpen={isOpen} title="Edit metatext" style={{ width: "min(70vw, 900px)", height : "min(80vh,900px)" }} onClose={onClose} canEscapeKeyClose={true} canOutsideClickClose={true}>
        <DialogBody>
        <div className="flex flex-column padding--medium">
                <h3>Edit the metatext of : {submission.title} ({submission.label})</h3>

                {submissionValid ? <MetaText metatextValues={metatext} allowTextForState={submission.state} allowTextBelowState={true} onMetaTextChange={handleMetatextChange} /> : null}
        </div>
        </DialogBody>
        <DialogFooter actions={[<div className="flex">
            <Button text="Submit" loading={isLoading} disabled={isSuccess} onClick={handleSubmit} />
            <Button text={isSuccess?"Done":"Cancel"} intent={isSuccess?"primary":"danger"} onClick={onClose} /></div>]} />
</Dialog>
}