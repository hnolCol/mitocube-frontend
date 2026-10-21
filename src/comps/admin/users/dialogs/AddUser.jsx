import { useEffect, useState } from "react";
import _ from "lodash"
import { api } from "@/api";
import { UserRoleSelection } from "../UserRoleSelection";
import { ResearchGroupInput } from "@/comps/core/input/api/ResearchGroupInput";

const USER_INPUT = [
    { type: "text", tag: "firstname", placeholder: "Enter user first name" },
    { type: "text", tag: "lastname", placeholder: "Enter user last name" },
    { type: "text", tag: "email", placeholder: "Enter user email" }]

/**
 * @description Dialog to create a new user. Group curators (role 2) can only
 * create users for their own research groups and cannot assign a role above
 * their own; curators and admins are not restricted.
 * @param {Object} props
 * @param {import("../../../../types/authentication").AuthenticationStatus} props.authenticationStatus - Authentication status of the current user.
 * @param {Function} props.onCancel - Called when the dialog is cancelled.
 * @param {Function} props.onCreated - Called after the user was created successfully.
 * @returns {JSX.Element} The add user dialog.
 */
export function AddUserDialog({ authenticationStatus, onCancel, onCreated }) {
    const { mutate: postUser, isPending } = api.users.create.usePostUser({ onSuccess: () => { if (_.isFunction(onCreated)) onCreated() } })
    const [formData, setFormData] = useState({ firstname : "", lastname : "", email : "", research_group_tags : [], institute : "", role : 1})
    const userRole = _.toNumber(_.get(authenticationStatus, "role"))
    const isGroupCurator = userRole === 2

    const { data: ownUser } = api.users.core.useGetPublicUserByTag(
        { tag: authenticationStatus?.tag },
        { enabled: isGroupCurator && _.isString(authenticationStatus?.tag) }
    )
    const ownResearchGroupTags = _.isArray(ownUser?.research_group_tags) ? ownUser.research_group_tags : []

    useEffect(() => {
        if (isGroupCurator && ownResearchGroupTags.length > 0) {
            setFormData(prevValues => {
                if (_.isEqual(prevValues.research_group_tags, ownResearchGroupTags)) return prevValues
                return { ...prevValues, research_group_tags: ownResearchGroupTags }
            })
        }
    }, [isGroupCurator, ownResearchGroupTags])

    const disabledButton = !_.isString(formData.firstname) || formData.firstname.length === 0 || !_.isString(formData.lastname) || formData.lastname.length === 0 || !_.isString(formData.email) || formData.email.length === 0 || !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) || !_.isArray(formData.research_group_tags) || formData.research_group_tags.length === 0

    const handleInsert = (e) => {
        e.preventDefault()
        postUser(formData)
    }

    const handleRoleChange = (role_tag) => {
        setFormData(prevValues => { return {...prevValues, role: _.toNumber(role_tag)} })
    }

    const handleSelectResearchGroup = (tag) => setFormData((prev) => ({
        ...prev,
        research_group_tags: prev.research_group_tags.includes(tag)
            ? prev.research_group_tags.filter(t => t !== tag)
            : [...prev.research_group_tags, tag]
    }))
    return (
        <div className="margin--medium padding--medium">
            <h3>Add User </h3>
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
                <div style={{width : "100%"}}>
                    {isGroupCurator ? (
                        <div className="padding--little font-size--small">
                            <span className="color--grey">Research group(s): </span>
                            {ownResearchGroupTags.length > 0
                                ? <strong>{ownResearchGroupTags.join(", ")}</strong>
                                : <span>loading ...</span>}
                            <div className="font-size--smallest color--grey">
                                As a group curator you can only create users for your own research group(s).
                            </div>
                        </div>
                    ) : (
                        <ResearchGroupInput
                            selected_rg_tags={formData.research_group_tags}
                            onSelect={handleSelectResearchGroup}
                            placeholder={_.isArray(formData.research_group_tags) && formData.research_group_tags.length > 0 ? `${formData.research_group_tags.length} Research Group(s) Selected` :  "Select Research Group(s)"}
                        />
                    )}
                    {_.isArray(formData.research_group_tags) && formData.research_group_tags.length > 0 && !isGroupCurator ?
                        <div className="font-size--smallest margin-top--little">{formData.research_group_tags.join(", ")}</div> : null}
                </div>

                <div className="font-size--small color--grey">
                    A verification email will be sent to the user containing a randomly created password.
                </div>
                <h4>User role</h4>
                <UserRoleSelection selectedRole={formData.role} onRoleChange={handleRoleChange} maxRole={isGroupCurator ? userRole : undefined} />
                <div className="flex justify-end margin-top--medium">
                    <button
                        disabled={isPending}
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
                        disabled={disabledButton || isPending}
                        className={`dialog-button bg--blue-light ${disabledButton ? "opacity--disabled" : ""}`}
                        type="button"
                        onClick={handleInsert}
                    >
                        {isPending ? "Inserting..." : "Insert"}
                    </button>
                </div>
            </div>
        </div>
    );
}
