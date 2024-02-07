import { useMutation, useQuery } from "react-query";
import axios from "axios"


// get users

async function getUsers_API({ tokenString }) {
    const res = await axios.get('/api/users/full',
      {
          headers: {
              "Authorization": `Bearer ${tokenString}`,
              'Content-Type': 'application/json'
          }
        })
    return res.data
}

export const useGetUsers = (APIParams = {}, useQueryOptions = {}) => {
    return useQuery(["getUsers"],() =>  getUsers_API({...APIParams}), useQueryOptions)
}

/**
 * @description Returns the public information about the users. Still requires a valid token string. Public indicates here that it is available to all registered users. 
 * @returns {import("../../types/users").PublicUser[]} The public information about the users in the database as an array.
 */
async function getPublicUsers_API() {
    const res = await axios.get('/api/users/public')
    return res.data.users
}

export const useGetPublicUserInfo = (APIParams = {}, useQueryOptions = {staleTime: Infinity}) => {
    return useQuery(["getPublicUserInfo"],() =>  getPublicUsers_API({...APIParams}), useQueryOptions)
}




//query user


/**
 * @description Returns the public information about the users. Still requires a valid token string. Public indicates here that it is available to all registered users. 
 * @returns {import("../../types/users").PublicUser[]} The public information about the users in the database as an array.
 */
async function getPublicUsersByQuery_API({ query }) {
    const res = await axios.get('/api/users/q', {params : {query}})
    return res.data
}

export const useGetPublicUserByQuery = (APIParams = {}, useQueryOptions = {staleTime: Infinity}) => {
    return useQuery(["getPublicUserInfoQuery",APIParams.query],() =>   getPublicUsersByQuery_API({...APIParams}), useQueryOptions)
}



// get user roles


// get user registration information 
async function getUserRoles_API({ }) {
    const res = await axios.get('/api/users/roles')
    return res.data.roles
}

export const useGetUserRoles = (APIParams = {}, useQueryOptions = {}) => {
    return useQuery(["getUserRoles"], () => getUserRoles_API({...APIParams}), useQueryOptions)
}


// get user registration information 
async function getUserAttributes_API({}) {
    const res = await axios.get('/api/attributes/user')
    return res.data 
}

export const useGetUserAttributes = (APIParams = {}, useQueryOptions = {}) => {
    return useQuery(["getUserAttributes"], () => getUserAttributes_API({...APIParams}), useQueryOptions)
}

async function postUser_API({ userProps }) {
    const res = await axios.post('/api/users',
    userProps
        )
}

export const usePostUser = (useMutationOptions = {}) => {
    return useMutation((APIParams) => postUser_API({...APIParams}), useMutationOptions)
}

// block user
async function postChangePasswordUser_API({ updated_pw }) {
    const res = await axios.post('/api/users/pw',
    updated_pw,
        )
}

export const usePostPasswordChange = (useMutationOptions = {}) => {
    return useMutation((APIParams) => postChangePasswordUser_API({...APIParams}), useMutationOptions)
}




// block user
async function postBlockUser_API({ userProps }) {
    const res = await axios.post('/api/users/user/block',
    userProps,
        )
}

export const usePostBlockUser = (useMutationOptions = {}) => {
    return useMutation((APIParams) => postBlockUser_API({...APIParams}), useMutationOptions)
}



// delete user
async function deleteUser_API({ userProps }) {
    const res = await axios.delete('/api/users/'+userProps.label,
    userProps,
        )
}

export const useDeleteUser = (useMutationOptions = {}) => {
    return useMutation((APIParams) => deleteUser_API({...APIParams}), useMutationOptions)
}


// patch user details

async function patchUser_API({ tokenString, userProps }) {
    const res = await axios.patch('/api/users/user',
    userProps,
        {
            headers : {
                "Authorization": `Bearer ${tokenString}`,
                'Content-Type': 'application/json'
            }
        })
}

export const usePatchUser = (useMutationOptions = {}) => {
    return useMutation((APIParams) => patchUser_API({...APIParams}), useMutationOptions)
}




