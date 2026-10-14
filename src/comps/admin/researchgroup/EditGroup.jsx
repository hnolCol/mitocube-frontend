import { Dialog, DialogBody, DialogFooter } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import _ from "lodash";
import { api } from "@/api";
import APIError from "../../core/error/APIerror";
import { Loading } from "../../core/base/states/Loading";

const research_group_input = ["text", "abbreviation", "institute", "profile_text", "address", "email", "url"]

/**
 * @description Dialog to edit the details of a research group and to define its PI (head).
 * @param {Object} props
 * @param {String} props.tag Research group tag
 * @param {Boolean} props.isOpen
 * @param {Function} props.onClose
 * @returns {JSX.Element} The edit research group dialog.
 */
export function EditResearchGroupDialog({ tag, isOpen, onClose }) {
    const [edit, setEdit] = useState(undefined)
    const { data: researchGroup, isLoading, isSuccess, isError, error } = api.researchgroups.useGetResearchGroupByTag({ tag }, { enabled: _.isString(tag) && isOpen })
    const { mutate: patchResearchGroup, isPending: patchIsPending, isError: patchIsError, error: patchError } = api.researchgroups.usePatchResearchGroup()

    useEffect(() => {
        if (!isSuccess) return
        setEdit(_.pick(researchGroup, research_group_input))
    }, [isSuccess])

    const onChange = (key, value) => {
        setEdit(prevValues => { return { ...prevValues, [key]: value } })
    }

    const handleUpdate = () => {
        patchResearchGroup({ tag, ...edit }, { onSuccess: () => onClose() })
    }

    return <Dialog isOpen={isOpen} onClose={onClose} canEscapeKeyClose canOutsideClickClose title="Edit Research Group">
        <DialogBody>
            <h3>Edit research group details.</h3>
            <span>Update the details of the research group.</span>
            {isError ? <APIError error={error} /> :
                isLoading || !_.isObject(edit) ? <Loading /> :
                    <div className="flex flex-column" style={{ gap: "0.2rem" }}>
                        {research_group_input.map(text_input => {
                            return <input className="text-input"
                                type="text"
                                key={text_input}
                                value={_.isString(edit[text_input]) ? edit[text_input] : ""}
                                placeholder={`Enter ${text_input}`}
                                onChange={(e) => onChange(text_input, e.target.value)} />
                        })}
                    </div>}
        </DialogBody>
        <DialogFooter>
            <button className="dialog-button" disabled={patchIsPending || !_.isObject(edit)} onClick={handleUpdate}>{patchIsPending ? "Saving..." : "Save"}</button>
            <button className="dialog-button" onClick={onClose}>Close</button>
            <div>{patchIsError && `An error occurred while updating the research group: ${patchError.message}.`}</div>
        </DialogFooter>
    </Dialog>
}
