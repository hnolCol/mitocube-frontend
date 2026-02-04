import { Divider, Menu, MenuItem, Popover, Tooltip } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import useDebounce from "../../../../hooks/useDebounce";
import hooks from "@mitocube/api-hooks"
import _ from "lodash"

export function AnnotationMenuItem({ tag, menuItemProps, selected, descriptionWidth = "15rem" }) {

    const { data: annotation, isSuccess } = hooks.annotations.useGetAnnotationsByTag({ tag }, { enabled: Boolean(tag), staleTime: Infinity })

    if (!isSuccess) return null
    
    return <MenuItem 
        icon={ selected ? "tick" : "blank"}
        text={annotation.text}
        multiline={false}
        labelElement={<div className="font-size--smallest"
            style={{ width: descriptionWidth }}>
            {annotation.description}
        </div>}
        // active={menuItemProps.modifiers.active} 
        onClick={(e) => menuItemProps.handleClick(e,tag)} />
}

export function AnnotationsInMenu({ annotation_tags = [], title, description }) {
    return (
        <div>
            <div><strong>{title}:</strong>{description}</div>
            <div style={{ maxHeight: "10rem", overflowY: "scroll" }}>
                            <Divider/>

            {annotation_tags.map((tag) => (
                <AnnotationMenuItem key={tag} tag={tag} menuItemProps={{}} selected={false} />
            ))}
            </div>
            </div>
    )
}   

export function AnnotationGroupInMenu({ tag, annotation_tags = [] }) {

    const { data : annotation_group, isSuccess, isLoading } = hooks.annotations.useGetAnnotationGroupByTag({ tag }, {enabled : _.isString(tag)})
    return (
        <MenuItem text={`${isSuccess ? annotation_group.text : null} (${annotation_tags.length})`} style={{maxHeight : "15rem", overflowY : "scroll"}}>
            <AnnotationsInMenu annotation_tags={annotation_tags} title={annotation_group.text} description={annotation_group.description} />
        </MenuItem>
    )
}


export function AnnotationSelectionMenu() {

    const [isOpen, setIsOpen] = useState(false);
    const [searchString, setSearchString] = useState("")
    const debouncedString = useDebounce(searchString, 50)
    const [limit, setLimit] = useState(50)

    const { data : annotation_search_results, isLoading, isError, isSuccess, refetch } = hooks.annotations.useGetAnnotationsBySearchString({ search_string : debouncedString, limit, group_by_group : true})

    useEffect(() => {
        console.log("Refetching annotation search results")
        refetch()
    }, [] )

    console.log(annotation_search_results, "Annotation Search Results")

    const annotation_results_ok = isSuccess && _.isArray(annotation_search_results) && annotation_search_results.length > 0 
    return (
        <Popover
            content={<div className="padding--medium margin--little" style={{ minWidth: "30rem" }}>
                <h2>Annotation Group Selection</h2>
                <input type="text" placeholder="Search in annotation groups and annotations..." value={searchString} onChange={e => setSearchString(e.target.value)} className="search-input" />
                <Menu>
                    
                    <h3>Annotation Groups</h3>
                    {annotation_results_ok ? <Divider /> : null}

                    {isLoading ? <MenuItem text="Loading..." /> : null}
                    {isError ? <MenuItem text="Error loading annotations" /> : null}
                    {annotation_results_ok ?
                        
                        annotation_search_results.map((annotation) => {
                            
                            return <AnnotationGroupInMenu
                            
                                key={annotation.group_tag}
                                tag={annotation.group_tag}
                                annotation_tags={annotation.annotation_tags} />
                        })
                    
                        : null
                    }

                    <Divider />
                    <MenuItem text="Deselect All Annotations" />
                </Menu></div>}
            minimal={true}
            isOpen={isOpen}
            placement="bottom">
            
            <button onClick={() => setIsOpen(!isOpen)}> Selection</button>

        </Popover>
    )
}

