import { Button, Dialog, DialogBody, DialogFooter, Spinner, TextArea } from "@blueprintjs/core";
import { LiteralAttributeSelection } from "../LiteralAttributeSelection";
import { useEffect, useState } from "react";
import PropTypes from "prop-types"
import APIError from "../../../core/error/APIerror";
import { mapAttributeTagsToAttributes } from "../../../../services/attributes";

AttributeSlectionDialog.propTypes = {
    authenticationStatus: PropTypes.object.isRequired,
    attributesByTag: PropTypes.object.isRequired,
    attributeFilter: PropTypes.object.isRequired,
    prevSelectedAttributes: PropTypes.object,
    isOpen: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    success : PropTypes.bool
}


export function AttributeSlectionDialog({
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
    useEffect(() => {
        const matchedPrevSelectedAttributes = mapAttributeTagsToAttributes({ tagAttributes: prevSelectedAttributes, attributesByTag })
        setSelectedAttributes(matchedPrevSelectedAttributes)
    }, [submission.label])
    
   
    const onClose = () => {
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
    
    return <Dialog isOpen={isOpen} title="Attribute Selection"
        style={{ width: "min(80vw, 900px)", height : "min(80vh, 1200px)"}}
        onClose={onClose}>
        <DialogBody>
            <div>
                {submitted ? null : isLoading ? <Spinner />: <LiteralAttributeSelection {...{
                    authenticationStatus,
                    attributesByTag,
                    selectedAttributes,
                    setSelectedAttributes,
                    attributeFilter
                    }} />}
                <div>
                    {submitted ? success ? <p>Success</p> : <APIError error={error} /> : isLoading ? <p>Updating submission ...</p> : null}
                </div>
            </div>
            
        </DialogBody>
        
        <DialogBody>
            <h4>Timeline comment</h4>
            <TextArea fill={true} placeholder="Enter a comment here which will be visible in the timeline."/>
        </DialogBody>
        <DialogFooter actions={[<div className="flex"><Button text="Submit" onClick={() => onSubmit(submission.label, selectedAttributes,newSubmissionState, submission.state)}/> <Button text="Cancel" intent="danger"  onClick={onClose}/></div>]} />
</Dialog>
}