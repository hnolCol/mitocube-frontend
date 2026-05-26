import { useState, useEffect } from "react"
import { api } from "@/api"
import Loading from "../../core/base/loading"
import APIError from "../../core/error/APIerror"
import PropTypes from "prop-types"
import _ from "lodash"

EditNews.propTypes = {
    news_tag: PropTypes.string.isRequired,
    onClose: PropTypes.func,
    onSuccess: PropTypes.func
}

EditNews.defaultProps = {
    onClose: () => {},
    onSuccess: () => {}
}

export function EditNews({ news_tag, onClose, onSuccess }) {
    const [formData, setFormData] = useState({ 
        title: "", 
        content: "", 
        submission_tags: []
    })
    
    const { data: news, isLoading: newsLoading, isError: loadError, error: loadErrorMsg } = api.news.useGetNewsByTag(
        { tag: news_tag },
        { enabled: !!news_tag }
    )
    
    const { mutate: updateNews, isLoading } = api.news.useUpdateNews()
    
    useEffect(() => {
        if (news) {
            setFormData({
                title: news.title || "",
                content: news.content || "",
                submission_tags: news.submission_tags || []
            })
        }
    }, [news])
    
    const handleSubmit = (e) => {
        e.preventDefault()
        updateNews({
            tag: news_tag,
            user_tag: news.user_tag,
            ...formData
        }, {
            onSuccess: () => {
                if (_.isFunction(onSuccess)) {
                    onSuccess()
                }
                if (_.isFunction(onClose)) {
                    onClose()
                }
            }
        })
    }
    
    if (newsLoading) return <Loading />
    if (loadError) return <APIError error={loadErrorMsg} />

    return (
        <div
            className="padding--medium"
            style={{
                display: "grid",
                gap: "1rem",
                gridTemplateRows: "40px 1fr 60px",
                padding: "1.5rem",
                gridTemplateColumns: "1fr",
                height: "100%",
            }}
        >
            <div style={{ gridRow: "1" }}>
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
            
            <div
                style={{
                    gridRow: "2",
                    overflowY: "auto",
                    minHeight: 0,
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
            
            <div style={{ gridRow: "3", flexDirection: "row" }} className="flex justify-end">
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    style={{
                        alignSelf: "flex-end",
                        padding: "0.6rem 1.5rem",
                        borderRadius: 4,
                        border: "none",
                        background: "#0d8050",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "12px",
                        cursor: isLoading ? "not-allowed" : "pointer",
                        opacity: isLoading ? 0.7 : 1,
                    }}
                >
                    {isLoading ? "Updating..." : "Update"}
                </button>
            </div>
        </div>
    )
}