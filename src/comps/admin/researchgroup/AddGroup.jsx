import { Button, Dialog, DialogBody, DialogFooter } from "@blueprintjs/core";
import { useState } from "react";
import _ from "lodash"
import { titleFormat } from "@/services/format/string";
import { UserInput } from "@/comps/core/input/api/UserInput"

import { api } from "@/api"

const research_group_input = ["text","abbreviation","institute","profile_text","address","email","url"]
const research_group_required_input = ["text","abbreviation","institute","address","email"]

export function AddResearchGroupDialog({ isOpen, onClose }) {
    
    const { mutate, isPending, isError, error } = api.researchgroups.usePostResearchGroup()
    const { mutate: postResearchGroupUsers, isPending: addUsersIsPending } = api.researchgroups.usePostResearchGroupUsers()
    const { mutate: postResearchGroupHead, isPending: addHeadIsPending } = api.researchgroups.usePostResearchGroupHead()
    const [researchGroup, setResearchGroup] = useState()
    const [piUserTag, setPiUserTag] = useState(undefined)
    const { refetch: findResearchGroupTags } = api.researchgroups.useGetResearchGroupsByQuery(
        { search_string: researchGroup?.text, limit: 200 },
        { enabled: false }
    )
    
    const onChange = (key,value) => {
        setResearchGroup(prevValues => {return{...prevValues,[key] : value}}) 
    }

    /**
     * @description Resolves the tag of the newly created research group by searching for its
     * exact text. The tag is only returned if the match is unambiguous.
     * @returns {Promise<String|undefined>} The research group tag.
     */
    const resolveResearchGroupTag = async () => {
        const { data: research_group_tags } = await findResearchGroupTags()
        if (!_.isArray(research_group_tags) || research_group_tags.length !== 1) return undefined
        return research_group_tags[0]
    }

    /**
     * @description Adds the selected PI (head) to the newly created research group. The user is
     * first added as a member (required by the backend) and then made a head (PI).
     * @param {String} tag Research group tag
     * @returns {Promise} Resolves when the PI was added or no PI was selected.
     */
    const addPIOnCreation = (tag) => {
        if (!_.isString(piUserTag) || piUserTag.length === 0) return Promise.resolve()
        return new Promise((resolve, reject) => {
            postResearchGroupUsers({ tag, user_tags: [piUserTag] }, {
                onSuccess: () => postResearchGroupHead({ tag, user_tag: piUserTag }, { onSuccess: resolve, onError: reject }),
                onError: reject
            })
        })
    }

    const handleAdd = () => {
        const invalidInput = _.find(research_group_required_input, inputKey => !_.has(researchGroup, inputKey) || !_.isString(researchGroup[inputKey]) || researchGroup[inputKey].length === 0)
        if (_.isString(invalidInput)) {
            alert(`Please enter a valid ${titleFormat(invalidInput)}.`)
            return
        }  
        mutate(researchGroup, {onSuccess : async () => {
            try {
                const tag = await resolveResearchGroupTag()
                if (_.isString(tag)) {
                    await addPIOnCreation(tag)
                    alert("Research group added successfully.")
                } else {
                    alert("Research group added successfully. The PI could not be set automatically because the research group tag could not be resolved unambiguously. Please set the PI via Edit.")
                }
            } catch (piError) {
                alert(`Research group added, but the PI could not be set: ${piError.message}. Please set the PI via Edit.`)
            }
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
                    key={text_input}
                    value={_.has(researchGroup, text_input) && _.isString(researchGroup[text_input]) ? researchGroup[text_input] : ""}
                    placeholder={`Enter ${titleFormat(text_input)}`}
                onChange = {(e) => onChange(text_input, e.target.value)} />   
                                                    
            })}
            <UserInput
                label="Principal Investigator (PI)"
                helperText="Optional. The selected user is added as member and head (PI) of the new research group."
                showIsRequired={false}
                showLabel={true}
                selected_users={_.isString(piUserTag) ? [piUserTag] : []}
                onUserSelect={(key, user_tag) => {
                    setPiUserTag(prevValue => prevValue === user_tag ? undefined : user_tag)
                }} />
        </DialogBody>
        <DialogFooter>
            <button className="dialog-button" disabled={isPending || addUsersIsPending || addHeadIsPending} onClick={handleAdd}>{isPending || addUsersIsPending || addHeadIsPending ? "Adding..." : "Add"}</button>
            <button className="dialog-button" onClick={onClose}>Close</button>
            <div>{isError && `An error occurred while adding the research group: ${error.message}. Make sure the email is valid.`}</div>
        </DialogFooter>
    </Dialog>
}
