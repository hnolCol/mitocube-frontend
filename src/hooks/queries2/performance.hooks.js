import { useQuery, useMutation } from "@tanstack/react-query"
import axios from "axios"
import _ from "lodash"



/**
 * @description - Returns the metrices required for a QC Run  
 * @returns {Object[]} 
 */
async function getPerformancesMetrices_API({ }) {
    const res = await axios.get("/api/performance/metrices")
    return res.data
    }

export function useGetPerformanceMetrices(APIParams = {}, useQueryOptions = {}, ) {
    return useQuery(["getPerformanceMetrices"],() =>  getPerformancesMetrices_API({...APIParams}), useQueryOptions)
}



/**
 * @description - Returns the rt peptides required for a QC Run  
 * @returns {Object[]} 
 */
async function getPerformancesPeptides_API({ }) {
    const res = await axios.get("/api/performance/peptides")
    return res.data
    }

export function useGetPerformancePeptides(APIParams = {}, useQueryOptions = {}, ) {
    return useQuery(["getPerformanceQCPeptides"],() =>  getPerformancesPeptides_API({...APIParams}), useQueryOptions)
}



