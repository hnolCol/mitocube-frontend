import { Button } from "@blueprintjs/core"
import _ from "lodash"
import { useState, useEffect } from "react"

export function EditableText({ initialValue = "", onChange, showEdit = true, showCopyToClipboard = true, minLength = 0, maxLength = 1000 }) {

    const [text, setText] = useState(initialValue)
    const [copied, setCopied] = useState(false)
    const [mouseIn, setMouseIn] = useState(false)
    const [editing, setEditing] = useState(false)
    const [value, setValue] = useState(initialValue)
    useEffect(() => {
        setText(initialValue)
    }, [initialValue])

    useEffect(() => {
        setValue(text)
    }, [text])

    useEffect(() => {
        if (copied) {
            const timer = setTimeout(() => setCopied(false), 1500)
            return () => clearTimeout(timer)
        }
    }, [copied])

    const handleEditEnd = () => {
        if (value.length < minLength || value.length > maxLength) {
            setValue(text)
            return
        }
        setEditing(false)
        if (value !== text) {
            setText(value)
            if (onChange) {
                onChange(value)
            }
        }
    }

    const handleKeyUp = (e) => {
        if (e.key === "Enter") {
            handleEditEnd()
        }
        if (e.key === "Escape") {
            setEditing(false)
            setValue(text)
        }
    }

    if (editing) {
        return (
            <span>
            <div>
            <input
                type="text"
                value={value}
                onChange={e => setValue(e.target.value)}
                onBlur={handleEditEnd}
                autoFocus
                onKeyUp={handleKeyUp}
                    style={{
                color: value.length < minLength || value.length > maxLength ? "rgb(156, 39, 39)" : "inherit",
                border: "none",
                borderBottom: "2px solid #ccc",
                outline: "none",
                background: "transparent",
                width: "max(100%, 33vw)",
                padding: "2px 4px"
                }}
                    />
                    {minLength > 0 ? <span className="font-size--smallest">{value.length <= maxLength && value.length >= minLength ? "" : `Length must be between ${minLength} and ${maxLength}`}</span> : null}
            </div>
            </span>
        )
    }

    return (
        <span onMouseEnter={() => setMouseIn(true)} onMouseLeave={() => setMouseIn(false)}>
            {text}
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
            {showCopyToClipboard && mouseIn && _.isString(text) && text.length > 0 && (
                <Button
                    intent={copied ? "success" : "primary"}
                    minimal
                    small
                    icon={copied ? "tick" : "clipboard"}
                    onClick={() => {
                        navigator.clipboard.writeText(text)
                        setCopied(true)
                    }}
                    style={{ marginLeft: 8 }}
                />
            )}
        </span>
    )
}