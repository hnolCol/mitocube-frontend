import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "./client";

/**
 * Returns the calendar years that have reportable data.
 * Requires at least curator rights. Endpoint: GET '/api/reports/years'
 * @returns {Promise<Number[]>} The calendar years with reportable data.
 */
async function getReportYears_API() {
    const res = await apiClient.get(`/reports/years`)
    return res.data
}

const useGetReportYears = (useQueryOptions = { staleTime: Infinity }) => {
    return useQuery({
        queryKey: ["getReportYears"],
        queryFn: () => getReportYears_API(),
        ...useQueryOptions
    })
}

/**
 * Returns the aggregated yearly report as JSON.
 * Requires at least curator rights. Endpoint: GET '/api/reports/year/{year}'
 * @param {Object} props
 * @param {Number} props.year - The calendar year of the report.
 * @returns {Promise<Object>} The yearly report (community, submissions, data volume, instrument performance, highlights).
 */
async function getYearReport_API({ year }) {
    const res = await apiClient.get(`/reports/year/${year}`)
    return res.data
}

const useGetYearReport = (APIParams = { year }, useQueryOptions = { staleTime: 50000 }) => {
    return useQuery({
        queryKey: ["getYearReport", APIParams.year],
        queryFn: () => getYearReport_API({ ...APIParams }),
        ...useQueryOptions
    })
}

/**
 * Downloads the yearly report as an Excel workbook (format = "xlsx") or a
 * Markdown file (format = "md") as a Blob.
 * Requires at least curator rights. Endpoint: GET '/api/reports/year/{year}/download'
 * @param {Object} props
 * @param {Number} props.year - The calendar year of the report.
 * @param {String} [props.format="xlsx"] - The download format, "xlsx" or "md".
 * @returns {Promise<Blob>} The report file.
 */
async function downloadYearReport_API({ year, format = "xlsx" }) {
    const res = await apiClient.get(`/reports/year/${year}/download`, {
        params: { format },
        responseType: "blob"
    })
    return res.data
}

const useDownloadYearReport = (useMutationOptions = {}) => {
    return useMutation({
        mutationFn: (APIParams) => downloadYearReport_API({ ...APIParams }),
        ...useMutationOptions
    })
}

export const yearReportAPI = {
    useGetReportYears,
    useGetYearReport,
    useDownloadYearReport
}
