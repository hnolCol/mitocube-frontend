import { Dialog, DialogBody } from "@blueprintjs/core";
import { InsertEditGenotype } from "../../core/genotype/InsertGenotype";
import { api } from "@/api"
import _ from "lodash";

export function AddGenotypeDialog({ isOpen, onClose }) {
    

    return (
        <Dialog
            isOpen={isOpen}
            title="Add Genotype"
            onClose={onClose}
            style={{ width: "min(950px,85vw)", height: "min(85vh, 1200px)", display: "flex", flexDirection: "column" }}
            canOutsideClickClose={false}
        >
            <div
                style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    overflowX: "hidden",
                    padding: "20px 24px 24px 24px",
                }}
            >
                <InsertEditGenotype onClose={onClose} />
            </div>
        </Dialog>
    )
}


export function EditGenotypeDialog({ isOpen, onClose, tag }) { 

    const { data : selected_traits, isSuccess} = api.genotypes.queryConditionApplications.useGetGenotypeConditionApplicationsData({tag}, { enabled : _.isString(tag) && isOpen})
    const {data: text, isSuccess : isSuccessText} = api.genotypes.queryGenotypes.useGetGenotypeText({genotype_tag : tag}, { enabled : _.isString(tag) && isOpen}) // to
    const {data : description, isSuccess : isSuccessDescription} = api.genotypes.queryGenotypes.useGetGenotypeDescription({genotype_tag : tag}, { enabled : _.isString(tag) && isOpen}) // to

    return (
        <Dialog
            isOpen={isOpen}
            title="Edit Genotype"
            onClose={onClose}
            style={{ width: "min(950px,85vw)", height: "min(85vh, 1500px)", display: "flex", flexDirection: "column" }}
            canOutsideClickClose={false}
        >
            <div
                style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    overflowX: "hidden",
                    padding: "20px 24px 24px 24px",
                }}
            >
                {isSuccess && isSuccessText && isSuccessDescription && _.isArray(selected_traits) ? (
                    <InsertEditGenotype
                    isEditing={true}
                    tag={tag}
                    preSelectedTraits={selected_traits}
                    preText={text}
                    preDescription={description}
                    onClose={(success, newTag) => {
                        onClose(success, newTag)  
                    }}
                />
                ) : null}
            </div>
        </Dialog>
    )

}