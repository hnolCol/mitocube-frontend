
import _ from "lodash"
import { useState } from "react"
import { AddButton } from "../../core/base/buttons/AddButton"
import { AddGenotypeDialog } from "./AddGentoypeDialog"
import { GenotypeSearch } from "./GenotypeSearch"
import { Alert } from "@blueprintjs/core"

export function AdminGenotypes() {
    const [dialogProps, setDialogProps] = useState({ isOpen: false })
    const [refreshKey, setRefreshKey] = useState(0)
    const [alertProps, setAlertProps] = useState({ isOpen: false })

    return (
        <div
            className="div--expand padding--medium"
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                minHeight: 0,
            }}
        ><div className="flex flex-column margin--medium padding--medium" style={{ gap: "0.4rem" }}>
        <h3>Genotypes</h3>
        <div className="flex">
        <Alert
                isOpen={alertProps.isOpen}
                intent="success"
                confirmButtonText="OK"
                onConfirm={() => setAlertProps({ isOpen: false })}
                onClose={() => setAlertProps({ isOpen: false })}
            >
                <p>Genotype created successfully.</p>
            </Alert>
            <AddGenotypeDialog
                isOpen={dialogProps.isOpen}
                onClose={(success) => {
                    setDialogProps(prev => ({ ...prev, isOpen: false }))
                    setRefreshKey(k => k + 1)
                    if (success) setAlertProps({ isOpen: true })
                }}
            />
                <AddButton onSelect={() => setDialogProps(prevValues => ({ ...prevValues, isOpen: true }))} />
                    
            </div>
                <div className="div--expand padding--medium">
                <GenotypeSearch key={refreshKey} />
                </div>

             </div>
        </div>
    )
}
