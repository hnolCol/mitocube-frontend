

import { api } from "@/api"
import useDebounce from "@/hooks/useDebounce"
import { useEffect, useState } from "react"

import _ from "lodash"


/**
 * 
 * @param {Object} props 
 * @param {string[]} props.proteome_tags - Array of proteome tags to search within. This is used to filter the search results to only include proteins that are part of the specified proteomes.
 * @param {Function} props.onSuccess - Callback function that is called when a search is successful. It receives the search string as an argument.
 * @returns 
 */
export function ProteinSearch({ submission_tag, onSuccess }) {
    const [searchString, setSearchString] = useState()
    const debouncedSearchString = useDebounce(searchString, 50)
   
    const { data, error, isLoading, isSuccess } = api.features.proteinsQuery.useGetProteinFeatureByQuery({ search_string: debouncedSearchString, limit: 100000, submission_tags: [submission_tag] }, { staleTime: 60000, enabled: debouncedSearchString.length > 1 && _.isString(submission_tag) })
    useEffect(() => { if (debouncedSearchString.length === 0) onSuccess([]) }, [debouncedSearchString])
    useEffect(() => {if (_.isArray(data)) onSuccess(data)}, [data])
    return <input className="search-input" placeholder="Search for a protein..." onChange={(e) => setSearchString(e.target.value)} onKeyDown={(e) => {
        if (e.key === "Enter" && isSuccess) {
            onSuccess(data)
        }
    }} /> 
}