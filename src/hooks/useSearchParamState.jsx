import { useEffect, useState } from "react"
import _ from "lodash"
import { useSearchParams } from "react-router"
import useDebounce from "./useDebounce"

/**
 * Search state persisted in the URL query params. The searchString is
 * initialized from the given param key, debounced, and written back to the
 * URL (replace, so no history spam while typing). The limit is validated
 * against the given options and persisted the same way.
 * @param {Object} props
 * @param {String} props.searchKey URL param key for the search string, default "q".
 * @param {String} props.limitKey URL param key for the limit, default "limit".
 * @param {Number[]} props.limitOptions Valid limit options, default [10, 25, 50, 100].
 * @param {Number} props.debounceDelay Debounce delay in ms, default 300.
 * @returns {{ searchString: String, setSearchString: Function, debouncedSearchString: String, limit: Number, setLimit: Function }}
 */
export function useSearchParamState({ searchKey = "q", limitKey = "limit", limitOptions = [10, 25, 50, 100], debounceDelay = 300 } = {}) {

    const [searchParams, setSearchParams] = useSearchParams()

    const [searchString, setSearchString] = useState(searchParams.get(searchKey) || "")
    const debouncedSearchString = useDebounce(searchString, debounceDelay)

    const limit = limitOptions.includes(_.toNumber(searchParams.get(limitKey)))
        ? _.toNumber(searchParams.get(limitKey))
        : limitOptions[0]

    useEffect(() => {
        const newParams = new URLSearchParams(searchParams)
        if (_.isString(debouncedSearchString) && debouncedSearchString.length > 0) {
            newParams.set(searchKey, debouncedSearchString)
        } else {
            newParams.delete(searchKey)
        }
        if (newParams.toString() !== searchParams.toString()) {
            setSearchParams(newParams, { replace: true })
        }
    }, [debouncedSearchString])

    const setLimit = (value) => {
        const newParams = new URLSearchParams(searchParams)
        if (limitOptions.includes(_.toNumber(value))) {
            newParams.set(limitKey, _.toNumber(value))
        } else {
            newParams.delete(limitKey)
        }
        setSearchParams(newParams, { replace: true })
    }

    return { searchString, setSearchString, debouncedSearchString, limit, setLimit }
}
