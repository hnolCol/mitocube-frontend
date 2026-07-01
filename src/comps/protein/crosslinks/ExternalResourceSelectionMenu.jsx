import { Menu, MenuItem, Popover, Icon } from "@blueprintjs/core";
import { useState } from "react";
import _ from "lodash";
import { api } from "@/api";

export function ExternalResourceSelectionMenu({
    protein_tag,
    placeholder = "Select external resource",
    selected_tag,
    onSelection,
}) {
    const [isOpen, setIsOpen] = useState(false);

    const { data: resources, isLoading, isError, isSuccess } =
        api.crosslinks.externalresources.useGetExternalResourcesByProteinTag(
            { protein_tag },
            { enabled: Boolean(protein_tag) }
        );

    const results_ok = isSuccess && _.isArray(resources) && resources.length > 0;
    const selected_resource = results_ok ? resources.find(r => r.tag === selected_tag) : null;

    return (
        <Popover
            content={
                <Menu>
    {isLoading ? <MenuItem text="Loading..." /> : null}
    {isError ? <MenuItem text="Error loading external resources" /> : null}
    <MenuItem
        icon={!selected_tag ? "tick" : "blank"}
        text="All sources"
        onClick={(e) => {
            onSelection(e, null);
            setIsOpen(false);
        }}
    />
    {results_ok
        ? resources.map((resource) => (
            <MenuItem
                key={resource.tag}
                icon={resource.tag === selected_tag ? "tick" : "blank"}
                text={resource.title}
                onClick={(e) => {
                    onSelection(e, resource.tag);
                    setIsOpen(false);
                }}
            />
        ))
        : null}
    {isSuccess && resources.length === 0 ? (
        <MenuItem text="No external resources for this protein" disabled />
    ) : null}
</Menu>
            }
            minimal={true}
            isOpen={isOpen}
            onInteraction={(next) => setIsOpen(next)}
            placement="bottom-start"
        >
           <button className="basic-button" onClick={() => setIsOpen(!isOpen)}>
    {selected_resource ? selected_resource.title : "All sources"}
    <Icon icon="caret-down" />
</button>
        </Popover>
    );
}