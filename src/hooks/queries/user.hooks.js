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


async function getPublicUsers_API({ tokenString }) {
    
    const res = await axios.get('/api/users/public',
      {
          headers: {
              "Authorization": `Bearer ${tokenString}`,
              'Content-Type': 'application/json'
          }
        })
    return res.data.users
}

export const useGetPublicUserInfo = (APIParams = {}, useQueryOptions = {}) => {
    return useQuery(["getCollaboratorsPublic"],() =>  getPublicUsers_API({...APIParams}), useQueryOptions)
}


// get user roles


// get user registration information 
async function getUserRoles_API({ tokenString }) {
    const res = await axios.get('/api//users/roles',
        {
        headers: {
            "Authorization": `Bearer ${tokenString}`,
            'Content-Type': 'application/json'
        }
      })
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

async function postUser_API({ tokenString, userProps }) {
    const res = await axios.post('/api/users/user',
    userProps,
        {
            headers : {
                "Authorization": `Bearer ${tokenString}`,
                'Content-Type': 'application/json'
            }
        }
        )
}

export const usePostUser = (useMutationOptions = {}) => {
    return useMutation((APIParams) => postUser_API({...APIParams}), useMutationOptions)
}

// block user
async function postBlockUser_API({ tokenString, userProps }) {
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




