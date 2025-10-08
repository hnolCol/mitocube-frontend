import { useState } from "react"
import { HIGHLIGHT_COLOR } from "../../core/colors/colorPalette"
import hooks from "@mitocube/api-hooks"
import PropTypes from "prop-types"


InsertNews.propTypes = {
    onSuccess : PropTypes.func
}

InsertNews.defaultProps = {
    onSuccess : () => {}
}
/**
 * 
 * @param {Object} props 
 * @param {Function} props.onSuccess - Callback function to be called upon successful news insertion. 
 * @returns 
 */
export function InsertNews({onSuccess}) {
    const [formData, setFormData] = useState({ title: "", content: "", submission_tags: [], feature_tags: [] })
    const { mutate : postNews, isLoading } = hooks.news.usePostNews()
    
    const handleSubmit = (e) => {
        e.preventDefault()
        postNews({
            title: formData.title,
            content: formData.content,
            submission_tags: formData.submission_tags || [],
            feature_tags: formData.feature_tags || []
        }, {
            onSuccess: () => {
                setFormData({ title: "", content: "", submission_tags: [], feature_tags: [] })
                onSuccess()
            }
        })
    }

    return (
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
                            value={formData.title}
                            onChange={(e) =>
                                setFormData((prevValues) => ({
                                    ...prevValues,
                                    title: e.target.value,
                                }))
                            }
                            className="text-input"
                            type="text"
                            placeholder="Title"
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
                            value={formData.content}
                            rows={20}
                            onChange={(e) =>
                                setFormData((prevValues) => ({
                                    ...prevValues,
                                    content: e.target.value,
                                }))
                            }   
                            className="textarea"
                            placeholder="News content"
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
                                    fontSize: "12px",
                                    cursor: isLoading ? "not-allowed" : "pointer",
                                    opacity: isLoading ? 0.7 : 1,
                                }}
                            >
                                {isLoading ? "Submitting..." : "Submit"}
                                </button>
                                </div>
                        </div>
                    </div>
    )
}



        <div className="margin--medium padding--medium">
            <h4>Insert News</h4>


            
            


        </div>