import { useState, useEffect } from "react"
import _ from "lodash"
import { HIGHLIGHT_COLOR } from "../../core/colors/colorPalette"
import { api } from "@/api";
import { ResearchGroupSelect } from "@/comps/core/input/api/ResearchGroupSelect"
import PropTypes from "prop-types"


InsertNews.propTypes = {
    onSuccess : PropTypes.func,
    authenticationStatus : PropTypes.object
}

/**
 * 
 * @param {Object} props 
 * @param {Function} props.onSuccess - Callback function to be called upon successful news insertion. 
 * @param {Object} props.authenticationStatus - Authentication status of the current user. Used to preselect one of the user's own research groups.
 * @returns 
 */
export function InsertNews({onSuccess = () => {}, authenticationStatus = null}) {
    const [formData, setFormData] = useState({ title: "", content: "", submission_tags: [], feature_tags: [], research_group_tag: "", general: false })
    const { mutate : postNews, isLoading } = api.news.usePostNews()

    const { data: ownUser } = api.users.core.useGetPublicUserByTag(
        { tag: authenticationStatus?.tag },
        { enabled: _.isObject(authenticationStatus) && _.isString(authenticationStatus?.tag), staleTime: 1000 * 60 * 5 }
    )

    useEffect(() => {
        // preselect the user's first research group; group-targeted news is only visible to that
        // group, curators and admins, general news (checkbox) is visible to everyone
        if (!formData.general && formData.research_group_tag === "" && _.isArray(ownUser?.research_group_tags) && ownUser.research_group_tags.length > 0) {
            setFormData(prevValues => ({ ...prevValues, research_group_tag: prevValues.research_group_tag || ownUser.research_group_tags[0] }))
        }
    }, [ownUser])
    
    const handleSubmit = (e) => {
        e.preventDefault()
        postNews({
            title: formData.title,
            content: formData.content,
            submission_tags: formData.submission_tags || [],
            feature_tags: formData.feature_tags || [],
            research_group_tag: formData.general ? null : formData.research_group_tag
        }, {
            onSuccess: () => {
                setFormData({ title: "", content: "", submission_tags: [], feature_tags: [], research_group_tag: "", general: false })
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
                            gridTemplateRows : "40px 40px 1fr 60px",
                            padding : "1.5rem",
                            gridTemplateColumns : "1fr",
                            height: "100%", // Ensure the grid fills the Dialog
                        }}
                    >
                        <div style={{gridRow : "1"}}>
                            <div className="flex" style={{ gap: "1rem" }}>
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
                            style={{ flex: 1 }}
                        />
                            <ResearchGroupSelect
                                value={formData.research_group_tag}
                                onChange={(research_group_tag) => setFormData(prevValues => ({ ...prevValues, research_group_tag }))}
                                placeholder="Target research group ..."
                                disabled={formData.general}
                            />
                                </div>
                            {/* <div className="font-size--small">Suggestions will be shown based on your title that you can use as a start...</div> */}
                        </div>
                        <div style={{ gridRow: "2" }} className="flex center-items">
                            <label className="flex center-items" style={{ gap: "0.5rem", cursor: "pointer" }}>
                                <input
                                    type="checkbox"
                                    checked={formData.general}
                                    onChange={(e) => setFormData(prevValues => ({ ...prevValues, general: e.target.checked }))}
                                />
                                <span className="font-size--small">Show to everyone (general news)</span>
                            </label>
                        </div>
                        
                        <div
                            style={{
                                gridRow: "3",
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
                        <div style={{ gridRow: "4", flexDirection: "row"}} className="flex justify-end">
                            <div>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isLoading || (!formData.general && (!_.isString(formData.research_group_tag) || formData.research_group_tag.length === 0))}
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