import { Button } from "@blueprintjs/core"
import hooks from "@mitocube/api-hooks"
import _ from "lodash"
import { useState, useEffect } from "react"

export function SubmissionTitle({ tag, showEdit = true, showCopyToClipboard = true }) {

    const { data: submission_title, refetch : refetchTitle } = hooks.submissions.title.useGetSubmissionTitle({ tag }, { enabled: _.isString(tag) && tag.length > 0 })
    const { mutate: updateTitle } = hooks.submissions.title.usePatchSubmissionTitle()
    const [copied, setCopied] = useState(false)
    const [mouseIn, setMouseIn] = useState(false)
    const [editing, setEditing] = useState(false)
    const [value, setValue] = useState(submission_title || "")
    
    useEffect(() => {
        setValue(submission_title || "")
        }, [submission_title])

    useEffect(() => {
        if (copied) {
            const timer = setTimeout(() => setCopied(false), 1500)
            return () => clearTimeout(timer)
        }
    }, [copied])

    const handleEditEnd = () => {
        setEditing(false)
        if (value !== submission_title && _.isString(tag) && tag.length > 0) {
            updateTitle({ tag, title: value }, {
                onSuccess: () => {
                    console.log("Successfully updated title")
                    refetchTitle()
                }
            })
        }
    }

    const handleKeyUp = (e) => {
        if (e.key === "Enter") {
            handleEditEnd()
        }
        if (e.key === "Escape") {
            setEditing(false)
            setValue(submission_title || "")
        }
    }



    if (editing) {
        return (
            <span>
            <input
                type="text"
                value={value}
                onChange={e => setValue(e.target.value)}
                onBlur={handleEditEnd}
                autoFocus
                onKeyUp={handleKeyUp}
                style={{
                // fontSize: "1.5em",
                // fontWeight: "bold",
                border: "none",
                borderBottom: "2px solid #ccc",
                outline: "none",
                background: "transparent",
                width: "max(100%, 33vw)",
                padding: "2px 4px"
                }}
            />
            </span>
        )
    }





    
    return (
        <span onMouseEnter={() => setMouseIn(true)} onMouseLeave={() => setMouseIn(false)}>
            {submission_title}
            {showEdit && mouseIn && (
                <Button
                    intent="primary"
                    minimal
                    small
                    icon="edit"
                    onClick={() => setEditing(true)}
                    style={{ marginLeft: 8 }}
                />
            )}
            {showCopyToClipboard && mouseIn && _.isString(submission_title) && submission_title.length > 0 && (
                <Button
                    intent={copied ? "success" : "primary"}
                    minimal
                    small
                    // text={copied ? "Copied!" : "Copy to clipboard"}
                    icon={copied ? "tick" : "clipboard"}
                    onClick={() => {
                        navigator.clipboard.writeText(submission_title)
                        setCopied(true)
                    }}
                    style={{ marginLeft: 8 }}
                />
            )}
        </span>
    )

}
