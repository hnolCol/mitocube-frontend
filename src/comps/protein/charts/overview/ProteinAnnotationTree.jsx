import { useState } from "react";
import { Icon, Spinner, Tag } from "@blueprintjs/core";
import { api } from "@/api";

function getAccentColor(str) {
    const colors = ["#4C90B2", "#5B8A6F", "#8A6BBE", "#B87333", "#4A7FA5", "#7B6E8A"];
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

function AnnotationTextRow({ annotationTag }) {
    const { data: annotation, isLoading } = api.annotations.queryAnnotations.useGetAnnotationsByTag(
        { tag: annotationTag },
        { staleTime: 200000 }
    );
    const label = isLoading ? annotationTag : (annotation?.text ?? annotationTag);

    return (
        <div
            style={{ fontSize: 12.5, padding: "2px 6px", borderRadius: 3, color: "var(--dark-gray5)" }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--light-gray5)"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
        >
            {isLoading ? <Spinner size={10} /> : label}
        </div>
    );
}

function AnnotationGroupSection({ groupTag, annotationTags }) {
    const [expanded, setExpanded] = useState(false);
    const { data: group, isLoading } = api.annotations.queryAnnotations.useGetAnnotationGroupByTag(
        { tag: groupTag },
        { staleTime: 200000 }
    );
    const groupLabel = isLoading ? groupTag : (group?.text ?? groupTag);
    const accent = getAccentColor(groupTag);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div
                onClick={() => setExpanded(e => !e)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 6px", borderRadius: 3, cursor: "pointer", userSelect: "none" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--light-gray5)"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
            >
                <div style={{ width: 3, height: 14, borderRadius: 2, backgroundColor: accent, flexShrink: 0 }} />
                <Icon icon={expanded ? "chevron-down" : "chevron-right"} size={11} color="var(--gray3)" />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--dark-gray1)", flex: 1 }}>
                    {isLoading ? <Spinner size={10} /> : groupLabel}
                </span>
                <Tag minimal round style={{ fontSize: 11, color: accent, background: `${accent}18` }}>
                    {annotationTags.length}
                </Tag>
            </div>
            {expanded && (
                <div style={{ display: "flex", flexDirection: "column", paddingLeft: 18, borderLeft: `2px solid ${accent}30`, marginLeft: 3 }}>
                    {annotationTags.map(tag => (
                        <AnnotationTextRow key={tag} annotationTag={tag} />
                    ))}
                </div>
            )}
        </div>
    );
}

export function ProteinAnnotationTree({ proteinTag }) {
    const { data: groupedAnnotations, isLoading, isError } = api.annotations.queryAnnotations.useGetAnnotationsBySearchString(
        { protein_tags: proteinTag, group_by_group: true, limit: null },
        { enabled: !!proteinTag, staleTime: 200000 }
    );

    return (
        <div className="flex flex-column" style={{ overflow: "hidden", width: "100%" }}>
            <h3>Annotations</h3>
            <div style={{ height: "33vh", padding: "1rem", overflowY: "scroll" }}>
                {isLoading && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Spinner size={14} /><span style={{ fontSize: 13 }}>Loading…</span>
                    </div>
                )}
                {isError && (
                    <div style={{ fontSize: 13, color: "var(--red3)" }}>Could not load annotations.</div>
                )}
                {!isLoading && !isError && !groupedAnnotations?.length && (
                    <div style={{ fontSize: 13 }}>No annotations found.</div>
                )}
                {groupedAnnotations?.map(({ group_tag, annotation_tags }, i) => (
                    <div key={group_tag}>
                        <AnnotationGroupSection groupTag={group_tag} annotationTags={annotation_tags} />
                        {i < groupedAnnotations.length - 1 && (
                            <div style={{ borderTop: "1px solid var(--light-gray3)", margin: "6px 0" }} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}