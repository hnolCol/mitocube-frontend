import { useDeleteUser, useGetUserAttributes, useGetUserRoles, useGetUsers, usePatchUser, usePostBlockUser, usePostUser } from "../../hooks/queries/user.hooks"
import _ from "lodash"
import { User } from "../core/base/user"
import Loading from "../core/base/loading"
import APIError from "../core/error/APIerror"
import { useEffect, useMemo, useState } from "react"
import TextInput from "../core/input/Text"
import { objectHasKey } from "../../services/objects/checks"
import { filterArrayBySearchString } from "../../services/arrays/filter"
import UserAttributes from "./users/UserAttributes"
import { Button, Dialog, DialogBody, DialogFooter } from "@blueprintjs/core"
import { UserAttributeSelection } from "../core/base/user/UserAttributeSelection"
import { ConfirmAlert } from "../core/overlay/ConfirmAlert"



function EditUserDialog({ authenticationStatus, user, isOpen = false, refetchUsers, onClose, ...rest }) {
    
    const [userProps, setUserProps] = useState({})
    const { data, isLoading, isFetching, isSuccess, isFetched, isError, error} = useGetUserAttributes()
    const {mutate : patchUser, isLoading : patchUserIsLoading, iserror : patchUserIsError, error : patchUserError} = usePatchUser()
    
    useEffect(() => {
        //this has to change, so prone for bugs ... 
        if (!isSuccess) return 
        if (!_.isObject(data)) return 
        if (!_.isArray(data.attributes)) return 
        let userProps = Object.fromEntries(data.attributes.map(attr => {
            const attrNameInUser = attr.tag.replace("att_user_","")
            return [attr.tag, user[attrNameInUser]]
        }))
        setUserProps(userProps)
    }, [isSuccess, user.label])

    const handleEdit = () => {
        let userPropsToUpdate = { ...userProps, label: user.label }
        console.log(userPropsToUpdate)
        patchUser({ tokenString: authenticationStatus.token, userProps : userPropsToUpdate }, {
            onSuccess: (data) => {
                refetchUsers()
                onClose()
        }})
    }

    // const updateUserProps = (attributeTag, attributeValue) => {
    //     //update
    //     setUserProps(prevValues => {return {...prevValues,[attributeTag] : attributeValue}})
    // }


    return (
        <Dialog {...{ isOpen, onClose }} canOutsideClickClose={true} canEscapeKeyClose={false} title="Edit user" {...rest}>
            <DialogBody>
                {_.isObject(data) ? <UserAttributeSelection {...{ attributes: data.attributes, attributeValues: data.attributeValues, userProps, setUserProps}} /> : null}
                {isError || patchUserIsError ? <APIError error={isError ? error : patchUserError} /> : null}
                {/* <div className="margin--little">
                {_.isObject(data)  ? <UserAttributes {...{ userProps, updateUserProps, attributes: data.attributes, attributeValues: data.attribute_values}} /> : null}
                {isError || patchUserIsError ? <APIError error={isError ? error : patchUserError} /> : null}
                </div> */}
        </DialogBody>
        <DialogFooter
            actions={<Button text="Edit"
                intent="primary"
                onClick={handleEdit}
                loading={patchUserIsLoading}
                disabled={_.isObject(data) && isSuccess && _.isArray(data.attributes)?!Object.keys(userProps).length >= data.attributes.length:true} />} />
        </Dialog>
    )
}


