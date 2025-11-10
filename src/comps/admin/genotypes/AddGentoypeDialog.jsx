import { Dialog, DialogBody } from "@blueprintjs/core";
import { InsertGenotype } from "../../core/genotype/InsertGenotype";

export function AddGenotypeDialog({ isOpen, onClose }) {
    

    return (
        <Dialog isOpen ={isOpen} title="Add Genotype" onClose={onClose} style={{ width: "min(950px,85vw)", height: "min(80vh, 1200px)" }} canOutsideClickClose={false}>
            <div className="padding--medium" style={{ height: "95%" }}>
                <div style={{ height: "100%", width : "95%"}}>
                    <InsertGenotype onClose={onClose}/>
                </div>
            </div>
        </Dialog>
    )
}