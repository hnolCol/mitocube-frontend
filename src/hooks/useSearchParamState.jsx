import { useEffect, useState } from "react"
import { useSearchParams } from "react-router"
import _ from "lodash"
import useDebounce from "./useDebounce"

/**
 * Search state persisted in the URL query params. The searchString is
 * initialized from the given param key, debounced, and written back to the
 * URL (replace, so no history spam while typing). The limit is validated
 * against the given options and persisted the same way. An optional
 * limitAllValue (e.g. Infinity, encoded as "all") selects all entries.
 * @param {Object} props
 * @param {String} props.searchKey URL param key for the search string, default "q".
 * @param {String} props.limitKey URL param key for the limit, default "limit".
 * @param {Number[]} props.limitOptions Valid limit options, default [10, 25, 50, 100].
 * @param {Number} props.limitAllValue Limit value meaning "all", encoded as "all" in the URL, default undefined.
 * @param {Number} props.debounceDelay Debounce delay in ms, default 300.
 * @param {Object} props.numberParam Optional second numeric param persisted in the URL,
 * e.g. { key: "role", options: [1, 2, 4], noneValue: -1 } - values are validated against
 * options, noneValue removes the param from the URL.
 * @returns {{ searchString: String, setSearchString: Function, debouncedSearchString: String, limit: Number, setLimit: Function, numberParam: { value: Number, setValue: Function } }}
 */
export function useSearchParamState({ searchKey = "q", limitKey = "limit", limitOptions = [10, 25, 50, 100], limitAllValue = undefined, debounceDelay = 300, numberParam: numberParamConfig = undefined } = {}) {

    const [searchParams, setSearchParams] = useSearchParams()

    const [searchString, setSearchString] = useState(searchParams.get(searchKey) || "")
    const debouncedSearchString = useDebounce(searchString, debounceDelay)

    const limitParam = searchParams.get(limitKey)
    const limit = limitParam === "all" && _.isNumber(limitAllValue)
        ? limitAllValue
        : limitOptions.includes(_.toNumber(limitParam))
            ? _.toNumber(limitParam)
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
        if (value === limitAllValue && _.isNumber(limitAllValue)) {
            newParams.set(limitKey, "all")
        } else if (limitOptions.includes(_.toNumber(value))) {
            newParams.set(limitKey, _.toNumber(value))
        } else {
            newParams.delete(limitKey)
        }
        setSearchParams(newParams, { replace: true })
    }

    return { searchString, setSearchString, debouncedSearchString, limit, setLimit }
}
