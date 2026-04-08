import { useState } from "react";
import _ from "lodash"; 
import hooks from "@mitocube/api-hooks"
import { EditSparepartDialog } from "./AddSparepartDialog";
import { DeleteSparepartDialog } from "./DeleteSparepartDialog";
import { SparepartText } from "./sparepartText";
import { SparepartDescription } from "./SparepartDescription";
import { SparepartCompany } from "./SparepartCompany";
import { SparepartProductID } from "./SparepartProductID";
import { SparepartPrice } from "./SparepartPrice";
import { SparepartLink } from "./SparepartLink";

export function SparepartItem({ tag, showDetails = false, updateSparepartList }) {

    const [ isOpen, setIsOpen ] = useState(false);  
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [update, setUpdate] = useState(undefined);
    
    const { data: permissions, isSuccess } = hooks.maintenance.sparepartpermissions.useGetSparepartPermissions();
    // console.log(permissions)

    const { mutate: deleteSparepart } = hooks.maintenance.spareparts.useDeleteSparePart({
        onSuccess: () => {
            setIsDeleteOpen(true);
        },
    });
  
    const canShowRemoveButton = isSuccess && permissions.delete
    //   console.log(canShowRemoveButton)

      const handleRemove = (e) => {
        e.stopPropagation();
        deleteSparepart({ tag });
      };
      
    

      const handleEditClose = () => {
        setUpdate(Date.now())
        setIsOpen()
    }

    const handleDeleteDialogClose = () => {
        setIsDeleteOpen(false);
        updateSparepartList();
        
      }

    return (
        <div className="flex flex-column padding--medium" style={{ width: "100%" }}>


            <EditSparepartDialog isOpen={isOpen} onClose={() => handleEditClose()} tag = {tag}/>
            <DeleteSparepartDialog isOpen={isDeleteOpen} onClose={handleDeleteDialogClose} />

            <div
            className="flex justify-space-between align-center"
            style={{ width: "100%" }}
            >
            
            
            <SparepartText tag={tag} update={update} />
            <div className="flex gap--small align-center" style={{ gap: "0.4rem" }}>
                <button onClick={() => setIsOpen(true)} className="basic-button ">
                    Edit
                </button>

                {canShowRemoveButton && (
                    <button onClick={handleRemove} className="basic-button">
                        Delete
                    </button>
                )}
            </div>

            </div>
           

            {showDetails ? (
            <table
                style={{
                width: "fit-content",
                fontSize: "0.75rem",
                textAlign: "left",
                marginTop: "0.25rem",
                }}
            >
            <tbody>
            <tr>
                <th style={{ paddingRight: "0.5rem", fontWeight: 600 }}>Description</th>
                <td><SparepartDescription tag={tag} update={update} /></td>
            </tr>

            <tr>
                <th style={{ paddingRight: "0.5rem", fontWeight: 600 }}>Company</th>
                <td><SparepartCompany tag={tag} update={update} /></td>
            </tr>

            <tr>
                <th style={{ paddingRight: "0.5rem", fontWeight: 600 }}>Product ID</th>
                <td><SparepartProductID tag={tag} update={update} /></td>
            </tr>

            <tr>
                <th style={{ paddingRight: "0.5rem", fontWeight: 600 }}>Price</th>
                <td><SparepartPrice tag={tag} update={update} /></td>
            </tr>

            <tr>
                <th style={{ paddingRight: "0.5rem", fontWeight: 600 }}>Link</th>
                <td><SparepartLink tag={tag} update={update} /></td>
            </tr>
            </tbody>
        </table>

            ) : null}
        </div>
    );
}

