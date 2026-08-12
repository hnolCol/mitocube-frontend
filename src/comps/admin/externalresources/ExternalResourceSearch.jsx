import { api } from "@/api"
import { useState } from "react"
import { ExternalResourceContainer } from "./ExternalResourceContainer"
import _ from "lodash"
import { Loading } from "@/comps/core/base/states/Loading"
import { OptionButton } from "@/comps/core/base/buttons/OptionButton"
import { useSearchParams } from "react-router"

const LIMIT_OPTIONS = [10, 25, 50, 100]

export function ExternalResourceSearch({ refetchRef }) {

    const [searchString, setSearchString] = useState("")
    const [searchParams, setSearchParams] = useSearchParams()

    const selectedLimit = LIMIT_OPTIONS.includes(_.toNumber(searchParams.get("limit")))
        ? _.toNumber(searchParams.get("limit"))
        : LIMIT_OPTIONS[0]

    const { data: tags, isLoading, isSuccess, isError, refetch } =
        api.crosslinks.externalresources.useGetExternalResources({ limit: selectedLimit })

    const updateParam = (key, value) => {
        const newParams = new URLSearchParams(searchParams)
        if (value === "" || value === undefined || value === null) newParams.delete(key)
        else newParams.set(key, value)
        setSearchParams(newParams, { replace: true })
    }

    if (refetchRef) refetchRef.current = refetch

    const displayTags = isSuccess && _.isArray(tags)
        ? tags.filter(t => searchString.trim() === "" || t.toLowerCase().includes(searchString.toLowerCase()))
        : []

    return (
        <div className="flex flex-column padding--medium" style={{ gap: "0.4rem", flex: 1, minHeight: 0 }}>
            <div>
                <input
                    className="search-input"
                    type="text"
                    placeholder="Search External Resources..."
                    value={searchString}
                    onChange={(e) => setSearchString(e.target.value)}
                />
            </div>
            <div className="flex">
                {LIMIT_OPTIONS.map(option => (
                    <OptionButton
                        key={option}
                        onClick={() => updateParam("limit", option)}
                        isSelected={option === selectedLimit}
                    >
                        {option}
                    </OptionButton>
                ))}
            </div>
            <div style={{ height: "2rem" }}>
                {isError ? <span>Error searching external resources...</span> : isLoading ? <Loading /> : null}
            </div>
            <ExternalResourceContainer tags={displayTags} />
        </div>
    )
}