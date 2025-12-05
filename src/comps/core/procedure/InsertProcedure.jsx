import hooks from "@mitocube/api-hooks";
import { useEffect, useState } from "react";
import _ from "lodash";
import APIError from "../error/APIerror";

const INITIAL_PROCEDURE = { tag: "", text: "", description: "", priority: "500" };

/**
 * Insert / Edit procedure
 */
export function InsertEditProcedure({ 
    onClose,
    isEditing = false,
    procedure_tag,
    preText = "",
    preDescription = "",
    prepriority = "",
}) {
    
   
    const [procedure, setProcedure] = useState(INITIAL_PROCEDURE);
    const {mutate : postProcedure, isLoading, isError, error, isSuccess } = hooks.maintenance.procedures.usePostMaintenanceProcedure({
        onSuccess: () => {
            setProcedure(INITIAL_PROCEDURE);
        },
    });
    const { mutate : updateProcedure, isLoading : isUpdateLoading } = hooks.maintenance.procedures.useEditMaintenanceProcedure()


    useEffect(() => {
        if (isEditing) {
            setProcedure({
                text: preText,
                description: preDescription,
                priority: prepriority
            });
        }
    }, [isEditing, preText, preDescription, prepriority]);
    

 
    const insertProcedure = () => {

        const data = {
            text: procedure.text,
            description: procedure.description,
            priority: procedure.priority
        };

        postProcedure(data, {
            onSuccess: () => {
                setProcedure(INITIAL_PROCEDURE);
                onClose(true);
                
            },
            onError: (err) => {
                console.error("Failed to insert procedure", err)
            }
        });
    };


    const editProcedure = () => {
        const data = {
            tag: procedure_tag,
            text: procedure.text,
            description: procedure.description,
            priority: procedure.priority
        };
        updateProcedure(data, {
            onSuccess: () => onClose(),
            onError: (err) => {
                console.error("Failed to edit procedure", err)
            }
        });
    };



    return (
        <div className="flex flex-column div--expand margin--medium padding--medium" style={{ gap: "0.4rem" }}>
            <h3>{isEditing ? "Procedure Editing" : "Procedure Insertion"}</h3>
            <span>Procedures are a set of instructions for performing maintenance tasks on instruments.</span>

            <div className="flex flex-column" style={{ gap: "0.5rem" }}>
                <input className="text-input" type="text" value={procedure.text} placeholder="Enter procedure text" onChange={(e) => setProcedure((prev) => ({ ...prev, text: e.target.value }))} />
                <input className="text-input" type="text" value={procedure.description} placeholder="Enter procedure description" onChange={(e) => setProcedure((prev) => ({ ...prev, description: e.target.value }))} />
                <input className="number-input" type="number" value={procedure.priority} placeholder="Enter procedure priority" onChange={(e) => setProcedure((prev) => ({ ...prev, priority: e.target.value }))} />
            </div>

  
            <div className="margin--medium"> {isSuccess && !isEditing ? (<h3 style={{ color: "#68a063" }}>Procedure inserted successfully!</h3>) : null}
            </div>{isError ? <APIError error={error} /> : null}


            <div className="div--expand flex flex-column" style={{ justifyContent: "space-between" }}>
            <div className="flex justify-end" style={{ gap: "1rem" }}>
                <button className="dialog-button" style={{ backgroundColor: "#ec7160ff" }} onClick={onClose}>Close</button>
                {isEditing ? 
                    <button className="dialog-button" disabled={isUpdateLoading} onClick={editProcedure}>{isUpdateLoading ? "Editing..." : "Edit"}</button> : 
                    <button className="dialog-button" disabled={isLoading} onClick={insertProcedure}>{isLoading ? "Inserting..." : "Insert"}</button> }
                </div>
            </div>
        </div>
    );
}
