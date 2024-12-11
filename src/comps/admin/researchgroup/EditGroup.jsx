import { Button, Dialog, DialogBody, DialogFooter } from "@blueprintjs/core";
import { useGetResearchGroupByTag, usePatchResearchGroup } from "../../../hooks/queries/researchgroup.hooks";
import APIError from "../../core/error/APIerror";
import { useEffect, useState } from "react";
import _ from "lodash"

export function EditResearchGroupDialog({ tag, isOpen, onClose }) {

    const [edit, setEdit] = useState({})
    const { data : researchGroup, isLoading, isFetched, isSuccess, isError, error } = useGetResearchGroupByTag({tag})
    const { mutate, isLoading : pathIsLoading, isError : patchIsError, error : patchError } = usePatchResearchGroup()


    useEffect(() => {
        if (!isSuccess) return 
        if (_.isEmpty(edit)) {
            setEdit(researchGroup)
        }

    }, [isSuccess])

    const handleUpdate = () => {

        mutate({
            tag,
            ...edit
        })

    }


    return <Dialog isOpen={isOpen} onClose={onClose} canEscapeKeyClose canOutsideClickClose>
        <DialogBody>
        <h2>Edit Research Group</h2>
            {
                isError ? <APIError error={error} /> : 

                    <div>Bum</div>
                    
            }
            

        </DialogBody>
        <DialogFooter>
            <Button text = "Edit" icon="edit" onClick={handleUpdate}/>
            <Button text = "Cancel" onClick={onClose} />
        </DialogFooter>
    </Dialog>
}