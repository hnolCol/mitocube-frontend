import { Dialog } from "@blueprintjs/core"
import { useEffect, useState } from "react"
import PropTypes from "prop-types";
import { HIGHLIGHT_COLOR } from "../colors/colorPalette";
import hooks from "@mitocube/api-hooks";
import _, { set }  from "lodash";


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
            <div
                className="padding--medium"
                style={{
                    display : "grid",
                    gap : "1rem",
                    gridTemplateRows : "40px 1fr 60px",
                    padding : "1.5rem",
                    gridTemplateColumns : "1fr",
                    height: "100%", // Ensure the grid fills the Dialog
                }}
            >
                <div style={{gridRow : "1"}}>
                    <div className="flex">
                    <input
                
                        type="text"
                        placeholder="Set metatext title..."
                        value={metatext.title}
                        disabled={metatext.disabled || isLoading || isLoadingPatch}
                        onChange={e =>
                            setMetatext(prevValues => ({ ...prevValues, title: e.target.value }))
                        }
                        autoFocus
                            style={{
                            width : "100%",
                            padding: "0.75rem",
                            fontSize: "1rem",
                            borderRadius: 8,
                            border: "1px solid #d1d5db",
                            background: "#f9fafb",
                            color: "#111827",
                            outline: "none",
                        }}
                        />
                        </div>
                    {/* <div className="font-size--small">Suggestions will be shown based on your title that you can use as a start...</div> */}
                </div>
                
                <div
                    style={{
                        gridRow: "2",
                        overflowY: "auto",
                        minHeight: 0, // Allow the grid item to shrink
                        maxHeight: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column"
                    }}
                >
                    <textarea
                        placeholder="Add additional information about this submission. You can use markdown syntax here. For example, you can add **bold** or _italic_ text, create lists, and include links. This is useful for providing context or details that may help others understand the submission better."
                        value={metatext.text}
                        onChange={e =>
                            setMetatext(prevValues => ({
                                ...prevValues,
                                text: e.target.value
                            }))
                        }
                        rows={100}
                        disabled={metatext.disabled || isLoading || isLoadingPatch}
                        className="textarea"
                    />
                </div>
                <div style={{ gridRow: "3", flexDirection: "row"}} className="flex justify-end">
                    <div>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        style={{
                            alignSelf: "flex-end",
                            padding: "0.6rem 1.5rem",
                            borderRadius: 4,
                            border: "none",
                            background: HIGHLIGHT_COLOR,
                            color: "#fff",
                            fontWeight: 600,
                            fontSize: "1rem",
                            cursor: isLoading ? "not-allowed" : "pointer",
                            opacity: isLoading ? 0.7 : 1,
                        }}
                    >
                        {edit ? isLoadingPatch ? "Editing..." : "Edit"  : isLoading ? "Submitting..." : "Submit"}
                        </button>
                        </div>
                </div>
            </div>
        </Dialog>
    )
}

