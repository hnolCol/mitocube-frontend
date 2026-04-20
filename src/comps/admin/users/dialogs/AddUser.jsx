import { useState } from "react";
import { MinimalTextInput } from "../../../core/input/MinimalTextInput";
import _ from "lodash"
import { api } from "@/api"; 
import { UserRoleSelection } from "../UserRoleSelection";

const USER_INPUT = [
    { type: "text", tag: "firstname", placeholder: "Enter user first name" },
    { type: "text", tag: "lastname", placeholder: "Enter user last name" },
    { type: "text", tag: "email", placeholder: "Enter user email" }]




function ResearchGroupOption({ tag }) {
    const { data: rg } = api.researchgroups.useGetResearchGroupByTag(
        { tag },
        { enabled: _.isString(tag) && tag.length > 0 }
    );
    return <option value={tag}>{rg?.text || tag}</option>;
}

export function AddUserDialog({onCancel}) {


    const { mutate: postUser, isLoading } = api.users.modify.usePostUser()

    const { data: researchGroups = [] } = api.researchgroups.useGetResearchGroups()
    const [formData, setFormData] = useState({firstname : "", lastname : "", email : "", research_group : "", institute : "", role : 1})
    const disabledButton = !_.isString(formData.firstname) || formData.firstname.length === 0 || !_.isString(formData.lastname) || formData.lastname.length === 0 || !_.isString(formData.email) || formData.email.length === 0 || !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) 
    
    /**
     * Handles the insertion of a new user
     * @param {MouseEvent} e 
     */
    const handleInsert = (e) => {
        e.preventDefault()
        postUser(formData)
    }
    
    const handleRoleChange = (role_tag) => {
        setFormData(prevValues => { return {...prevValues, role: _.toNumber(role_tag)} })
    }

    return (
        <div className="margin--medium padding--medium">
            <h3>Add User Dialog</h3>

            <div className="flex flex-column margin-bottom--little margin--medium">
                {USER_INPUT.map((input) => (
                    <div key={input.tag}>
                        <input
                            value={formData[input.tag]}
                            onChange={(e) =>
                                setFormData((prevValues) => ({
                                    ...prevValues,
                                    [input.tag]: e.target.value,
                                }))
                            }
                            className="text-input"
                            type="text"
                            placeholder={input.placeholder}
                        />
                    </div>
                ))}
                    <div className="margin-top--little">
                        <select
                            className="text-input"
                            style={{
                                width: "100%",
                                cursor: "pointer",
                                color: formData.research_group ? "inherit" : "#999",
                            }}
                            value={formData.research_group}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    research_group: e.target.value,
                                }))
                            }
                        >
                            <option value="" disabled hidden>Select research group</option>
                            <option value="">None</option>
                            {researchGroups.map((tag) => (
                                <ResearchGroupOption key={tag} tag={tag} />
                            ))}
                        </select>
                    </div>
                <div className="font-size--small color--grey">
                    A verification email will be sent to the user containing a randomly created password.
                </div>
                <h4>User role</h4>
                <UserRoleSelection selectedRole={formData.role} onRoleChange={handleRoleChange} />


                <div className="flex justify-end margin-top--medium">
                    <button
                        disabled={isLoading}
                        className="dialog-button"
                        type="button"
                        onClick={(e) => {
                            e.preventDefault()
                            onCancel()
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        disabled = {disabledButton}
                        className={`dialog-button bg--blue-light ${disabledButton ? "opacity--disabled" : ""}`}
                        type="button"
                        onClick={handleInsert}
                    >
                        {isLoading ? "Inserting..." : "Insert"}
                    </button>
                </div>
            </div>
        </div>
    );
}   