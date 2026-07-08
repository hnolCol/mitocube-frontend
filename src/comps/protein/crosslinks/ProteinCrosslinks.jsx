import { useState } from "react";
import { api } from "@/api";
import { ExternalResourceSelectionMenu } from "./ExternalResourceSelectionMenu";
import { CrosslinksTable } from "./CrosslinksTable";
import { ProteinCrosslinkViewer } from "./ProteinCrosslinkViewer";
import { AnnotationSelectionMenu } from "@/comps/core/base/annotations/AnnotationSelectionMenu";
import { Menu, MenuItem, Popover, Icon } from "@blueprintjs/core";

const LIMIT_OPTIONS = [
    { label: "10", value: 10 },
    { label: "20", value: 20 },
    { label: "50", value: 50 },
    { label: "All", value: null },
];

function LimitSelectionMenu({ value, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const current = LIMIT_OPTIONS.find(o => o.value === value) || LIMIT_OPTIONS[1];
    return (
        <Popover
            content={
                <Menu>
                    {LIMIT_OPTIONS.map(opt => (
                        <MenuItem
                            key={opt.label}
                            icon={opt.value === value ? "tick" : "blank"}
                            text={opt.label}
                            onClick={() => { onChange(opt.value); setIsOpen(false); }}
                        />
                    ))}
                </Menu>
            }
            minimal={true}
            isOpen={isOpen}
            onInteraction={(next) => setIsOpen(next)}
            placement="bottom-start"
        >
            <button className="basic-button" onClick={() => setIsOpen(!isOpen)}>
                Show: {current.label}
                <Icon icon="caret-down" />
            </button>
        </Popover>
    );
}

export function ProteinCrosslinks({ protein_tag }) {
    const [selectedResourceTag, setSelectedResourceTag] = useState(null);
    const [partnerLimit, setPartnerLimit] = useState(20);
    const [focusedPartnerTag, setFocusedPartnerTag] = useState(null);
    const [partners, setPartners] = useState([]);
    const [visiblePartnerTags, setVisiblePartnerTags] = useState(null);
    const [droppedTags, setDroppedTags] = useState(new Set());
    const [annotationFilterTag, setAnnotationFilterTag] = useState(null);
    const [showInterPartner, setShowInterPartner] = useState(false);

    const { data: annotationProteins } = api.annotations.queryAnnotations.useGetProteinsByAnnotation(
        { tag: annotationFilterTag || "" },
        { enabled: Boolean(annotationFilterTag), staleTime: Infinity }
    )

    const annotationProteinSet = annotationFilterTag && Array.isArray(annotationProteins)
        ? new Set(annotationProteins)
        : null

    const partnerFilter = annotationProteinSet
        ? partners.filter(p => annotationProteinSet.has(p.tag)).map(p => p.tag)
        : null

    return (
        <div className="flex flex-column">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8, alignItems: "center" }}>
                {focusedPartnerTag ? (
                    <button className="basic-button" onClick={() => setFocusedPartnerTag(null)}>
                        <Icon icon="arrow-left" /> Back to full view
                    </button>
                ) : (
                    <>
                        <ExternalResourceSelectionMenu
                            protein_tag={protein_tag}
                            selected_tag={selectedResourceTag}
                            onSelection={(e, tag) => setSelectedResourceTag(tag)}
                        />
                        <LimitSelectionMenu value={partnerLimit} onChange={setPartnerLimit} />
                        <AnnotationSelectionMenu
                            placeholder="Filter by annotation"
                            selected_tags={annotationFilterTag ? [annotationFilterTag] : []}
                            onSelection={(e, tag) => setAnnotationFilterTag(tag === annotationFilterTag ? null : tag)}
                            onRemove={() => setAnnotationFilterTag(null)}
                            showTags={false}
                            showDeselect={true}
                        />
                        {annotationFilterTag && (
                            <button className="basic-button" onClick={() => setAnnotationFilterTag(null)}>
                                <Icon icon="cross" /> Clear filter
                            </button>
                        )}
                        <button
                            className="basic-button"
                            onClick={() => setShowInterPartner(v => !v)}
                            style={showInterPartner ? { background: "#9B6DFF", color: "#fff", borderColor: "#9B6DFF" } : {}}
                        >
                            Inter-partner crosslinks
                        </button>
                    </>
                )}
            </div>

            <ProteinCrosslinkViewer
                tag={protein_tag}
                resource_tag={selectedResourceTag}
                limit={focusedPartnerTag ? null : partnerLimit}
                partnerFilter={partnerFilter}
                focusedPartnerTag={focusedPartnerTag}
                onFocusPartner={setFocusedPartnerTag}
                onPartnersChange={setPartners}
                onVisiblePartnersChange={setVisiblePartnerTags}
                onDroppedTagsChange={setDroppedTags}
                showInterPartner={showInterPartner}
            />

            <div style={{ maxHeight: 400, overflowY: "auto", marginTop: 12 }}>
                <CrosslinksTable
                    protein_tag={protein_tag}
                    resource_tag={selectedResourceTag}
                    droppedTags={droppedTags}
                    focusedPartnerTag={focusedPartnerTag}
                    visiblePartnerTags={visiblePartnerTags}
                />
            </div>
        </div>
    );
}