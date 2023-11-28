import { Button, ButtonGroup, Tab, Tabs } from "@blueprintjs/core";
import { useState } from "react";
import PasswordInput from "../../input/Password";
import { useGetUserAttributes, usePatchUser } from "../../../../hooks/queries/user.hooks";
import APIError from "../../error/APIerror";
import _ from "lodash"
import { UserAttributeSelection } from "./UserAttributeSelection";


function PWChangeUser({ }) {
    
    return (
        <div>
            <h4>Change password</h4>
            <p>Please enter the old and new password.</p>
            <PasswordInput onChange={console.log} hint="New password" />
            <ButtonGroup>
                <Button text="Submit" />
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
    console.log(userLabel)
    return (
        <Tabs selectedTabId={tabID} onChange={(newTabID, oldTabID) => setTabID(newTabID)}>
            <Tab id="change_pw" title="Change password" panel={<PWChangeUser />} />
            <Tab id="change_affiliation" title="Affiliation" panel={<EditAffiliation />}/>
        </Tabs>
    )
}