import PropType from 'prop-types'
import { Loading } from "../../core/base/states/Loading"
import _ from "lodash"
import { Content, TitleText } from "../../core/metrics/ItemBasics"
import { useState } from "react"
import { HIGHLIGHT_COLOR } from '../../core/colors/colorPalette'
import { api } from "@/api"

ResearchAim.propTypes = {
    submission_tag : PropType.string.isRequired
}
/**
 * @description Display the research aim of a submission
 * @param {Object} props 
 * @param {String} props.submission_tag The submission tag. 
 * @returns 
 */
export function ResearchAim({ submission_tag, showEdit = true }) {

    const [editing, setEditing] = useState(false)
    const [inputValue, setInputValue] = useState("")

    const { data: research_aim, isLoading, isFetching, isError, refetch, error } = api.submissions.metatexts.useGetResearchAim({ tag: submission_tag }, { enabled: _.isString(submission_tag) && submission_tag.length > 0 && !editing, staleTime: 5 * 60 * 1000 }) //5 minutes
    const { mutate, isLoading : patchIsLoading }  = api.submissions.metatexts.usePatchResearchAim()

    const handleEditClick = () => {
        setInputValue(research_aim|| "")
        setEditing(true)
    }

    const handleSave = async () => {
        mutate({ submission_tag, research_aim: inputValue }, {
            onSuccess: () => {
                setEditing(false)
                refetch() //get the updated research aim
            }
        })
    }

    const handleCancel = () => {
        setEditing(false)
    }

    const research_aim_found = !_.isString(research_aim) || isError
    return (
        <div style={{ minWidth: "min(45vw,800px)", maxWidth : "1200px", textAlign: "justify", fontFamily: "Inter, Arial, sans-serif" }} className="margin-top--little">
            <div className="margin-left--little">
                <TitleText title={"Abstract"} />
            </div>
            <hr style={{ borderTop: "0.5px solid #eee", margin: "16px 0" }} />
            <div className="margin--little padding--little">
                {isLoading || isFetching ? (
                    <Loading />
                ) : editing ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <textarea
                                className='text-input'
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            rows={12}
                            autoFocus
                        />
                        <div style={{ display: "flex", gap: 8 }}>
                            <button
                                onClick={handleSave}
                                disabled={patchIsLoading}
                                style={{
                                    background: HIGHLIGHT_COLOR,
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 6,
                                    padding: "8px 20px",
                                    fontSize: 15,
                                    cursor: patchIsLoading ? "not-allowed" : "pointer",
                                    opacity: patchIsLoading ? 0.7 : 1,
                                    transition: "background 0.2s"
                                }}
                            >
                                {patchIsLoading ? "Saving..." : "Save"}
                            </button>
                            <button
                                onClick={handleCancel}
                                style={{
                                    background: "#f3f4f6",
                                    color: "#222",
                                    border: "1px solid #ccc",
                                    borderRadius: 6,
                                    padding: "8px 20px",
                                    fontSize: 15,
                                    cursor: "pointer",
                                    transition: "background 0.2s"
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div
                            onClick={handleEditClick}
                            style={{
                                cursor: "pointer",
                                borderRadius: 8,
                                padding: 12,
                                transition: "background 0.2s",
                                background: "#f9fafb",
                                border: "1px solid #eee"
                            }}
                            tabIndex={0}
                            onKeyPress={e => { if (e.key === "Enter") handleEditClick() }}
                        >
                            <Content text={research_aim} />
                            <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>(Click to add/edit)</div>
                        </div>
                        {research_aim_found && (
                                    <div className="intent-text--error" style={{ marginTop: 8 }}>
                                        {isError ? error.response.data.detail : ""}
                                {/* No research aim available or an error was returned. */}
                            </div>
                        )}
                    </div>
                )}
            </div>
            <hr style={{ borderTop: "0.5px solid #eee", margin: "16px 0" }} />
        </div>
    )
}

