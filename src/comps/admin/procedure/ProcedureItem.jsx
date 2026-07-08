import { api } from "@/api"
import { EditProcedureDialog } from "./AddProcedureDialog";
import { DeleteProcedureDialog } from "./DeleteProcedureDialog";
import _ from "lodash"; 
import { useState } from "react";
import { ProcedureText } from "./ProcedureText";
import { ProcedureDescription } from "./ProcedureDescription";
import { ProcedurePriority } from "./ProcedurePriority";



export function ProcedureItem({ procedure_tag, showDetails = false, updateProcedureList }) {

    const [ isOpen, setIsOpen ] = useState(false);  
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [update, setUpdate] = useState(undefined);

    const { data: permissions, isSuccess } = api.maintenance.procedures.queryMaintenanceProcedures.useGetProcedurePermissions();
    const { mutate: deleteProcedure } = api.maintenance.procedures.modifyMaintenanceProcedures.useDeleteMaintenanceProcedure({
        onSuccess: () => {
            setIsDeleteOpen(true); 
          },
    });
    
    const canShowRemoveButton = isSuccess && permissions.delete
    const handleRemove = (e) => {
        e.stopPropagation();
        deleteProcedure({ procedure_tag});
    };



    const handleEditClose = () => {
        setUpdate(Date.now())
        setIsOpen()
      }

    const handleDeleteDialogClose = () => {
        setIsDeleteOpen(false);
        updateProcedureList();
        
      }

    return (
        <div className="flex flex-column padding--medium" style={{ width: "100%" }}>


            <EditProcedureDialog isOpen={isOpen} onClose={() => handleEditClose()} procedure_tag = {procedure_tag}/>
            <DeleteProcedureDialog isOpen={isDeleteOpen} onClose={handleDeleteDialogClose}/>
            
            <div
            className="flex justify-space-between align-center"
            style={{ wixdth: "100%" }}
            >

            
            <ProcedureText procedure_tag={procedure_tag} update={update} />

            <div className="flex gap--small align-center" style={{ gap: "0.4rem" }}>
            {permissions?.edit && (
                <button onClick={() => setIsOpen(true)} className="basic-button ">
                    Edit
                </button>)}


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
                <td><ProcedureDescription procedure_tag={procedure_tag} update={update} /></td>
            </tr>

            <tr>
                <th style={{ paddingRight: "0.5rem", fontWeight: 600 }}>Priority</th>
                <td><ProcedurePriority procedure_tag={procedure_tag} update={update} /></td>
            </tr>
            </tbody>
        </table>

            ) : null}
        </div>
    );
}