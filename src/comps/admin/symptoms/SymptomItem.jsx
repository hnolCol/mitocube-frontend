import hooks from "@mitocube/api-hooks";
import { Button } from "@blueprintjs/core";
import { useState } from "react";
import { EditSymptomDialog } from "./AddSymptomsDialog";
import _ from "lodash"; 
import { SymptomText } from "./SymptomText";
import { SymptomDescription } from "./SymptomDescription";
import { SymptomPriority } from "./SymptomPriority";

export function SymptomsItem({ tag, showDetails = false }) {

    const [ isOpen, setIsOpen ] = useState(false);  
    const [update, setUpdate] = useState(undefined)

    const handleEditClose = () => {
        setUpdate(Date.now())
        setIsOpen(false)
      }

    return (
        <div className="flex flex-column padding--medium" style={{ width: "100%" }}>


            <EditSymptomDialog isOpen={isOpen} onClose={() => handleEditClose()} tag = {tag}/>
            <div
            className="flex justify-space-between align-center"
            style={{ width: "100%" }}
            >

            
            <SymptomText tag={tag} update={update} />
            <button onClick={() => setIsOpen(true)} className="basic-button font-size--smallest">
                Edit
            </button>
            </div>
           

            {showDetails ? (
            <div
                className="flex flex-column font-size--smallest margin-left--little"
                style={{ color: "#555", gap: "0.4rem" }}
            >
                <SymptomDescription tag={tag} update={update} />
                <SymptomPriority tag={tag} update={update} />
            </div>
            ) : null}
        </div>
    );
}