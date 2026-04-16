import { Button, Callout, Divider, InputGroup, Tab, Tabs } from "@blueprintjs/core";
import { useState } from "react";
import PasswordInput from "../../input/Password";
import { useGetUserAttributes, usePatchUser, usePostPasswordChange } from "../../../../hooks/queries/user.hooks";
import APIError from "../../error/APIerror";
import _ from "lodash"
import { UserAttributeSelection } from "./UserAttributeSelection";
import { ButtonGroup } from "@blueprintjs/core";

function PWChangeUser({ onSuccess }) {
    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState(undefined)
    const [showOld, setShowOld] = useState(false)
    const [infoText, setInfoText] = useState("")
    const { mutate, isPending, isError, error } = usePostPasswordChange()

    const hasOld = oldPassword.length > 0
    const hasNew = _.isString(newPassword) && newPassword.length >= 8
    const isDifferent = oldPassword !== newPassword
    const isValid = hasOld && hasNew && isDifferent

    const errorMessage = isError
        ? (error?.response?.data?.detail || "Current password is incorrect.")
        : null

    const handlePasswordChange = () => {
        if (!isValid) return
        setInfoText("")
        mutate({ updated_pw: { old_password: oldPassword, password: newPassword } }, {
            onSuccess: () => {
                setInfoText("Password successfully changed.")
                setOldPassword("")
                setNewPassword(undefined)
                if (_.isFunction(onSuccess)) {
                    setTimeout(() => onSuccess(), 1200)
                }
            }
        })
    }

    const handleOldChange = (e) => {
        setOldPassword(e.target.value)
        if (infoText !== "") setInfoText("")
    }

    const handleNewChange = (key, pwString) => {
        if (pwString !== newPassword) setNewPassword(pwString)
        if (infoText !== "") setInfoText("")
    }

    return (
        <div style={{ padding: "8px 4px" }}>
            <div style={{ marginBottom: 20 }}>
                <h4 style={{ margin: "0 0 4px 0" }}>Change password</h4>
                <p style={{ margin: 0, color: "#5c7080", fontSize: 13 }}>
                    Enter your current password, then choose a new one.
                </p>
            </div>

            <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#5c7080", marginBottom: 10 }}>
                    Current password
                </label>
                <InputGroup
                    type={showOld ? "text" : "password"}
                    placeholder="Enter your current password"
                    value={oldPassword}
                    onChange={handleOldChange}
                    disabled={isPending}
                    intent={errorMessage ? "danger" : "none"}
                    rightElement={
                        <Button
                            icon={showOld ? "eye-off" : "eye-open"}
                            minimal
                            onClick={() => setShowOld(!showOld)}
                        />
                    }
                />
                {errorMessage && (
                    <div style={{ color: "#c23030", fontSize: 12, marginTop: 4 }}>
                        {errorMessage}
                    </div>
                )}
            </div>

            <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#5c7080", marginBottom: 0 }}>
                    New password
                </label>
                <div style={{ marginTop: -8 }}>
                    <PasswordInput
                        onChange={handleNewChange}
                        hint=""
                        disabled={isPending}
                        placeholder="Enter a new password (min. 8 characters)"
                    />
                </div>
            </div>

            {hasOld && hasNew && !isDifferent && (
                <Callout intent="warning" style={{ marginBottom: 12 }}>
                    New password must be different from your current password.
                </Callout>
            )}

            {infoText.length > 0 && (
                <Callout intent="success" icon="tick" style={{ marginBottom: 12 }}>
                    {infoText}
                </Callout>
            )}

            <Divider style={{ margin: "16px 0" }} />

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                    icon="changes"
                    text="Save password"
                    disabled={!isValid}
                    intent="primary"
                    loading={isPending}
                    onClick={handlePasswordChange}
                />
            </div>
        </div>
    )
}

function EditAffiliation({ }) {
    
    const [userProps, setUserProps] = useState({})
    const { data, isLoading, isFetching, isSuccess, isFetched, isError, error } = useGetUserAttributes({},{staleTime:30000000})
    const {mutate : patchUser, isLoading : patchUserIsLoading, iserror : patchUserIsError, error : patchUserError} = usePatchUser()
    return (
        <div>
            <h4>Change affiliation</h4>
            <p>Please adapt the affiliation to your needs.</p>
        
            {_.isObject(data) ? <UserAttributeSelection {...{ attributes: data.attributes, attributeValues: data.attribute_values, userProps, setUserProps }} /> : null}
                {isError || patchUserIsError ? <APIError error={isError ? error : patchUserError} /> : null}
            <ButtonGroup>
                <Button text="Submit" />
            </ButtonGroup>
        </div>
    )
}


export function EditUser({userLabel}) {
    const [tabID,setTabID] = useState("change_pw")
    return (
        <Tabs selectedTabId={tabID} onChange={(newTabID, oldTabID) => setTabID(newTabID)}>
            <Tab id="change_pw" title="Change password" panel={<PWChangeUser />} />
            <Tab id="change_affiliation" title="Affiliation" panel={<EditAffiliation />}/>
        </Tabs>
    )
}
