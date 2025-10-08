import { Button, ButtonGroup, Tab, Tabs } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import PasswordInput from "../../input/Password";
import { useGetUserAttributes, usePatchUser, usePostPasswordChange } from "../../../../hooks/queries/user.hooks";
import APIError from "../../error/APIerror";
import _ from "lodash"
import { UserAttributeSelection } from "./UserAttributeSelection";


function PWChangeUser({ }) {
    const [password, setPassword] = useState(undefined)
    const [infoText, setInfoText] = useState("")
    const { mutate, isLoading, isError, error } = usePostPasswordChange()

 
    const handlePasswordChange = () => {
        if (_.isString(password)) {
            const updated_pw = { password }
            mutate({ updated_pw }, {
                onSuccess: (data) => {
                    setInfoText("Password successfully changed.")
                }
            })
            setPassword(undefined)
        }
    }

    const handleStringChange = (key,pwString) => {
        if (pwString !== password) setPassword(pwString)
        if (infoText !== "") setInfoText("")
    }

    return (
        <div>
            <h4>Change password</h4>
            <p>Please enter the old and new password.</p>
            <p>A minimum length of 8 characters is required.</p>
            <div className="padding--little margin-bottom--little">
                <PasswordInput onChange={handleStringChange} hint="New password" disabled={isLoading} />
            </div>
            {infoText.length > 0 ? <h4>{infoText}</h4>: null}
            {isError ? <APIError error={error} /> : null}

            <ButtonGroup>
                <Button icon="changes" text="Save" disabled={!_.isString(password)} intent="primary" loading={isLoading} onClick={handlePasswordChange}/>
            </ButtonGroup>
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