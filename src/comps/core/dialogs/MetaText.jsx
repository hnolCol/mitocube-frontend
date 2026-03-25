import { Dialog } from "@blueprintjs/core"
import { useEffect, useState } from "react"
import PropTypes from "prop-types";
import { HIGHLIGHT_COLOR } from "../colors/colorPalette";
import hooks from "@mitocube/api-hooks";
import _, { set }  from "lodash";
import { MetaTextInput } from "./MetaTextInput";


MetaTextDialog.propTypes = {
    submission_tag : PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    isOpen: PropTypes.bool,
    title: PropTypes.string,
    tag: PropTypes.string,
    text: PropTypes.string,
    edit: PropTypes.bool
}   

MetaTextDialog.defaultProps = { 
    isOpen : false,
    title : "",
    tag : "",
    text : "",
    edit : false
}
/**
 * This component renders a dialog for creating or editing metatext associated with a submission.
 * @param {Object} props 
 * @param {String} props.submission_tag - The tag of the submission to which the metatext belongs.
 * @param {Boolean} props.isOpen - Boolean indicating if the dialog is open.
 * @param {String} props.tag - The tag of the metatext (required for editing). Not required for creation.
 * @param {String} props.title - The current title of the metatext (for editing). Not required for creation.
 * @param {String} props.text - The current text of the metatext (for editing). Not required for creation.
 * @param {Boolean} props.edit - Boolean indicating if the dialog is in edit mode.
 * @param {Function} props.onClose - Function to call when the dialog is closed. 
 * @returns 
 */
export function MetaTextDialog({submission_tag, isOpen = false, tag, title, text, edit, onClose }) {
    const [metatext, setMetatext] = useState({ title: "", text: "", disabled: false });
    
    const {mutate : postMetatext, isLoading } = hooks.submissions.metatexts.usePostMetatext()
    const {mutate : patchMetatext, isLoading : isLoadingPatch} = hooks.metatexts.usePatchMetatext()

    useEffect(() => {
        if (edit) {
            setMetatext({ title: title || "", text: text || "", disabled: false })
        }
        else {
            setMetatext({ title: "", text: "", disabled: false })
        }
    },[edit])

    /**
     * Handles form submission for creating or editing a metatext.
     * On success, it resets the form and closes the dialog.
     * @param {*} e - The event object.
     */
    const handleSubmit = (e) => {
        e.preventDefault();

        if (edit) { 
            // Edit existing metatext
            patchMetatext({ tag, title: metatext.title, text: metatext.text }, {
                onSuccess: () => {
                    setMetatext({ title: "", text: "", disabled: false, edit : false });
                    onClose(true, tag)
                }
            }) 

        } 
        else {
                postMetatext({ title: metatext.title, text: metatext.text, submission_tag }, {
                    onSuccess: () => {
                        setMetatext({ title: "", text: "", disabled: false, edit : false });
                        onClose()
                    }
                })
            }
    }


    return (
        <Dialog
            {...{ title : edit ? "Edit Metatext" :"Insert Metatext", isOpen, onClose }}
            isCloseButtonShown={true}
            canEscapeKeyClose={true}
            canOutsideClickClose={true}
            style={{ width: "33vw", height: "50vh", fontSize: "1rem", minHeight: "600px"}}
        >
             <MetaTextInput {... { metatext, setMetatext, edit, isLoading, handleSubmit, isLoadingPatch }} />
        </Dialog>
    )
}

