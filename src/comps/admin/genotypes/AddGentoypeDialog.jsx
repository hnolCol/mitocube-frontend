import { Dialog, DialogBody } from "@blueprintjs/core";
import { InsertGenotype } from "../../core/genotype/InsertGenotype";
import hooks from "@mitocube/api-hooks";
import _ from "lodash";

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


export function EditGenotypeDialog({ isOpen, onClose, tag }) { 

    const { data : selected_traits, isSuccess} = hooks.genotypes.condition_applications.useGetGenotypeConditionApplicationsData({tag}, { enabled : _.isString(tag) && isOpen})
    console.log(selected_traits)
return <Dialog isOpen ={isOpen} title="Edit Genotype" onClose={onClose} style={{ width: "min(950px,85vw)", height: "min(80vh, 1200px)" }} canOutsideClickClose={false}>
            <div className="padding--medium" style={{ height: "95%" }}>
                <div style={{ height: "100%", width : "95%"}}>
                   {isSuccess && _.isArray(selected_traits) ?
                    <InsertGenotype isEditing={true} tag={tag} preSelectedTraits={selected_traits} onClose={onClose} /> : null }
                </div>
            </div>
        </Dialog>

}