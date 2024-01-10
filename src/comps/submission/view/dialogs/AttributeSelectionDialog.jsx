import { Button, Dialog, DialogBody, DialogFooter, Spinner, TextArea } from "@blueprintjs/core";
import { LiteralAttributeSelection } from "../../new/attribute/select/LiteralAttributeSelection";
import { useEffect, useState } from "react";
import PropTypes from "prop-types"
import APIError from "../../../core/error/APIerror";
import { mapAttributeTagsToAttributes } from "../../../../services/attributes";
import MetaText from "../../new/MetaText";
import { AxiosError } from "axios";

AttributeSelectionDialog.propTypes = {
    authenticationStatus: PropTypes.object.isRequired,
    attributesByTag: PropTypes.object.isRequired,
    attributeFilter: PropTypes.object.isRequired,
    prevSelectedAttributes: PropTypes.object,
    isOpen: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    success : PropTypes.bool
}

/**
 * @description A controlled attribute selection dialog (@blueprintjs) that is used to enter dataset attributes upon a state change.
 * @param {Object} props 
 * @param {Object<String, Set<string>>} props.attributeFilter - AttributeFilter keys as tags and values are sets of attribute values.
 * @param {import("../../../../types/submissions").Submission} props.submission - The submission for which the attribute selection dialog is created and which likely changes.
 * @param {Function} props.onSubmit - Handles the submission (change of the dataset attributes) to the API upon a state change.
 * @param {Boolean} props.isLoading - If the dialog should be in a loading state. 
 * @param {Boolean} props.submitted - If the dataset attribute changes were already submitted. 
 * @param {Boolean} props.success - If the the API HTTP axios request has been successful 
 * @param {AxiosError} props.error
 * @returns {React.ReactElement} 
 */
export function AttributeSelectionDialog({
    authenticationStatus,
    attributesByTag,
    attributeFilter,
    submission,
    newSubmissionState = undefined,
    prevSelectedAttributes = {},
    setAttributeSelectionDialog,
    isOpen,
    onSubmit,
    isLoading = false,
    submitted = false,
    success = true,
    error = undefined
}) {
    const [selectedAttributes, setSelectedAttributes] = useState({})
    const [submissionText, setSubmissionText] = useState({comment : "", metatext : {}})
    // const [comment, setComment] = useState("")
    // const [metatext, setMetatext] = useState({})

    useEffect(() => {
        const matchedPrevSelectedAttributes = mapAttributeTagsToAttributes({ tagAttributes: prevSelectedAttributes, attributesByTag })
        setSelectedAttributes(matchedPrevSelectedAttributes)
    }, [submission.label])
    
    const resetDialog = () => {
        setSubmissionText({comment : "", metatext : {}})
    }

    const onClose = () => {
        resetDialog()
        setAttributeSelectionDialog(prevValues => {
            return {
                ...prevValues,
                isOpen: false,
                submitted: false,
                isLoading: false,
                success: false,
                error: undefined
            }
        })
    }
    
    return <Dialog isOpen={isOpen} title="State Change" style={{ width: "min(80vw, 900px)" }} onClose={onClose}>
        <DialogBody>
        <div className="flex flex-column padding--medium">
        
        
        <div style={{maxHeight : "40vh", overflowY:"scroll", marginBottom : "1rem"}}>
            <div>
                        {submitted ? null : isLoading ? <Spinner /> : <div>
                        <h3>Attribute Selection</h3>
                            <p>Please select the required dataset attributes.</p>
                            <LiteralAttributeSelection {...{
                                        authenticationStatus,
                                        attributesByTag,
                                        selectedAttributes,
                                        setSelectedAttributes,
                                        attributeFilter
                                                }} />
                        </div>}
                <div>
                    {submitted ? isLoading ? <p>Updating submission ...</p> : success ? <p>Success. Dataset attributes updated.</p> :  error !== undefined ? <APIError error={error} /> : null : null}
                </div>
            </div>
            </div>

        {isLoading || submitted ? null : <div>
            <h3>Meta text</h3>
            <div>
                <MetaText
                    metatextValues={submissionText.metatext}
                    onMetaTextChange={(metatextTag, value) => setSubmissionText(prevValues => { return { ...prevValues, metatext: { ...prevValues.metatext, [metatextTag]: value } } })}
                    index=""
                    allowTextForState={newSubmissionState} />
                </div>
            
            <h3>Timeline Comment</h3>
            <div>
                        <TextArea
                            fill={true}
                            value={submissionText.comment}
                            placeholder="Enter a comment here which will be visible in the timeline."
                            onChange={() => setSubmissionText(prevValues => { return { ...prevValues, comment: e.target.value } })} />
            </div>
        </div>}
            </div>
        </DialogBody>
        <DialogFooter actions={[<div className="flex"><Button text="Submit" onClick={() => onSubmit(submission.label, selectedAttributes,newSubmissionState, submission.state, comment)}/> <Button text="Cancel" intent="danger"  onClick={onClose}/></div>]} />
</Dialog>
}