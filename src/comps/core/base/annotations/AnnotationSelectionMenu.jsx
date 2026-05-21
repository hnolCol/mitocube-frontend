import { Divider, Menu, MenuItem, Popover, Tooltip } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import useDebounce from "../../../../hooks/useDebounce";
import { api } from "@/api"
import _ from "lodash"
import { Annotation } from "./Annotation";
import { TagLike } from "../tags/TagLike";

export function AnnotationMenuItem({ tag, menuItemProps, selected, descriptionWidth = "15rem" }) {

    const { data: annotation, isSuccess } = api.annotations.queryAnnotations.useGetAnnotationsByTag({ tag }, { enabled: Boolean(tag), staleTime: Infinity })

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

export function AnnotationsInMenu({ annotation_tags = [], title, description, selected_tags = [], onSelection }) {
    return (
        <div>
            <div><strong>{title}:</strong>{description}</div>
            <div style={{ maxHeight: "10rem", overflowY: "scroll" }}>
                            <Divider/>

            {annotation_tags.map((tag) => (
                <AnnotationMenuItem key={tag} tag={tag} menuItemProps={{handleClick: onSelection}} selected={selected_tags.includes(tag)} />
            ))}
            </div>
            </div>
    )
}   

export function AnnotationGroupInMenu({ tag, annotation_tags = [], selected_tags = [], onSelection }) {

    const { data : annotation_group, isSuccess, isLoading } = api.annotations.queryAnnotations.useGetAnnotationGroupByTag({ tag }, {enabled : _.isString(tag)})
    return (
        <MenuItem text = {`${isSuccess ? annotation_group.text : null} (${annotation_tags.length})`} style = {{ maxHeight: "15rem", overflowY : "scroll" }}>
            { isSuccess? <AnnotationsInMenu annotation_tags={annotation_tags} title={annotation_group.text} description={annotation_group.description} selected_tags={selected_tags} onSelection={onSelection} />: null }
        </MenuItem > 
    )
}


export function AnnotationSelectionMenu({placeholder = "Select annotations", onSelection, onRemove, selected_tags = [], showTags = true}) {

    const [isOpen, setIsOpen] = useState(false);
    const [searchString, setSearchString] = useState("")
    const debouncedString = useDebounce(searchString, 50)
    const [limit, setLimit] = useState(50)

    const { data : annotation_search_results, isLoading, isError, isSuccess, refetch } = api.annotations.queryAnnotations.useGetAnnotationsBySearchString({ search_string : debouncedString, limit, group_by_group : true})

    useEffect(() => {
        //make sure there is something displayed when opening the menu, otherwise it looks weird.
        refetch()
    }, [] )


    const annotation_results_ok = isSuccess && _.isArray(annotation_search_results) && annotation_search_results.length > 0 
    
    return (
        <div>
        <Popover
            
            content={<div className="padding--medium margin--little" style={{ minWidth: "30rem" }}>
                <h4>Annotation Group Selection</h4>
                <input type="text"
                    placeholder="Search in annotation groups and annotations..."
                    value={searchString}
                    onChange={e => setSearchString(e.target.value)}
                    className="search-input" />
                <Menu>
                    
                    <h4>Annotation Groups</h4>
                    {annotation_results_ok ? <Divider /> : null}
                    {isLoading ? <MenuItem text="Loading..." /> : null}
                    {isError ? <MenuItem text="Error loading annotations" /> : null}
                    {annotation_results_ok ?
                        
                        annotation_search_results.map((annotation) => {
                            
                            return <AnnotationGroupInMenu
                                selected_tags={selected_tags}
                                onSelection={onSelection}
                                key={annotation.group_tag}
                                tag={annotation.group_tag}
                                annotation_tags={annotation.annotation_tags} />
                        })
                    
                        : null
                    }

                    <Divider />
                    <MenuItem text="Deselect All Annotations" onClick={(e) => onSelection(e,[])} />
                </Menu></div>}
            minimal={true}
            isOpen={isOpen}
            onInteraction={(nextOpenState) => setIsOpen(nextOpenState)}
            placement="bottom-start">
            
            <button className="basic-button" onClick={() => setIsOpen(!isOpen)}>{showTags ? placeholder : selected_tags.length > 0 ? <Annotation tag={selected_tags[0]} /> : placeholder   }</button>

            </Popover>
            {showTags && selected_tags.length > 0 ? <div>
                {selected_tags.map(tag => <TagLike key={tag} onRemove={(e => onRemove(e,tag))}><Annotation tag={tag} /></TagLike>)}
            </div> : null}
            </div>
    )
}

