import { useRef, useState } from "react"
import { AddButton } from "@/comps/core/base/buttons/AddButton"
import { AddExternalResourceDialog } from "./AddExternalResourceDialog"
import { ExternalResourceSearch } from "./ExternalResourceSearch"

export function AdminExternalResources() {
    const [dialogProps, setDialogProps] = useState({ isOpen: false })
    const refetchRef = useRef(null)

    return (
        <div className="div--expand padding--medium flex-column--full-height">
            <div className="flex flex-column margin--medium padding--medium gap--medium-small">
                <h3>Crosslink Resources</h3>
                <div className="flex">
                    <AddExternalResourceDialog
                        isOpen={dialogProps.isOpen}
                        onClose={(success) => {
                            setDialogProps(prev => ({ ...prev, isOpen: false }))
                            if (success && refetchRef.current) refetchRef.current()
                        }}
                    />
                    <AddButton onSelect={() => setDialogProps({ isOpen: true })} />
                </div>
                <div className="div--expand padding--medium">
                    <ExternalResourceSearch refetchRef={refetchRef} />
                </div>
            </div>
        </div>
    )
}