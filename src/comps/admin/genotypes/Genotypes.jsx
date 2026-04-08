
import _ from "lodash"
import { useState } from "react"
import { AddButton } from "../../core/base/buttons/AddButton"
import { AddGenotypeDialog } from "./AddGentoypeDialog"
import { GenotypeSearch } from "./GenotypeSearch"

export function AdminGenotypes() {
    const [dialogProps, setDialogProps] = useState({ isOpen: false })
    const [refreshKey, setRefreshKey] = useState(0)

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
        
            <AddGenotypeDialog
                isOpen={dialogProps.isOpen}
                onClose={() => {
                    setDialogProps(prevValues => ({ ...prevValues, isOpen: false }))
                    setRefreshKey(k => k + 1)
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