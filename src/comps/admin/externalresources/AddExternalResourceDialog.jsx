import { Dialog } from "@blueprintjs/core"
import { InsertExternalResource } from "./InsertExternalResource"

export function AddExternalResourceDialog({ isOpen, onClose }) {
    return (
        <Dialog
            isOpen={isOpen}
            title="Add External Resource"
            onClose={onClose}
            style={{ width: "min(950px,85vw)", height: "min(85vh, 1200px)", display: "flex", flexDirection: "column" }}
            canOutsideClickClose={false}
        >
            <div style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden", padding: "20px 24px 24px 24px" }}>
                <InsertExternalResource onClose={(success, tag) => onClose(success, tag)} />
            </div>
        </Dialog>
    )
}