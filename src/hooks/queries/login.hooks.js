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

/**
 * @description Verifies the token. Returns an object. TO DO: useMutation instead of useQuery.
 * @param {Object} props
 * @param {string} props.tokenString - The token string to be verified. 
 * @param {string} props.verificationCode - The code that was sent via email and is used by the user to validate the token. 
 * @returns {import("../../types/authentication").TokenResponse} - The response if the token was successfully verified. 
 */
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
  return useQuery(["verifyToken",APIParams.tokenString, APIParams.verificationCode], () => verifyToken({...APIParams}), queryOptions)
}

/**
 * @description Checks if the token is valid. 
 * @param {Object} props
 * @param {string} props.tokenString - The token string to check if it is still valid. 
 * @returns {import("../../types/authentication").TokenVaidResponse} - The resonse of the API if the token is valid. 
 */
async function checkToken({ tokenString }) {
  const res = await axios.get('/api/auth/token/valid',
    {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tokenString}`
      }
    })
  
  return res.data
}

export const useTokenValid = (APIParams = {}, queryOptions = {}) => {
  return useQuery(["isTokenValid",APIParams], () => checkToken({...APIParams}), queryOptions)
}






