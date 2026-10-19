import { api } from "@/api"
import { useState } from "react"
import { ExternalResourceContainer } from "./ExternalResourceContainer"
import _ from "lodash"
import { Loading } from "@/comps/core/base/states/Loading"
import { OptionButton } from "@/comps/core/base/buttons/OptionButton"
import { useSearchParamState } from "../../../hooks/useSearchParamState"

const LIMIT_OPTIONS = [10, 25, 50, 100]

export function ExternalResourceSearch({ refetchRef }) {

    const { searchString, setSearchString, limit: selectedLimit, setLimit } = useSearchParamState({ limitOptions: LIMIT_OPTIONS })

    const { data: tags, isLoading, isSuccess, isError, refetch } =
        api.crosslinks.externalresources.useGetExternalResources({ limit: selectedLimit })


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
                        onClick={() => setLimit(option)}
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