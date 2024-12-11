import { Button, Dialog, DialogBody, DialogFooter } from "@blueprintjs/core";
import TextInput from "../../core/input/Text";
import { useState } from "react";
import _ from "lodash"
import { usePostResearchGroup } from "../../../hooks/queries/researchgroup.hooks";


const research_group_input = ["name","abbreviation","institute","profile_text","address","email","url"]
export function AddResearchGroupDialog({ isOpen, onClose }) {
    
    const { mutate, isLoading } = usePostResearchGroup()
    const [researchGroup, setResearchGroup] = useState()
    
    const onChange = (key,value) => {
        setResearchGroup(prevValues => {return{...prevValues,[key] : value}})
    }
 
    return <Dialog
        isOpen={isOpen}
        canEscapeKeyClose={true}
        canOutsideClickClose={false}
        shouldReturnFocusOnClose={true}
        onClose={onClose}>
        
        <DialogBody>
            <h3>Define a research institute.</h3>
            {research_group_input.map(text_input => {
                return <TextInput
                    hint={text_input}
                    callbackKey={text_input}
                    value={_.has(researchGroup, text_input) && _.isString(researchGroup[text_input]) ? researchGroup[text_input] : ""}
                    onChange={onChange} />
            })}
        </DialogBody>
        <DialogFooter>
            <Button text="Add" loading={isLoading} onClick={() => mutate(researchGroup, {onSuccess : () => onClose()})}/>
            <Button text="Close" onClick={onClose}/>
        </DialogFooter>
    </Dialog>
}