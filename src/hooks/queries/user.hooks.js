import { useQuery } from "react-query";
import axios from "axios"


// get users

async function getUsers_API({ tokenString }) {
    console.log(tokenString, "here?")
    // fetch('/api/user',{method : "POST", headers : {"Authorization": `Bearer ${tokenString}`}}).then(response => console.log(response))
    // // const res = await axios.get('/api/user', { headers: { "Authorization": tokenString, "custom-header-2": "value" } })
    // // const res = await axios.get('/api/user', {
    // //     headers: {
    // //         "Authorization": `Bearer ${tokenString}`,
    // //         'Content-Type': 'application/json'
    // //     }
    // // })
    //axios.defaults.headers.common['Authorization'] = `Bearer ${tokenString}`;
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
    return res.data
}

export const useGetPublicUserInfo = (APIParams = {}, useQueryOptions = {}) => {
    return useQuery(["getCollaboratorsPublic"],() =>  getPublicUsers_API({...APIParams}), useQueryOptions)
}


