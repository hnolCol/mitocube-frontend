import { Button, Dialog, DialogBody, DialogFooter, Spinner, TextArea } from "@blueprintjs/core";
import { LiteralAttributeSelection } from "../LiteralAttributeSelection";
import { useEffect, useState } from "react";
import PropTypes from "prop-types"
import APIError from "../../../core/error/APIerror";
import { mapAttributeTagsToAttributes } from "../../../../services/attributes";
import MetaText from "../../new/MetaText";

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
    const [comment, setComment] = useState("")
    const [metatext, setMetatext] = useState({})

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
    
    return <Dialog isOpen={isOpen} title="State Change"
        style={{ width: "min(80vw, 900px)"}}
        onClose={onClose}>
        <div className="flex flex-column padding--medium">
        <h3>Attribute Selection</h3>
        <p>Please select the required dataset attributes.</p>
        <div style={{maxHeight : "40vh", overflowY:"scroll", marginBottom : "1rem"}}>
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
        </div>
        <h3>Meta text</h3>
        <div>
            <MetaText metatextValues={metatext} onMetaTextChange={(metatextTag, value) => setMetatext(prevValues => { return { ...prevValues, [metatextTag]: value } })} index="" allowTextForState={newSubmissionState}/>
        </div>
        <h3>Comment</h3>
        <div>
            <TextArea fill={true} value={comment} placeholder="Enter a comment here which will be visible in the timeline." onChange={e => setComment(e.target.value)}/>
            </div>
            </div>
        <DialogFooter actions={[<div className="flex"><Button text="Submit" onClick={() => onSubmit(submission.label, selectedAttributes,newSubmissionState, submission.state, comment)}/> <Button text="Cancel" intent="danger"  onClick={onClose}/></div>]} />
</Dialog>
}