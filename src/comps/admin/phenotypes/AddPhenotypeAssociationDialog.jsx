import { Dialog } from "@blueprintjs/core"
import { InsertPhenotypeAssociation } from "./InsertPhenotypeAssociation"

export function AddPhenotypeAssociationDialog({ isOpen, onClose }) {
    return (
        <Dialog
            isOpen={isOpen}
            title="Add Phenotype Association"
            onClose={() => onClose(false)}
            style={{ width: "min(750px, 85vw)", height: "min(85vh, 1000px)", display: "flex", flexDirection: "column" }}
            canOutsideClickClose={false}
        >
            <div style={{
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                overflowX: "hidden",
                padding: "20px 24px 24px 24px"
            }}>
                <InsertPhenotypeAssociation onClose={(success) => onClose(success)} />
            </div>
        </Dialog>
    )
}