function AddUserDialog({ authenticationStatus, isOpen = false, refetchUsers, onClose, ...rest }) {
    const [userProps, setUserProps] = useState({})
    //put this in a common dialog? 
    // const {data : userRoles} = useGetUserRoles({tokenString : authenticationStatus.token}, { staleTime : 3000000})
    const { data, isLoading, isFetching, isSuccess, isFetched, isError, error} = useGetUserAttributes({ tokenString: authenticationStatus.token })
    const { mutate: postUser, isLoading: postUserIsLoading, isError: postUserIsError, error: postUserError } = usePostUser()
    
    const handleSubmit = () => {
        postUser({ tokenString: authenticationStatus.token, userProps }, {
            onSuccess: (data) => {
                setUserProps({})
                refetchUsers()
                onClose()
        }})
    }

    const updateUserProps = (attributeTag, attributeValue) => {
        setUserProps(prevValues => {return{...prevValues, [attributeTag] : attributeValue}})
    }

    return(
        <Dialog {...{ isOpen, onClose }} canOutsideClickClose={true} canEscapeKeyClose={false} title="Add user" {...rest}>
            <DialogBody>
                <p>A auto-generated password will be sent to the provided email adress (please note that not all domains might be allowed).</p>
                {isSuccess && _.isObject(data) ? <UserAttributes {...{ userProps, updateUserProps, attributes: data.attributes, attributeValues: data.attribute_values }} /> : null}
                {isError || postUserError ? <APIError error={isError ? error : postUserError} /> : null}
                
        </DialogBody>
        <DialogFooter
            actions={<Button text="Submit"
                intent="primary"
                onClick={handleSubmit}
                loading={postUserIsLoading}
                disabled={isSuccess && _.isObject(data) && _.isArray(data.attributes)?Object.keys(userProps).length !== data.attributes.length:true} />} />
        </Dialog>
    )
}


function AdminUsers({ authenticationStatus }) {
    const [query, setQuery] = useState()
    
    const [confirmAlertProps, setConfirmAlertProps] = useState({
        isOpen: false,
        text: "Please confirm that you would like to delete the selected user.",
        onCancel: () => {},
        onConfirm: undefined, cancelButtonText: "Cancel"
    })

    const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
    const [editUserDialog, setEditUserDialog] = useState({isOpen : false, user : {}})
    const { mutate: blockUserByLabel } = usePostBlockUser()
    const { mutate : deleteUserByLabel} = useDeleteUser()
    const {
        data,
        isError,
        error,
        isSuccess,
        isLoading,
        isFetching, refetch : refetchUsers } = useGetUsers({ tokenString: authenticationStatus.token })
    
    
    const closeAlert = () => {
        setConfirmAlertProps(prevValues => { return { ...prevValues, isOpen: false } })
    }
    
    const blockUser = (user_label) => {
        setConfirmAlertProps(prevValues => {
            return {
                isOpen: true,
                text : `Please confirm blocking the user (${user_label})`,
                onClose: closeAlert,
                onCancel: closeAlert,
                onConfirm: () =>  blockUserByLabel({userProps : {label : user_label}}, {onSuccess : () => refetchUsers()})
            }})}

    const editUser = (user) => {
        setEditUserDialog({isOpen : true, user})
    }

    const deleteUser = (user_label) => {
        setConfirmAlertProps(prevValues => {
            return {
                isOpen: true,
                text : `Please confirm delete the user (${user_label})`,
                onClose: closeAlert,
                onCancel: closeAlert,
                onConfirm: () =>  deleteUserByLabel({ userProps: { label: user_label } }, { onSuccess: () => refetchUsers() })
            }})}

    const userMatchingQuery = useMemo(() => {
        if (!_.isObject(data) || !objectHasKey({object : data, keyName : "users"})) return []
        if (query === "") return data.users
        else {
            return filterArrayBySearchString({array : data.users, searchString : query, searchColumns : ["firstname","lastname","institute","research_group","email"]})
        }
    },[query, isLoading, isSuccess, isFetching])
    
    if (isError) return<APIError error={error} /> 
    if (isLoading || isFetching) return <Loading />
    return (
        <div className="intent-margin-top--little padding--medium" >
            <ConfirmAlert {...confirmAlertProps} />
            {isError ? <APIError error={error} /> : isLoading || isFetching ? <Loading /> :
                <div>
                    <AddUserDialog isOpen={isUserDialogOpen} {...{ authenticationStatus, refetchUsers }} onClose={() => setIsUserDialogOpen(false)} />
                    <EditUserDialog {...{ ...editUserDialog }} {...{ authenticationStatus, refetchUsers }} onClose={() => setEditUserDialog({ isOpen: false, user: {} })} />
                    <Button icon="plus" onClick={() => setIsUserDialogOpen(true)} />
                    <TextInput placeholder="Search user" callbackKey={"query"} onChange={(callbackKey, value) => setQuery(value)} />
                    {isSuccess && _.isArray(userMatchingQuery) ?
                        userMatchingQuery.map(user => <User key={user.label} {...user} userRoles={data.roles} {...{ blockUser, editUser, userProps: user, deleteUser }} />) : null}
                </div>}
                </div>
            
    )
}

export default AdminUsers