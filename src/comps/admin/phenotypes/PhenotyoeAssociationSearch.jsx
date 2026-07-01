import { api } from "@/api"
import { useState } from "react"
import _ from "lodash"
import useDebounce from "../../../hooks/useDebounce"
import { Loading } from "@/comps/core/base/states/Loading"
import { OptionButton } from "@/comps/core/base/buttons/OptionButton"
import { PhenotypeAssociationContainer } from "./PhenotypeAssociationContainer"

const LIMIT_OPTIONS = [10, 25, 50, 100]

export function PhenotypeAssociationSearch() {
    const [searchString, setSearchString] = useState("")
    const debouncedSearchString = useDebounce(searchString, 300)
    const [limit, setLimit] = useState(LIMIT_OPTIONS[0])
    const [tagsToDisplay, setTagsToDisplay] = useState([])

    const { data: tags, isLoading, isSuccess, isError, refetch: updateList } = api.phenotypes.associations.useFindPhenotypeAssociations(
        { query: debouncedSearchString, limit },
        { staleTime: 2000 }
    )

    useState(() => {
        if (isSuccess && _.isArray(tags)) setTagsToDisplay(tags)
    }, [isSuccess, _.join(tags)])

    return (
        <div className="flex flex-column padding--medium" style={{ gap: "0.4rem", flex: 1, minHeight: 0 }}>
            <div>
                <input
                    className="search-input"
                    type="text"
                    placeholder="Search phenotype associations..."
                    value={searchString}
                    onChange={(e) => setSearchString(e.target.value)}
                />
            </div>
            <div className="flex">
                {LIMIT_OPTIONS.map(option => (
                    <OptionButton
                        key={option}
                        onClick={() => setLimit(option)}
                        isSelected={option === limit}
                    >
                        {option}
                    </OptionButton>
                ))}
            </div>
            <div style={{ height: "2rem" }}>
                {isError ? <span>Error loading phenotype associations.</span> : isLoading ? <Loading /> : null}
            </div>
            <PhenotypeAssociationContainer tags={tagsToDisplay} updateList={updateList} />
        </div>
    )
}