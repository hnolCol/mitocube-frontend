import { useState } from "react"
import { api } from "@/api"
import { Alert, Callout } from "@blueprintjs/core"
import _ from "lodash"
import { CreatedAt } from "../../core/metrics/CreatedAt"
import { AddButton } from "@/comps/core/base/buttons/AddButton"
import { PlateCreateDialog } from "./PlateCreateDialog"

const dash = <span className="text--muted">–</span>

/**
 * Admin view to create and list the physical well plates in the lab.
 */
export function PlatesAdmin() {

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
        <div
            className="div--expand padding--medium"
            style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}
        >
            <div className="flex flex-column margin--medium padding--medium" style={{ gap: "0.4rem" }}>
                <h3>Plates</h3>
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
                    <AddButton onSelect={() => setDialogOpen(true)} />
                </div>
                {warning ? (
                    <Callout intent="warning" icon="warning-sign" style={{ marginBottom: "1rem" }}>
                        <div className="flex center-items justify-space-between">
                            <span>{warning}</span>
                            <button className="basic-button--small" onClick={() => setWarning(null)}>✕</button>
                        </div>
                    </Callout>
                ) : null}
                {deleteIsError ? <div style={{ color: "#a82a2a" }}>Failed to delete plate: {_.get(deleteError, "message", "")}</div> : null}
                {isError ? <div style={{ color: "#a82a2a" }}>Failed to load plates: {_.get(error, "message", "")}</div> : null}
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
                                disabled={plate.n_used_wells > 0}
                            />
                        )) : null}
                    </div>
                </div>
            </div>
        </div>
    )
}

function PlateItem({ plate, onDelete, disabled }) {

    const [showDetails, setShowDetails] = useState(false)

    return (
        <div className="flex" style={{ marginBottom: "0.8rem" }}>
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
                <div className="flex flex-column padding--medium" style={{ width: "100%" }}>
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
                            <button
                                className="basic-button--small"
                                style={{ color: "#a82a2a" }}
                                title={disabled ? "In use in a runlist, cannot be deleted" : "Delete"}
                                onClick={(e) => {
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
                        <table style={{ width: "fit-content", fontSize: "0.75rem", textAlign: "left", marginTop: "0.5rem" }}>
                            <tbody>
                                <tr>
                                    <th style={{ paddingRight: "0.5rem", fontWeight: 600 }}>Format</th>
                                    <td>{plate.rows} × {plate.columns} ({plate.rows * plate.columns} wells)</td>
                                </tr>
                                <tr>
                                    <th style={{ paddingRight: "0.5rem", fontWeight: 600 }}>Type</th>
                                    <td>{plate.plate_type || dash}</td>
                                </tr>
                                <tr>
                                    <th style={{ paddingRight: "0.5rem", fontWeight: 600 }}>Vendor</th>
                                    <td>{plate.vendor || dash}</td>
                                </tr>
                                <tr>
                                    <th style={{ paddingRight: "0.5rem", fontWeight: 600 }}>Cold storage</th>
                                    <td>{plate.cold_storage || dash}</td>
                                </tr>
                                <tr>
                                    <th style={{ paddingRight: "0.5rem", fontWeight: 600 }}>Location</th>
                                    <td>{plate.location || dash}</td>
                                </tr>
                                <tr>
                                    <th style={{ paddingRight: "0.5rem", fontWeight: 600 }}>Description</th>
                                    <td>{plate.description || dash}</td>
                                </tr>
                            </tbody>
                        </table>
                    ) : null}
                </div>
            </button>
        </div>
    )
}
