import { useQuery } from "@tanstack/react-query";
import axios from "axios"



async function getShareToken_API({tokenString, sharePassword}) {
    //user login attempt, returns a token.
    const res = await axios.post('/api/auth/token/share',
      {pw : sharePassword},
      {
          headers: {
              'Content-Type': 'application/json',
              "Authorization": `Bearer ${tokenString}`
          }
      })
    return res.data
}

export const useGetShareToken = (APIParams = {}, queryOptions = {}) => {
    
    return useQuery(["shareToken",APIParams], () => getShareToken_API({...APIParams}), queryOptions)
}
