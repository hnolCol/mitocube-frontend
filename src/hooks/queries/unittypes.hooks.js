import { useQuery, useMutation } from "react-query"
import axios from "axios"



async function useGetUnitsByUnitType_API({tag}) {
    const res = await axios.get(`/api/unittypes/${tag}/units`)
    return res.data 
}

export const useGetUnitsByUnitType = (APIParams = { tag }, useQueryOptions = {}) => {
    return useQuery(["getUnitTypesUnits",APIParams.tag],
        () => useGetUnitsByUnitType_API({ ...APIParams }), useQueryOptions)
}

// async function useGetUnitType_API({tag}) {
//     const res = await axios.get(`/api/unittypes/${tag}`)
//     return res.data 
// }


// export const useGetUnitType = (APIParams = { tag }, useQueryOptions = {}) => {
//     return useQuery(["getUnitType",APIParams.tag],
//         () => useGetUnitType_API({ ...APIParams }), useQueryOptions)
// }