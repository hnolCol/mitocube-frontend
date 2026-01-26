import { Divider, Menu, MenuItem, Popover, Tooltip } from "@blueprintjs/core";
import { useState } from "react";
import useDebounce from "../../../../hooks/useDebounce";
import hooks from "@mitocube/api-hooks"


export function AnnotationMenuItem({ tag, menuItemProps, selected, descriptionWidth = "15rem" }) {

    const { data: annotation, isSuccess } = hooks.annotations.useGetAnnotationByTag({ tag }, { enabled: Boolean(tag), staleTime: Infinity })
    if (!isSuccess) return null
    
    return <MenuItem 
        icon={ selected ? "tick" : "blank"}
        text={annotation.text}
        multiline={true}
        labelElement={<div className="font-size--smallest"
            style={{ width: descriptionWidth }}>
            {annotation.description}
        </div>}
        active={menuItemProps.modifiers.active} 
        onClick={(e) => menuItemProps.handleClick(e,tag)} />
}

export function AnnotationsInMenu({ tags = [] }) {
    return (
        <div>
            Annotations 
        </div>
    )
}   

export function AnnotationGroupInMenu({ tag, annotation_tags = [] }) {
    return (
        <MenuItem text={`${tag} (${annotation_tags.length} Annotations)`} style={{maxHeight : "15rem", overflowY : "scroll"}}>
            <Divider/>
                <AnnotationsInMenu tags={annotation_tags} />
        </MenuItem>
    )
}


export function AnnotationSelectionMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [searchString, setSearchString] = useState("")
    const debouncedString = useDebounce(searchString, 50)

    const { data : annotation_search_results, isLoading, isError } = hooks.annotations.useGetAnnotationsBySearchString({ search_string : debouncedString, limit : 50 })

    return (
        <Popover
            content={<div className="padding--medium margin--little" style={{ minWidth: "30rem" }}>
                <h2>Annotation Group Selection</h2>
                <input type="text" placeholder="Search annotation groups and annotations..." value={searchString} onChange={e => setSearchString(e.target.value)} className="search-input" />
                <Menu>
                    
                    <h3>Annotation Groups</h3>
                    <Divider />

                    {isLoading ? <MenuItem text="Loading..." /> : null}
                    {isError ? <MenuItem text="Error loading annotations" /> : null}
                    {isSuccess && _.isArray(annotation_search_results) && annotation_search_results.length === 0 ?
                        
                        annotation_search_results.map((annotation) => {
                            
                            return <AnnotationGroupInMenu
                                key={annotation.tag}
                                tag={annotation.tag}
                                annotation_tags={annotation_search_results.annotation_tags} />
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

