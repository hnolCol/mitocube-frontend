import { Tag, Spinner } from "@blueprintjs/core";
import { api } from "@/api";

export function ProteinGroupsDisplay({ proteinTag }) {
    const { data: groups, isLoading } = api.features.ranking.useGetProteinGroupsByProteinTag(
        { protein_tag: proteinTag },
        { enabled: !!proteinTag, staleTime: Infinity }
    );

    if (isLoading) return <Spinner size={10} />;

    return (
        <div style={{ marginTop: 8, marginBottom: 4 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--gray1)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                Protein Groups
            </div>
            {groups?.length
                ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {groups.map(tag => (
                            <Tag key={tag} minimal style={{ fontSize: 11, fontFamily: "monospace" }}>
                                {tag}
                            </Tag>
                        ))}
                    </div>
                )
                : <div style={{ fontSize: 13, color: "var(--gray3)" }}>Not associated with a protein group.</div>
            }
        </div>
    );
}