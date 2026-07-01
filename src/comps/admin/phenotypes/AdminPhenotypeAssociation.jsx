import _ from "lodash"
import { useState } from "react"
import { api } from "@/api"
import { Alert } from "@blueprintjs/core"
import { AddButton } from "@/comps/core/base/buttons/AddButton"
import { AddPhenotypeAssociationDialog } from "./AddPhenotypeAssociationDialog"
import { PhenotypeAssociationSearch } from "./PhenotyoeAssociationSearch"

export function AdminPhenotypeAssociations() {
    const [dialogProps, setDialogProps] = useState({ isOpen: false })
    const [alertProps, setAlertProps] = useState({ isOpen: false })
    const [refreshKey, setRefreshKey] = useState(0)

    return (
        <div
            className="div--expand padding--medium"
            style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}
        >
            <div className="flex flex-column margin--medium padding--medium" style={{ gap: "0.4rem" }}>
                <h3>Phenotype Associations</h3>
                <div className="flex">
                    <Alert
                        isOpen={alertProps.isOpen}
                        intent="success"
                        confirmButtonText="OK"
                        onConfirm={() => setAlertProps({ isOpen: false })}
                        onClose={() => setAlertProps({ isOpen: false })}
                    >
                        <p>Phenotype association created successfully.</p>
                    </Alert>
                    <AddPhenotypeAssociationDialog
                        isOpen={dialogProps.isOpen}
                        onClose={(success) => {
                            setDialogProps(prev => ({ ...prev, isOpen: false }))
                            setRefreshKey(k => k + 1)
                            if (success) setAlertProps({ isOpen: true })
                        }}
                    />
                    <AddButton onSelect={() => setDialogProps(prev => ({ ...prev, isOpen: true }))} />
                </div>
                <div className="div--expand padding--medium">
                    <PhenotypeAssociationSearch key={refreshKey} />
                </div>
            </div>
        </div>
    )
}