import { Dialog, DialogBody } from "@blueprintjs/core";
import { InsertEditGenotype } from "../../core/genotype/InsertGenotype";
import hooks from "@mitocube/api-hooks";
import _ from "lodash";

export function AddGenotypeDialog({ isOpen, onClose }) {
    

    return (
        <Dialog isOpen ={isOpen} title="Add Genotype" onClose={onClose} style={{ width: "min(950px,85vw)", height: "min(80vh, 1200px)" }} canOutsideClickClose={false}>
            <div className="padding--medium" style={{ height: "95%" }}>
                <div style={{ height: "100%", width : "95%"}}>
                    <InsertEditGenotype onClose={onClose}/>
                </div>
            </div>
        </Dialog>
    )
}


export function EditGenotypeDialog({ isOpen, onClose, tag }) { 

    const { data : selected_traits, isSuccess} = hooks.genotypes.condition_applications.useGetGenotypeConditionApplicationsData({tag}, { enabled : _.isString(tag) && isOpen})
    console.log(selected_traits)
    const {data: text, isSuccess : isSuccessText} = hooks.genotypes.useGetGenotypeText({genotype_tag : tag}, { enabled : _.isString(tag) && isOpen}) // to
    const {data : description, isSuccess : isSuccessDescription} = hooks.genotypes.useGetGenotypeDescription({genotype_tag : tag}, { enabled : _.isString(tag) && isOpen}) // to

return <Dialog isOpen ={isOpen} title="Edit Genotype" onClose={onClose} style={{ width: "min(950px,85vw)", height: "min(92vh, 1500px)" }} canOutsideClickClose={false}>
            <div className="padding--medium" style={{ height: "95%" }}>
                <div style={{ height: "100%", width : "95%"}}>
                   {isSuccess && isSuccessText && isSuccessDescription && _.isArray(selected_traits) ?
                    <InsertEditGenotype isEditing={true} tag={tag} preSelectedTraits={selected_traits}  preText={text} preDescription={description} onClose={onClose} /> : null }
                </div>
            </div>
        </Dialog>

}