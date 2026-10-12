import { Dialog, DialogBody, DialogFooter } from "@blueprintjs/core";
import { useState } from "react";
import _ from "lodash";
import { titleFormat } from "@/services/format/string";
import { api } from "@/api";

const consortium_input = ["text", "abbreviation", "email", "profile_text", "url"]

/**
 * @description Dialog to define a new consortium.
 * @param {Object} props
 * @param {Boolean} props.isOpen
 * @param {Function} props.onClose
 * @returns {JSX.Element} The add consortium dialog.
 */
export function AddConsortiumDialog({ isOpen, onClose }) {
    const { mutate, isPending, isError, error } = api.consortiums.usePostConsortium()
    const [consortium, setConsortium] = useState()

    const onChange = (key, value) => {
        setConsortium(prevValues => { return { ...prevValues, [key]: value } })
    }

    const handleAdd = () => {
        _.forEach(consortium_input, inputKey => {
            if (!_.has(consortium, inputKey) || !_.isString(consortium[inputKey]) || consortium[inputKey].length === 0) {
                alert(`Please enter a valid ${titleFormat(inputKey)}.`)
                return
            }
        })
        mutate({ consortium }, { onSuccess: () => { alert("Consortium added successfully."); onClose() } })
    }

    return <Dialog
        isOpen={isOpen}
        canEscapeKeyClose={true}
        canOutsideClickClose={false}
        shouldReturnFocusOnClose={true}
        onClose={onClose}>

        <DialogBody>
            <h3>Define consortium.</h3>
            <span>Fill details for the new consortium.</span>
            <span>Research groups (users) can be added after creation.</span>
            {consortium_input.map(text_input => {
                return <input className="text-input"
                    type="text"
                    key={text_input}
                    value={_.has(consortium, text_input) && _.isString(consortium[text_input]) ? consortium[text_input] : ""}
                    placeholder={`Enter ${titleFormat(text_input)}`}
                    onChange={(e) => onChange(text_input, e.target.value)} />
            })}
        </DialogBody>
        <DialogFooter>
            <button className="dialog-button" disabled={isPending} onClick={handleAdd}>{isPending ? "Adding..." : "Add"}</button>
            <button className="dialog-button" onClick={onClose}>Close</button>
            <div>{isError && `An error occurred while adding the consortium: ${error.message}. Make sure the email is valid.`}</div>
        </DialogFooter>
    </Dialog>
}
