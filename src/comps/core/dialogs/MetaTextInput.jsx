import { RemoveButton } from "../base/buttons/RemoveButton"
import { HIGHLIGHT_COLOR } from "../colors/colorPalette"
import _ from "lodash"

export function MetaTextInput({ metatext, setMetatext, edit, handleSubmit, isLoadingPatch, isLoading, showButton = true, setIsStateFunction = true, showRemove = false, onRemove }) {
    return <div
                    className="padding--medium"
                    style={{
                        display : "grid",
                        gap : "1rem",
                        gridTemplateRows : showButton ? "40px 1fr 60px" : "40px 1fr",
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
                            onChange={setIsStateFunction  ? e =>
                                setMetatext(prevValues => ({ ...prevValues, title: e.target.value })) : e => setMetatext("title", e.target.value)
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
                {showRemove && _.isFunction(onRemove) ? <RemoveButton onRemove={onRemove} /> : null}
                            </div>
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
                            onChange={setIsStateFunction  ? e =>
                                setMetatext(prevValues => ({
                                    ...prevValues,
                                    text: e.target.value
                                })) : e => setMetatext("text", e.target.value)
                            }
                            rows={100}
                            disabled={metatext.disabled || isLoading || isLoadingPatch}
                            className="textarea"
                        />
                    </div>
            {showButton ? <div style={{ gridRow: "3", flexDirection: "row" }} className="flex justify-end">
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
                        {edit ? isLoadingPatch ? "Editing..." : "Edit" : isLoading ? "Submitting..." : "Submit"}
                    </button>
                </div>
            </div> : null}
                </div>
}
