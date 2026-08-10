import { Menu, MenuItem, Popover, Icon, Drawer, Classes } from "@blueprintjs/core";
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
    const [infoResource, setInfoResource] = useState(null);

    const { data: resources, isLoading, isError, isSuccess } =
        api.crosslinks.externalresources.useGetExternalResourcesByProteinTag(
            { protein_tag },
            { enabled: Boolean(protein_tag) }
        );

    const results_ok = isSuccess && _.isArray(resources) && resources.length > 0;
    const selected_resource = results_ok ? resources.find(r => r.tag === selected_tag) : null;

    return (
        <>
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
                                    text={
                                        <div style={{ padding: "2px 0" }}>
                                            <div style={{ fontWeight: 500 }}>{resource.title}</div>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
                                                {resource.author ? <span style={{ fontSize: 11, color: "#5c7080", fontWeight: 600 }}>{resource.author}</span> : <span />}
                                                {resource.link
                                                    ? <a href={resource.link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ fontSize: 11, color: "#106ba3" }}>{resource.link}</a>
                                                    : null}
                                            </div>
                                        </div>
                                    }
                                    labelElement={
                                        <Icon
                                            icon="info-sign"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setInfoResource(resource);
                                            }}
                                        />
                                    }
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

            <Drawer
                isOpen={Boolean(infoResource)}
                onClose={() => setInfoResource(null)}
                title="Crosslink Source Information"
                size={Drawer.SIZE_SMALL}
            >
                <div className={Classes.DRAWER_BODY}>
                    <div className={Classes.DIALOG_BODY}>
                        <h4 style={{ marginTop: 0, marginBottom: 12 }}>{infoResource?.title}</h4>
                        {infoResource?.author ? <p><b>Author:</b> {infoResource.author}</p> : null}
                        {infoResource?.publication_date ? <p><b>Published:</b> {infoResource.publication_date}</p> : null}
                        {infoResource?.doi ? (
                            <p>
                                <b>DOI:</b>{" "}
                                {infoResource.link ? (
                                    <a href={infoResource.link} target="_blank" rel="noreferrer">
                                        {infoResource.doi}
                                    </a>
                                ) : infoResource.doi}
                            </p>
                        ) : null}
                        {infoResource?.cell_type ? <p><b>Cell type:</b> {infoResource.cell_type}</p> : null}
                        {infoResource?.organism ? <p><b>Organism:</b> {infoResource.organism}</p> : null}
                        {_.isArray(infoResource?.cross_linkers) && infoResource.cross_linkers.length > 0 ? (
                            <p><b>Cross-linkers:</b> {infoResource.cross_linkers.join(", ")}</p>
                        ) : null}
                        {_.isArray(infoResource?.conditions) && infoResource.conditions.length > 0 ? (
                            <p><b>Conditions:</b> {infoResource.conditions.join(", ")}</p>
                        ) : null}
                    </div>
                </div>
            </Drawer>
        </>
    );
}