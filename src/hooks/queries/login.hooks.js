import { useQuery } from "react-query";
import axios from "axios"


async function loginUser(userInput) {
    //user login attempt, returns a token.
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


async function verifyToken({tokenString, verificationCode}) {
  //verify token with a one time password.
  const res = await axios.post('/api/auth/token/verify',
    { verification_code: verificationCode },
    {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${tokenString}`
    }
  })
  return res.data
}

export const useVerifyToken = (APIParams = {}, queryOptions = {}) => {
  return useQuery(["verifyToken",APIParams], () => verifyToken({...APIParams}), queryOptions)
}
