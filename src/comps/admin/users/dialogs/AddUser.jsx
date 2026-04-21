import { useState } from "react";
import _ from "lodash"
import { api } from "@/api"; 
import { UserRoleSelection } from "../UserRoleSelection";
import { ResearchGroupInput } from "@/comps/core/input/api/ResearchGroupInput";

const USER_INPUT = [
    { type: "text", tag: "firstname", placeholder: "Enter user first name" },
    { type: "text", tag: "lastname", placeholder: "Enter user last name" },
    { type: "text", tag: "email", placeholder: "Enter user email" }]

export function AddUserDialog({onCancel}) {
    const { mutate: postUser, isLoading } = api.users.modify.usePostUser()
    const [formData, setFormData] = useState({firstname : "", lastname : "", email : "", research_group : "", institute : "", role : 1})
    const disabledButton = !_.isString(formData.firstname) || formData.firstname.length === 0 || !_.isString(formData.lastname) || formData.lastname.length === 0 || !_.isString(formData.email) || formData.email.length === 0 || !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) 

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

                <ResearchGroupInput
                    selected_rg_tags={formData.research_group ? [formData.research_group] : []}
                    onSelect={(tag) => setFormData((prev) => ({ ...prev, research_group: tag }))}
                />

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
                        disabled={disabledButton}
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