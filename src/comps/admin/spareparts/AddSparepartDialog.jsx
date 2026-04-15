import { InsertEditSparePart } from "../../core/sparepart/InsertSparepart";
import { api } from "@/api";
import _ from "lodash";
import { Dialog } from "@blueprintjs/core";

export function AddSparepartDialog({ isOpen, onClose }) {

    return (
        <Dialog isOpen={isOpen} title="Add Sparepart" onClose={onClose} style={{ width: "min(600px,85vw)", height: "min(70vh, 900px)" }} canOutsideClickClose={false}>
            <div className="padding--medium" style={{ height: "95%" }}>
                <div style={{ height: "100%", width: "95%" }}>
                    <InsertEditSparePart onClose={onClose} />
                </div>
            </div>
        </Dialog>
    );
}

export function EditSparepartDialog({ isOpen, onClose, tag }) {

    const {data: sparepart, isSuccess : isSparepartSuccess} = api.maintenance.spareparts.querySpareParts.useGetSparePartByTag({tag : tag}, { enabled : _.isString(tag) && isOpen})    
    
    return (
        <Dialog  isOpen={isOpen} title="Edit Sparepart" onClose={onClose} style={{ width: "min(600px,85vw)", height: "min(70vh, 900px)" }} canOutsideClickClose={false}>
            <div className="padding--medium" style={{ height: "95%" }}>
                <div style={{ height: "100%", width: "95%" }}>
                    {isSparepartSuccess ? (
                        <InsertEditSparePart
                            isEditing={true}
                            tag={tag}
                            preText={sparepart.text}
                            preDescription={sparepart.description}
                            preCompany={sparepart.company}
                            preProduct_id={sparepart.product_id}
                            prePrice={sparepart.price}
                            preLink={sparepart.link}
                            onClose={onClose}
                        />
                    ) : null}
                </div>
            </div>
        </Dialog>
    );
}

