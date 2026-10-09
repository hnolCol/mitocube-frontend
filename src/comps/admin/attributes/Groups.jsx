
import PropTypes from "prop-types"
import { useState } from "react"
import _ from "lodash"
import APIError from "../../core/error/APIerror"
import { Loading } from "../../core/base/states/Loading"

import { OptionButton } from "../../core/base/buttons/OptionButton"
import { api } from "@/api"

AttributeGroupSelection.propTypes = {
    onSelection: PropTypes.func.isRequired,
    selected_tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    allowAdd: PropTypes.bool,
}

AttributeGroupSelection.defaultProps = {
    selected_tags: [],
    allowAdd: false,
}

export function AttributeGroupSelection({ onSelection, selected_tags, allowAdd }) {

    const [newGroup, setNewGroup] = useState("")
    const [addedGroups, setAddedGroups] = useState([])
    const [isAddOpen, setIsAddOpen] = useState(false)

    const {data : attribute_group_tags, isLoading, isError, error} = api.attributes.queryAttributes.useGetAttributeGroups({limit: 50},{ staleTime : 1000 * 60 * 5, placeholderData: prev => prev || []})

    // existing groups + newly added ones + selected ones that are not in the database yet
    const allGroups = _.uniq([...(attribute_group_tags || []), ...addedGroups, ...(selected_tags || [])])

    // group tags are lowercase without spaces, e.g. "storage", "cold_storage"
    const normalizedNewGroup = newGroup.trim().toLowerCase().replace(/\s+/g, "_")
    const canAdd = normalizedNewGroup.length > 0 && !allGroups.includes(normalizedNewGroup)

    const closeAdd = () => {
        setNewGroup("")
        setIsAddOpen(false)
    }

    const handleAddGroup = () => {
        if (!canAdd) return
        setAddedGroups(prev => [...prev, normalizedNewGroup])
        onSelection(normalizedNewGroup)
        closeAdd()
    }

    return (
        <div style={{ paddingBottom: allowAdd && isAddOpen ? "0.9rem" : 0 }}>
            {isLoading && <Loading />}
            {isError && <APIError error={error} />}
            <div className="flex flex-wrap center-items gap-2">
                {allGroups.map((tag) => (
                    <OptionButton onClick={() => onSelection(tag)} key={tag} isSelected={selected_tags.includes(tag)} children={<span>{tag}</span>}/>
                ))}
                {allowAdd && !isAddOpen && (
                    <OptionButton onClick={() => setIsAddOpen(true)} isSelected={false} children={<span title="Add group">+</span>}/>
                )}
                {allowAdd && isAddOpen && (
                    <span style={{ position: "relative" }}>
                        <input
                            className="text-input"
                            type="text"
                            autoFocus
                            placeholder="new group"
                            value={newGroup}
                            style={{ width: "10rem", height: "1.6rem", fontSize: "0.85rem", padding: "0 0.4rem" }}
                            onChange={(e) => setNewGroup(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleAddGroup(); if (e.key === "Escape") closeAdd() }}
                            onBlur={() => { if (newGroup.trim().length === 0) closeAdd() }}
                        />
                        <span className="text--muted" style={{ position: "absolute", top: "100%", left: "0.4rem", fontSize: "0.7rem", whiteSpace: "nowrap" }}>
                            Press Enter to add 
                        </span>
                    </span>
                )}
            </div>
        </div>
    )
}

        