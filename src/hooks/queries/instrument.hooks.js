
import { useQuery, useMutation } from "react-query"
import axios from "axios"
import _ from "lodash"




/**
 * @description - Returns the instrument that are found in the database.  
 * @returns {import("../../types/attributes").AttributeValue[]} The array of instruments (AttributeValues)
 */
async function getInstruments_API({ }) {
    const res = await axios.get("/api/instruments")
    return res.data
    }

export function useGetInstruments(APIParams = {}, useQueryOptions = {staleTime : 60000}, ) {
    return useQuery(["getInstruments"],() =>  getInstruments_API({...APIParams}), useQueryOptions)
}

/**
 * @description - Returns the instrument that are found in the database.  
 * @param {Object} props
 * @param {String} props.tag
 */
async function getInstrumentStats_API({tag}) {
    const res = await axios.get(`/api/instruments/${tag}/stats`)
    return res.data
    }


export function useGetInstrumentStatsByTag(APIParams = {}, useQueryOptions = {staleTime : 60000}, ) {
    return useQuery(["getInstrumentsStatsByTag",APIParams.tag],() =>  getInstrumentStats_API({...APIParams}), useQueryOptions)
}