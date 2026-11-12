import { useState } from "react"
import { api } from "@/api"
import { Alert, Callout } from "@blueprintjs/core"
import _ from "lodash"
import { CreatedAt } from "../../core/metrics/CreatedAt"
import { AddButton } from "@/comps/core/base/buttons/AddButton"
import { PlateCreateDialog } from "./PlateCreateDialog"

const dash = <span className="text--muted">–</span>

const CURATOR_ROLE = 2 // must match the backend user role encoding; curators and admins are >= 2

/**
 * Admin view to create and list the physical well plates in the lab.
 */
export function PlatesAdmin({ userRole }) {

    const isCurator = _.isFinite(_.toNumber(userRole)) && _.toNumber(userRole) >= CURATOR_ROLE

    const [dialogOpen, setDialogOpen] = useState(false)
    const [alertProps, setAlertProps] = useState({ isOpen: false })
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [warning, setWarning] = useState(null)

    const { data: plates, isLoading, isError, error, refetch } = api.plates.plates.useGetPlates()

    const { mutate: deletePlate, isError: deleteIsError, error: deleteError } =
        api.plates.plates.useDeletePlate({ onSuccess: () => refetch() })

    const handleDelete = (plate) => {
        setDeleteTarget(null)
        if (plate.n_used_wells > 0) {
            setWarning(`Plate "${plate.name}" is being used in a runlist and cannot be deleted.`)
            return
        }
        deletePlate({ tag: plate.tag })
    }

    return (
        <div className="div--expand padding--medium flex-column--full-height">
            <div className="flex flex-column margin--medium padding--medium gap--medium-small">
                <h3>Plates</h3>
                {!isCurator ? (
                    <Callout className="margin-bottom--medium" intent="warning" icon="warning-sign">
                        Restricted area : plate management is reserved for curators and admins. You can view the plates, but creating and deleting plates is disabled for your account.
                    </Callout>
                ) : null}
                <p className="font-size--small" style={{ color: "#888" }}>
                    Plates are the physical well plates in the lab in which samples are stored.
                    When creating a runlist, select the plate the samples are on.
                </p>
                <div className="flex">
                    <Alert
                        isOpen={alertProps.isOpen}
                        intent="success"
                        confirmButtonText="OK"
                        onConfirm={() => setAlertProps({ isOpen: false })}
                        onClose={() => setAlertProps({ isOpen: false })}
                    >
                        <p>Plate created successfully.</p>
                    </Alert>
                    <Alert
                        isOpen={deleteTarget !== null}
                        intent="danger"
                        cancelButtonText="Cancel"
                        confirmButtonText="Delete"
                        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
                        onCancel={() => setDeleteTarget(null)}
                        onClose={() => setDeleteTarget(null)}
                    >
                        <p>Delete plate "{deleteTarget?.name}"? This cannot be undone.</p>
                    </Alert>
                    <PlateCreateDialog
                        isOpen={dialogOpen}
                        onClose={() => setDialogOpen(false)}
                        onCreated={() => {
                            setDialogOpen(false)
                            setAlertProps({ isOpen: true })
                            refetch()
                        }}
                    />
                    <AddButton onSelect={() => setDialogOpen(true)} disabled={!isCurator} />
                </div>
                {warning ? (
                    <Callout className="margin-bottom--medium" intent="warning" icon="warning-sign">
                        <div className="flex center-items justify-space-between">
                            <span>{warning}</span>
                            <button className="basic-button--small" onClick={() => setWarning(null)}>✕</button>
                        </div>
                    </Callout>
                ) : null}
                {deleteIsError ? <div className="font-color--error">Failed to delete plate: {_.get(deleteError, "message", "")}</div> : null}
                {isError ? <div className="font-color--error">Failed to load plates: {_.get(error, "message", "")}</div> : null}
                {isLoading ? <div>Loading...</div> : null}
                <div className="div--expand padding--medium">
                    {!isLoading && !isError && (_.isArray(plates) ? plates.length : 0) === 0
                        ? <p className="text--muted">No plates yet. Create one to get started.</p>
                        : null}
                    <div style={{ maxHeight: "70vh", overflowY: "scroll", paddingBottom: "3rem", paddingRight: "0.5rem" }} className="flex flex-column">
                        {_.isArray(plates) ? plates.map(plate => (
                            <PlateItem
                                key={plate.tag}
                                plate={plate}
                                onDelete={() => setDeleteTarget(plate)}
                                disabled={plate.n_used_wells > 0 || !isCurator}
                                isCurator={isCurator}
                            />
                        )) : null}
                    </div>
                </div>
            </div>
        </div>
    )
}

