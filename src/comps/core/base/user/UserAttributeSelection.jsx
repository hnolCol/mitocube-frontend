import _ from "lodash"
import { useEffect } from "react"
import UserAttributes from "../../../admin/users/UserAttributes"
import { useGetUserAttributes } from "../../../../hooks/queries/user.hooks"
import APIError from "../../error/APIerror"




export function UserAttributeSelection({attributes, attributeValues, refetchUsers, userProps, setUserProps, ...rest }) {
    // const {mutate : patchUser, isLoading : patchUserIsLoading, iserror : patchUserIsError, error : patchUserError} = usePatchUser()

    
    const updateUserProps = (attributeTag, attributeValue) => {
        //update
        setUserProps(prevValues => {return {...prevValues,[attributeTag] : attributeValue}})
    }


    return (
                <div className="margin--little">
                <UserAttributes {...{ userProps, updateUserProps, attributes, attributeValues}} />
                </div>
    )
}

