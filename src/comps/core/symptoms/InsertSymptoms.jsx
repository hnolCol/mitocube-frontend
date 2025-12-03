import hooks from "@mitocube/api-hooks";
import { useEffect, useState } from "react";
import _ from "lodash";
import APIError from "../error/APIerror";

const INITIAL_SYMPTOM = { tag: "", text: "", description: "", priority: "500" };

/**
 * Insert / Edit Symptom Component
 */
export function InsertEditSymptom({ 
    onClose,
    isEditing = false,
    tag,
    preText = "",
    preDescription = "",
    prepriority = "",
}) {
    
    const [symptom, setSymptom] = useState(INITIAL_SYMPTOM);
    const {mutate : postSymptom, isLoading, isError, error, isSuccess } = hooks.maintenance.symptoms.usePostSymptom({
        onSuccess: () => {
            setSymptom(INITIAL_SYMPTOM);
        },
    });
    const { mutate : updateSymptom, isLoading : isUpdateLoading } = hooks.maintenance.symptoms.useEditSymptom()


    useEffect(() => {
        if (isEditing) {
            setSymptom({
                text: preText,
                description: preDescription,
                priority: prepriority
            });
        }
    }, [isEditing, preText, preDescription, prepriority]);
    

 
    const insertSymptom = () => {

        const data = {
            text: symptom.text,
            description: symptom.description,
            priority: symptom.priority
        };

        postSymptom(data, {
            onSuccess: () => {
                setSymptom(INITIAL_SYMPTOM);
                onClose(true);
                
            },
            onError: (err) => {
                console.error("Failed to insert symptom", err)
            }
        });
    };


    const editSymptom = () => {
        const data = {
            tag,
            text: symptom.text,
            description: symptom.description,
            priority: symptom.priority
        };

        updateSymptom(data, {
            onSuccess: () => onClose(),
            onError: (err) => {
                console.error("Failed to edit symptom", err)
            }
        });
    };



    return (
        <div className="flex flex-column div--expand margin--medium padding--medium" style={{ gap: "0.4rem" }}>
            <h3>{isEditing ? "Symptom Editing" : "Symptom Insertion"}</h3>
            <span>Symptoms describe issues or problems that instruments can have.</span>

            <div className="flex flex-column" style={{ gap: "0.5rem" }}>
                <input className="text-input" type="text" value={symptom.text} placeholder="Enter symptom text" onChange={(e) => setSymptom((prev) => ({ ...prev, text: e.target.value }))} />
                <input className="text-input" type="text" value={symptom.description} placeholder="Enter symptom description" onChange={(e) => setSymptom((prev) => ({ ...prev, description: e.target.value }))} />
                <input className="number-input" type="number" value={symptom.priority} placeholder="Enter symptom priority" onChange={(e) => setSymptom((prev) => ({ ...prev, priority: e.target.value }))} />
            </div>

  
            <div className="margin--medium"> {isSuccess && !isEditing ? (<h3 style={{ color: "#68a063" }}>Symptom inserted successfully!</h3>) : null}
            </div>{isError ? <APIError error={error} /> : null}


            <div className="div--expand flex flex-column" style={{ justifyContent: "space-between" }}>
            <div className="flex justify-end" style={{ gap: "1rem" }}>
                <button className="dialog-button" style={{ backgroundColor: "#ec7160ff" }} onClick={onClose}>Close</button>
                {isEditing ? 
                    <button className="dialog-button" disabled={isUpdateLoading} onClick={editSymptom}>{isUpdateLoading ? "Editing..." : "Edit"}</button> : 
                    <button className="dialog-button" disabled={isLoading} onClick={insertSymptom}>{isLoading ? "Inserting..." : "Insert"}</button> }
                </div>
            </div>
        </div>
    );
}
