import { useQuery } from "react-query";
import axios from "axios"


async function loginUser(userInput) {
    //user login attempt, returns a token. TO DO: Should useMutation be used? 
    var bodyFromData = new FormData()
    bodyFromData.append('username' , userInput.username)
    bodyFromData.append('password',  userInput.password)
    const res = await axios.post('/api/auth/token',
      bodyFromData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    return res.data
}

export const useLoginUser = (userInput = {}, queryOptions = {}) => {
    return useQuery(["loginUser",userInput], () => loginUser(userInput), queryOptions)
}





