import { Button, Callout, HTMLTable } from "@blueprintjs/core"
import { useState } from "react"
import { api } from "@/api"
import APIError from "../../core/error/APIerror"
import Loading from "../../core/base/loading"
import { CreatedAt } from "../../core/metrics/CreatedAt"
import { PlateCreateDialog } from "./PlateCreateDialog"

const dash = <span className="text--muted">–</span>

/**
 * @description Admin view to create and list the physical well plates in the lab.
 */
export function PlatesAdmin() {

    const [dialogOpen, setDialogOpen] = useState(false)
    const [warning, setWarning] = useState(null)

    const { data: plates, isLoading, isError, error, refetch } = api.plates.plates.useGetPlates()

    const { mutate: deletePlate, isError: deleteIsError, error: deleteError } =
        api.plates.plates.useDeletePlate({ onSuccess: () => refetch() })

    const handleDelete = (plate) => {
        if (plate.n_used_wells > 0) {
            setWarning(`Plate "${plate.name}" is being used in a runlist and cannot be deleted.`)
            return
        }
        setWarning(null)
        if (window.confirm(`Delete plate "${plate.name}"? This cannot be undone.`)) {
            deletePlate({ tag: plate.tag })
        }
    }

    return (
        <div className="padding--medium">
            <div className="flex center-items justify-space-between">
                <h2>Plates</h2>
                <Button icon="add" text="Create Plate" intent="primary" onClick={() => setDialogOpen(true)} />
            </div>
            <p>Plates are the physical well plates in the lab in which samples are stored.
                When creating a runlist, select the plate the samples are on.</p>

            {warning && (
                <Callout intent="warning" icon="warning-sign" style={{ marginBottom: "1rem" }}>
                    <div className="flex center-items justify-space-between">
                        <span>{warning}</span>
                        <Button minimal small icon="cross" onClick={() => setWarning(null)} />
                    </div>
                </Callout>
            )}
            {deleteIsError && <APIError error={deleteError} />}

            {isLoading ? <Loading /> :
                isError ? <APIError error={error} /> :
                    plates?.length > 0 ? (
                        <HTMLTable striped style={{ width: "100%" }}>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Format</th>
                                    <th>Type</th>
                                    <th>Vendor</th>
                                    <th>Cold storage</th>
                                    <th>Created by</th>
                                    <th>Created</th>
                                    <th />
                                </tr>
                            </thead>
                            <tbody>
                                {plates.map(plate => (
                                    <tr key={plate.tag}>
                                        <td><strong>{plate.name}</strong></td>
                                        <td>{plate.rows * plate.columns} wells ({plate.rows} × {plate.columns})</td>
                                        <td>{plate.plate_type || dash}</td>
                                        <td>{plate.vendor || dash}</td>
                                        <td>{plate.cold_storage || dash}</td>
                                        <td>{plate.created_by}</td>
                                        <td><CreatedAt createdat={plate.created_at} /></td>
                                        <td>
                                            <Button
                                                minimal
                                                icon="trash"
                                                intent="danger"
                                                title={plate.n_used_wells > 0 ? "In use in a runlist, cannot be deleted" : "Delete"}
                                                onClick={() => handleDelete(plate)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </HTMLTable>
                    ) : <p className="text--muted">No plates yet. Create one to get started.</p>}

            <PlateCreateDialog
                isOpen={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onCreated={() => refetch()}
            />
        </div>
    )
}