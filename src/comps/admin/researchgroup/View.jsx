import _ from "lodash"
import { useEffect, useState } from "react"
import { api } from "@/api"
import { ResearchGroupContainer } from "./ResearchGroupContainer"
import { OptionButton } from "../../core/base/buttons/OptionButton"
import useDebounce from "../../../hooks/useDebounce"

const LIMIT_OPTIONS = [20, 50, 100, 200]

export function ResearchGroupView({ refetchTrigger, setEditUsersDialog }) {
    const [limit, setLimit] = useState(20)
    const [searchString, setSearchString] = useState("")
    const debounced = useDebounce(searchString, 300)

    const { data: research_group_tags, refetch } = api.researchgroups.useGetResearchGroups(
        { limit, search_string: debounced || undefined },
        { staleTime: 0 }
    )

    useEffect(() => {
        if (refetchTrigger !== undefined) {
            refetch()
        }
    }, [refetchTrigger])

    return (
        <div className="flex flex-column margin--medium padding--medium" style={{ gap: "0.4rem", overflowY: "scroll" }}>
            <input
                className="search-input"
                placeholder="Search research groups..."
                value={searchString}
                onChange={(e) => setSearchString(e.target.value)}
            />

            <div className="flex" style={{ marginBottom: "0.75rem", flexShrink: 0 }}>
                {LIMIT_OPTIONS.map(option => (
                    <OptionButton key={option} onClick={() => setLimit(option)} isSelected={option === limit}>
                        {option}
                    </OptionButton>
                ))}
            </div>

            <ResearchGroupContainer
                tags={research_group_tags}
                updateResearchGroupList={refetch}
                setEditUsersDialog={setEditUsersDialog}
            />
        </div>
    )
}