const SUBMISSION_COLORS = [
    "#2f6f9f", "#c94f4f", "#4f9f59", "#b8862f", "#7d5ba6",
    "#3fa7a0", "#d16ba5", "#8a8f36", "#5b7dc4", "#a05c4f"
]

const submissionColor = (tag, submissions) => {
    const index = _.findIndex(submissions, s => s.submission_tag === tag)
    return SUBMISSION_COLORS[index % SUBMISSION_COLORS.length]
}

function PlateSubmissionsLayout({ plate }) {

    const { data: layout, isLoading, isError, error } =
        api.plates.plates.useGetPlateSubmissionsLayout({ tag: plate.tag })

    if (isLoading) return <div className="text--muted font-size--small margin-top--medium">Loading plate layout...</div>
    if (isError) return <div className="font-color--error font-size--small margin-top--medium">Failed to load plate layout: {_.get(error, "message", "")}</div>
    if (!layout) return null

    return (
        <div className="margin-top--medium">
            <div className="font-weight--bold" style={{ fontSize: "0.8rem", marginBottom: "0.4rem" }}>
                Submissions on this plate
            </div>
            {layout.submissions.length === 0 ? (
                <div className="text--muted font-size--small">No submissions measured on this plate yet.</div>
            ) : (
                <div className="flex" style={{ gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: `repeat(${layout.columns}, 1.6rem)`,
                            gap: "2px",
                            justifyItems: "stretch"
                        }}
                    >
                        {layout.wells.map(well => {
                            const color = well.submission_tag ? submissionColor(well.submission_tag, layout.submissions) : "#e5e8eb"
                            return (
                                <div
                                    key={well.position}
                                    title={well.submission_tag
                                        ? `${well.position} : ${well.run_name ?? ""} (${layout.submissions.find(s => s.submission_tag === well.submission_tag)?.submission_label ?? well.submission_tag})`
                                        : `${well.position} : empty`}
                                    style={{
                                        backgroundColor: color,
                                        borderRadius: "3px",
                                        height: "1.6rem",
                                        opacity: well.submission_tag ? 1 : 0.6
                                    }}
                                />
                            )
                        })}
                    </div>
                    <div className="flex flex-column" style={{ gap: "0.25rem" }}>
                        {layout.submissions.map(s => (
                            <div key={s.submission_tag} className="flex center-items font-size--small" style={{ gap: "0.4rem" }}>
                                <span style={{
                                    backgroundColor: submissionColor(s.submission_tag, layout.submissions),
                                    width: "0.8rem",
                                    height: "0.8rem",
                                    borderRadius: "3px",
                                    display: "inline-block",
                                    flexShrink: 0
                                }} />
                                <span>
                                    <strong>{s.submission_label}</strong>
                                    {s.submission_title ? ` : ${s.submission_title}` : ""}
                                    {s.user_firstname || s.user_lastname ? ` (${_.compact([s.user_firstname, s.user_lastname]).join(" ")})` : ""}
                                    <span className="text--muted">{` ${s.n_wells} well${s.n_wells > 1 ? "s" : ""}`}</span>
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

function PlateRunlists({ plate }) {

    const { data: runlists, isLoading, isError, error } =
        api.plates.plates.useGetPlateRunlists({ tag: plate.tag })

    if (isLoading) return <div className="text--muted font-size--small margin-top--medium">Loading runlists...</div>
    if (isError) return <div className="font-color--error font-size--small margin-top--medium">Failed to load runlists: {_.get(error, "message", "")}</div>
    if (!runlists || runlists.length === 0) return null

    return (
        <div className="margin-top--medium">
            <div className="font-weight--bold" style={{ fontSize: "0.8rem", marginBottom: "0.4rem" }}>
                Runlists using this plate
            </div>
            <div className="flex flex-column" style={{ gap: "0.15rem" }}>
                {runlists.map(rl => (
                    <div key={rl.runlist_tag} className="font-size--small">
                        <strong>{rl.instrument_text ?? "No instrument"}</strong>
                        {` \u00b7 ${rl.n_runs_on_plate} run${rl.n_runs_on_plate > 1 ? "s" : ""} on this plate`}
                        {` \u00b7 ${rl.submission_label}`}
                        {rl.user_firstname || rl.user_lastname ? ` \u00b7 ${_.compact([rl.user_firstname, rl.user_lastname]).join(" ")}` : ""}
                        {_.isNumber(rl.created_at) ? <> \u00b7 <CreatedAt createdat={rl.created_at} /></> : null}
                    </div>
                ))}
            </div>
        </div>
    )
}

function PlateItem({ plate, onDelete, disabled, isCurator }) {

    const [showDetails, setShowDetails] = useState(false)

    return (
        <div className="flex margin-bottom--little">
            <button
                className="flex"
                onClick={() => setShowDetails(prev => !prev)}
                style={{
                    backgroundColor: "#fff",
                    borderRadius: "6px",
                    border: "none",
                    width: "100%",
                    cursor: "pointer",
                    textAlign: "left"
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#efefef"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "#fff"}
            >
                <div className="flex flex-column padding--medium width--full">
                    <div className="flex justify-space-between align-center" style={{ width: "100%", gap: "1rem" }}>
                        <div className="flex flex-column" style={{ gap: "0.1rem", flex: 1, minWidth: 0 }}>
                            <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>{plate.name}</span>
                            <span style={{ fontSize: "0.78rem", color: "#777" }}>
                                {plate.rows * plate.columns} wells ({plate.rows} × {plate.columns}){plate.plate_type ? ` | ${plate.plate_type}` : ""}
                            </span>
                        </div>
                        <div className="flex align-center" style={{ gap: "0.4rem", flexShrink: 0 }}>
                            <span style={{ fontSize: "0.75rem", color: "#777" }}>created by {plate.created_by}</span>
                            {_.isNumber(plate.created_at) ? <CreatedAt createdat={plate.created_at} /> : null}
                            <button className="basic-button--small font-color--error" title={disabled ? "In use in a runlist, cannot be deleted" : "Delete"} onClick={(e) => {
                                    e.stopPropagation()
                                    if (!disabled) onDelete()
                                }}
                                disabled={disabled}
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                    {showDetails ? (
                        <>
                            <table style={{ width: "fit-content", fontSize: "0.75rem", textAlign: "left", marginTop: "0.5rem" }}>
                                <tbody>
                                    <tr>
                                        <th className="table-head-cell">Format</th>
                                        <td>{plate.rows} × {plate.columns} ({plate.rows * plate.columns} wells)</td>
                                    </tr>
                                    <tr>
                                        <th className="table-head-cell">Type</th>
                                        <td>{plate.plate_type || dash}</td>
                                    </tr>
                                    <tr>
                                        <th className="table-head-cell">Vendor</th>
                                        <td>{plate.vendor || dash}</td>
                                    </tr>
                                    <tr>
                                        <th className="table-head-cell">Cold storage</th>
                                        <td>{plate.cold_storage || dash}</td>
                                    </tr>
                                    <tr>
                                        <th className="table-head-cell">Location</th>
                                        <td>{plate.location || dash}</td>
                                    </tr>
                                    <tr>
                                        <th className="table-head-cell">Description</th>
                                        <td>{plate.description || dash}</td>
                                    </tr>
                                    <tr>
                                        <th className="table-head-cell">Runlists / Submissions</th>
                                        <td>{plate.n_runlists ?? 0} runlist{_.toNumber(plate.n_runlists) !== 1 ? "s" : ""} / {plate.n_submissions ?? 0} submission{_.toNumber(plate.n_submissions) !== 1 ? "s" : ""}</td>
                                    </tr>
                                </tbody>
                            </table>
                            {isCurator ? (
                                <>
                                    <PlateRunlists plate={plate} />
                                    <PlateSubmissionsLayout plate={plate} />
                                </>
                            ) : (
                                <div className="text--muted font-size--small margin-top--medium">
                                    Plate usage (runlists and submissions on this plate) is only visible to curators and admins.
                                </div>
                            )}
                        </>
                    ) : null}
                </div>
            </button>
        </div>
    )
}
