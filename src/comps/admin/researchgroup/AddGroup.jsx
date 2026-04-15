import { Button, Dialog, DialogBody, DialogFooter } from "@blueprintjs/core";
import { useState } from "react";
import _ from "lodash"
import { titleFormat } from "@/services/format/string";

import { api } from "@/api"

const research_group_input = ["text","abbreviation","institute","profile_text","address","email","url"]
export function AddResearchGroupDialog({ isOpen, onClose }) {
    
    const { mutate, isPending, isError, error } = api.researchgroups.usePostResearchGroup()
    const [researchGroup, setResearchGroup] = useState()
    
    const onChange = (key,value) => {
        setResearchGroup(prevValues => {return{...prevValues,[key] : value}})
    }

    const handleAdd = () => {

        _.forEach(research_group_input, inputKey => {
            if (!_.has(researchGroup, inputKey) || !_.isString(researchGroup[inputKey]) || researchGroup[inputKey].length === 0) {
                alert(`Please enter a valid ${titleFormat(inputKey)}.`)
                return
            }
        })  
        mutate(researchGroup, {onSuccess : () => {
            alert("Research group added successfully.")
            onClose()
        }})
    }
 
    return <Dialog
        isOpen={isOpen}
        canEscapeKeyClose={true}
        canOutsideClickClose={false}
        shouldReturnFocusOnClose={true}
        onClose={onClose}>
        
        <DialogBody>
            <h3>Define research group.</h3>
            <span>Fill details for the new research group.</span>
            <span>Users can be added after creation.</span>
            {research_group_input.map(text_input => {
                return <input className="text-input"
                    type="text"
                    value={_.has(researchGroup, text_input) && _.isString(researchGroup[text_input]) ? researchGroup[text_input] : ""}
                    placeholder={`Enter ${titleFormat(text_input)}`}
                onChange = {(e) => onChange(text_input, e.target.value)} />
                    
                    
            })}
        </DialogBody>
        <DialogFooter>
            <button className="dialog-button" disabled={isPending} onClick={handleAdd}>{isPending ? "Adding..." : "Add"}</button>
            <button className="dialog-button" onClick={onClose}>Close</button>
            <div>{isError && `An error occurred while adding the research group: ${error.message}. Make sure the email is valid.`}</div>
        </DialogFooter>
    </Dialog>
}