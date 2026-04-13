import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios"
import _ from "lodash"


async function getUsers_API({limit}) {
    const res = await axios.get('/api/users', {params : {limit}})
    return res.data
}


export const useGetAllUserTags = (APIParams = { limit : 99999}, useQueryOptions = {}) => {
    return useQuery({
        queryKey: ["getUsersTags", APIParams.limit],
        queryFn: () => getUsers_API({...APIParams}),
        ...useQueryOptions
    })
}


async function getPublicUsers_API({ tags }) {
    const res = await axios.get('/api/users/public', {params : {tags}})
    return res.data
}

export const useGetPublicUserInfo = (APIParams = { tags: undefined }, useQueryOptions = { staleTime: Infinity }) => {
    const ts = APIParams.tags !== undefined ? APIParams.tags : ""
    return useQuery({
        queryKey: ["getPublicUserInfo", ts],
        queryFn: () => getPublicUsers_API({...APIParams}),
        staleTime: Infinity,
        ...useQueryOptions
    })
}


async function getPublicUsersByLabel_API({tag}) {
    const res = await axios.get('/api/users/'+tag)
    return res.data
}

export const useGetPublicUserByTag = (APIParams = {}, useQueryOptions = {staleTime: Infinity}) => {
    return useQuery({
        queryKey: ["getPublicUserByLabel", APIParams.tag],
        queryFn: () => getPublicUsersByLabel_API({...APIParams}),
        staleTime: Infinity,
        ...useQueryOptions
    })
}


async function getPublicUsersByQuery_API({ query, }) {
    const res = await axios.get('/api/users/q', {params : {query}})
    return res.data
}

export const useGetPublicUserByQuery = (APIParams = {}, useQueryOptions = {staleTime: 500000}) => {
    return useQuery({
        queryKey: ["getPublicUserInfoQuery", APIParams.query],
        queryFn: () => getPublicUsersByQuery_API({...APIParams}),
        staleTime: 500000,
        ...useQueryOptions
    })
}


async function getUserRoles_API({ }) {
    const res = await axios.get('/api/users/roles')
    return res.data.roles
}

export const useGetUserRoles = (APIParams = {}, useQueryOptions = {}) => {
    return useQuery({
        queryKey: ["getUserRoles"],
        queryFn: () => getUserRoles_API({...APIParams}),
        ...useQueryOptions
    })
}


async function getUserAttributes_API({}) {
    const res = await axios.get('/api/attributes/user')
    return res.data 
}

export const useGetUserAttributes = (APIParams = {}, useQueryOptions = {}) => {
    return useQuery({
        queryKey: ["getUserAttributes"],
        queryFn: () => getUserAttributes_API({...APIParams}),
        ...useQueryOptions
    })
}


async function postChangePasswordUser_API({ updated_pw }) {
    const res = await axios.post('/api/users/pw', updated_pw)
    return res.data
}

export const usePostPasswordChange = (useMutationOptions = {}) => {
    return useMutation({
        mutationFn: (APIParams) => postChangePasswordUser_API({...APIParams}),
        ...useMutationOptions
    })
}


async function patchUser_API({ tokenString, userProps }) {
    const res = await axios.patch('/api/users/user',
    userProps,
        {
            headers : {
                "Authorization": `Bearer ${tokenString}`,
                'Content-Type': 'application/json'
            }
        })
    return res.data
}

export const usePatchUser = (useMutationOptions = {}) => {
    return useMutation({
        mutationFn: (APIParams) => patchUser_API({...APIParams}),
        ...useMutationOptions
    })
}