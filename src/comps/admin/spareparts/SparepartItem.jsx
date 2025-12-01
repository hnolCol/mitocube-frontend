import { useState } from "react";
import { EditSparepartDialog } from "./AddSparepartDialog";
import _ from "lodash"; 
import hooks from "@mitocube/api-hooks"
import { SparepartText } from "./SparepartText";
import { SparepartDescription } from "./SparepartDescription";
import { SparepartCompany } from "./SparepartCompany";
import { SparepartProductID } from "./SparepartProductID";
import { SparepartPrice } from "./SparepartPrice";
import { SparepartLink } from "./SparepartLink";

export function SparepartItem({ tag, showDetails = false }) {

    const [ isOpen, setIsOpen ] = useState(false);  
    const [update, setUpdate] = useState(undefined)
    const { data: permissions, isSuccess } = hooks.maintenance.sparepartpermissions.useGetSparepartPermissions({ tag });

    const { mutate: deleteSparepart } = hooks.maintenance.spareparts.useDeleteSparePart();

    const handleRemove = (e) => {
        e.stopPropagation();
        deleteSparepart({ tag : tag});
      };
      const canShowRemoveButton = isSuccess && permissions.delete
      console.log(canShowRemoveButton)

    const handleEditClose = () => {
        setUpdate(Date.now())
        setIsOpen()
      }

    return (
        <div className="flex flex-column padding--medium" style={{ width: "100%" }}>


            <EditSparepartDialog isOpen={isOpen} onClose={() => handleEditClose()} tag = {tag}/>
            <div
            className="flex justify-space-between align-center"
            style={{ width: "100%" }}
            >

            
            <SparepartText tag={tag} update={update} />
            <div className="flex gap--small align-center" style={{ gap: "0.4rem" }}>
                <button onClick={() => setIsOpen(true)} className="button--link font-size--smallest">
                    Edit
                </button>

                {canShowRemoveButton && (
                    <button onClick={handleRemove} className="button--link font-size--smallest">
                        Delete
                    </button>
                )}
            </div>

            </div>
           

            {showDetails ? (
            <div
                className="flex flex-column font-size--smallest margin-left--little"
                style={{ color: "#555", gap: "0.4rem" }}
            >
                <SparepartDescription tag={tag} update={update} />
                <SparepartCompany tag={tag} update={update} />
                <SparepartProductID tag={tag} update={update} />
                <SparepartPrice tag={tag} update={update} />
                <SparepartLink tag={tag} update={update} />
            </div>
            ) : null}
        </div>
    );
}