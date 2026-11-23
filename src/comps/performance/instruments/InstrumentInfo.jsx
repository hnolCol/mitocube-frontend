import { useState } from "react"
import _ from "lodash"
import { Button, TextArea } from "@blueprintjs/core"
import { api } from "@/api"
import APIError from "../../core/error/APIerror"

/**
 * @description Free text info of an instrument (e.g. technician contact, service contract),
 * editable by curators via a text area, read-only for everyone else.
 * @param {Object} props
 * @param {String} props.instrument_tag The instrument tag.
 */
export function InstrumentInfo({ instrument_tag }) {

    const [editing, setEditing] = useState(false)
    const [text, setText] = useState("")

    const { data: info, isLoading, isError, error, refetch } =
        api.instruments.core.useGetInstrumentInfo({ tag: instrument_tag })

    const { data: permissions } = api.instruments.permissions.useGetInstrumentPermissions()

    const { mutate: saveInfo, isLoading: isSaving, isError: isSaveError, error: saveError } =
        api.instruments.core.usePutInstrumentInfo({
            onSuccess: () => {
                setEditing(false)
                refetch()
            }
        })

    if (!_.isString(instrument_tag)) return null

    const canEdit = _.get(permissions, "edit", false) === true

    const handleStartEditing = () => {
        setText(info?.text || "")
        setEditing(true)
    }

    const handleSave = () => saveInfo({ tag: instrument_tag, text })

    return (
        <div className="margin-top--medium">
            <div className="flex justify-space-between center-items" style={{ marginBottom: "0.25rem" }}>
                <span className="font-size--small text--muted" style={{ letterSpacing: "0.04em" }}>INFO</span>
                {canEdit && !editing
                    ? <Button small minimal icon="edit" text="Edit info" onClick={handleStartEditing} />
                    : null}
            </div>
            {editing ? (
                <div className="flex flex-column gap--small">
                    <TextArea
                        fill
                        growVertically
                        maxLength={10000}
                        value={text}
                        placeholder="e.g. Technician: ... Service contract: ..."
                        onChange={(e) => setText(e.target.value)}
                    />
                    <div className="flex gap--small">
                        <Button small intent="primary" text="Save" loading={isSaving} disabled={isSaving} onClick={handleSave} />
                        <Button small text="Cancel" disabled={isSaving} onClick={() => setEditing(false)} />
                    </div>
                    {isSaveError ? <APIError error={saveError} /> : null}
                </div>
            ) : (
                <>
                    {isLoading ? <div className="text--muted font-size--small">Loading info...</div> : null}
                    {isError ? <APIError error={error} /> : null}
                    {!isLoading && !isError ? (
                        info?.text
                            ? <div style={{ fontSize: "0.85rem", whiteSpace: "pre-wrap", color: "#182026" }}>{info.text}</div>
                            : <div className="text--muted font-size--small">{canEdit ? "No info yet. Use \u201cEdit info\u201d to add e.g. the technician or service contract." : "No info available."}</div>
                    ) : null}
                </>
            )}
        </div>
    )
}
