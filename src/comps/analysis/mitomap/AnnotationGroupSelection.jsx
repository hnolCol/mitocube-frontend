import { Divider, Menu, MenuItem, Popover } from "@blueprintjs/core"
import { useEffect, useState } from "react"
import useDebounce from "@/hooks/useDebounce"
import { api } from "@/api"
import _ from "lodash"

export function AnnotationGroupMenuItem({ tag, menuItemProps, selected, descriptionWidth = "15rem" }) {

    const { data: annotation_group, isSuccess } = api.annotations.queryAnnotations.useGetAnnotationGroupByTag({ tag }, { enabled: Boolean(tag), staleTime: Infinity })

    if (!isSuccess) return null
    
    return <MenuItem 
        icon={selected ? "tick" : "blank"}
        text={annotation_group.text}
        multiline={false}
        labelElement={<div className="font-size--smallest"
            style={{ width: descriptionWidth }}>
            {annotation_group.description}
        </div>}
        onClick={(e) => menuItemProps.handleClick(e, tag)} />
}

export function AnnotationGroupSelectionMenu({ placeholder = "Select annotation group", onSelection, selected_tags = [], showTags = true }) {

    const [isOpen, setIsOpen] = useState(false)
    const [searchString, setSearchString] = useState("")
    const debouncedString = useDebounce(searchString, 50)
    const [limit, setLimit] = useState(1000)

    const { data: annotation_search_results, isLoading, isError, isSuccess, refetch } = api.annotations.queryAnnotations.useGetAnnotationsBySearchString({ search_string: debouncedString, limit, group_by_group: true }, {staleTime: Infinity})

    // Fetch the selected group's full details for display
    const selectedTag = selected_tags.length > 0 ? selected_tags[0] : undefined
    const { data: selectedGroupData } = api.annotations.queryAnnotations.useGetAnnotationGroupByTag(
        { tag: selectedTag }, 
        { enabled: Boolean(selectedTag), staleTime: Infinity }
    )

    useEffect(() => {
        // Make sure there is something displayed when opening the menu
        refetch()
    }, [])

    const annotation_results_ok = isSuccess && _.isArray(annotation_search_results) && annotation_search_results.length > 0

    return (
        <div>
            <Popover
                content={<div className="padding--medium margin--little" style={{ minWidth: "30rem" }}>
                    <h4>Annotation Group Selection</h4>
                    <input type="text"
                        placeholder="Search annotation groups..."
                        value={searchString}
                        onChange={e => setSearchString(e.target.value)}
                        className="search-input" />
                    <Menu>
                        <h4>Annotation Groups</h4>
                        {annotation_results_ok ? <Divider /> : null}
                        {isLoading ? <MenuItem text="Loading..." /> : null}
                        {isError ? <MenuItem text="Error loading annotation groups" /> : null}
                        {annotation_results_ok ?
                            annotation_search_results.map((annotation) => {
                                return <AnnotationGroupMenuItem
                                    selected={selected_tags.includes(annotation.group_tag)}
                                    menuItemProps={{ handleClick: onSelection }}
                                    key={annotation.group_tag}
                                    tag={annotation.group_tag} />
                            })
                            : null
                        }
                        <Divider />
                        {selected_tags.length > 0 ? 
                            <MenuItem text="Deselect" onClick={(e) => onSelection(e, undefined)} /> 
                        : null}
                    </Menu>
                </div>}
                minimal={true}
                isOpen={isOpen}
                onInteraction={(nextOpenState) => setIsOpen(nextOpenState)}
                placement="bottom-start">
                
                <button className="basic-button" onClick={() => setIsOpen(!isOpen)}>
                    {selectedGroupData && showTags 
                        ? selectedGroupData.text 
                        : selectedTag 
                            ? selectedTag 
                            : placeholder}
                </button>

            </Popover>
        </div>
    )
}