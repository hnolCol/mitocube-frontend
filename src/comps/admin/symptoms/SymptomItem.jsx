import hooks from "@mitocube/api-hooks";
import { EditSymptomDialog } from "./AddSymptomsDialog";
import { DeleteSymptomDialog } from "./DeleteSymptomDialog";
import _ from "lodash"; 
import { useState } from "react";
import { SymptomText } from "./SymptomText";
import { SymptomDescription } from "./SymptomDescription";
import { SymptomPriority } from "./SymptomPriority";




export function SymptomsItem({ tag, showDetails = false, updateSymptomList }) {

    const [ isOpen, setIsOpen ] = useState(false);  
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [update, setUpdate] = useState(undefined);

    const { data: permissions, isSuccess } = hooks.maintenance.symptomspermissions.useGetSymptomsPermissions();
    
    const { mutate: deleteSymptom } = hooks.maintenance.symptoms.useDeleteSymptom({
        onSuccess: () => {
            setIsDeleteOpen(true); 
          },
    });
    
    const canShowRemoveButton = isSuccess && permissions.delete
    // console.log(canShowRemoveButton)

    const handleRemove = (e) => {
        e.stopPropagation();
        deleteSymptom({ tag});
    };



    const handleEditClose = () => {
        setUpdate(Date.now())
        setIsOpen()
      }

    const handleDeleteDialogClose = () => {
        setIsDeleteOpen(false);
        updateSymptomList();
        
      }

    return (
        <div className="flex flex-column padding--medium" style={{ width: "100%" }}>


            <EditSymptomDialog isOpen={isOpen} onClose={() => handleEditClose()} tag = {tag}/>
            <DeleteSymptomDialog isOpen={isDeleteOpen} onClose={handleDeleteDialogClose} />
            
            <div
            className="flex justify-space-between align-center"
            style={{ wixdth: "100%" }}
            >

            
            <SymptomText tag={tag} update={update} />
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
                <td><SymptomDescription tag={tag} update={update} /></td>
            </tr>

            <tr>
                <th style={{ paddingRight: "0.5rem", fontWeight: 600 }}>Priority</th>
                <td><SymptomPriority tag={tag} update={update} /></td>
            </tr>
            </tbody>
        </table>

            ) : null}
        </div>
    );
}