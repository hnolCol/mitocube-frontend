import _ from "lodash"
import { api } from "@/api"

function ProteinGeneNameCell({ tag }) {
    const { data: protein } = api.features.proteinsQuery.useGetProteinByTag(
        { tag }, { enabled: Boolean(tag), staleTime: Infinity }
    )
    return <>{protein?.gene_name || tag}</>
}

const cellStyle = { border: "0.5px solid black", padding: "6px 10px", textAlign: "center" }

export function CrosslinksTable({ protein_tag, resource_tag, droppedTags = new Set() }) {
    const { data: crosslinks, isLoading, isError, isSuccess } =
        api.crosslinks.crosslinks.useGetCrosslinksByProteinTag(
            { protein_tag, resource_tag },
            { enabled: Boolean(protein_tag) }
        )

    if (isLoading) return <div className="padding--little">Loading crosslinks...</div>
    if (isError) return <div className="padding--little">Error loading crosslinks.</div>
    if (!isSuccess || crosslinks.length === 0) return <div className="padding--little">No crosslinks found.</div>

    const sortedCrosslinks = _.sortBy(crosslinks, "pos_a")

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr" }}>
            <div style={{ ...cellStyle, fontWeight: 600 }}>Protein A</div>
            <div style={{ ...cellStyle, fontWeight: 600 }}>Pos A</div>
            <div style={{ ...cellStyle, fontWeight: 600 }}>Protein B</div>
            <div style={{ ...cellStyle, fontWeight: 600 }}>Pos B</div>
            <div style={{ ...cellStyle, fontWeight: 600 }}>Score</div>
            {sortedCrosslinks.map((xl, i) => {
    const isDropped = droppedTags.has(xl.tag)
    const rowStyle = {
        ...cellStyle,
        backgroundColor: isDropped ? "#fff6d6" : undefined,
    }
    return (
        <div key={`${xl.tag}-${i}`} style={{ display: "contents" }}>
            <div style={rowStyle}><ProteinGeneNameCell tag={xl.protein_tag_a} /></div>
            <div style={rowStyle}>{xl.pos_a}</div>
            <div style={rowStyle}><ProteinGeneNameCell tag={xl.protein_tag_b} /></div>
            <div style={rowStyle}>{xl.pos_b}</div>
            <div style={rowStyle}>
                {xl.score != null ? xl.score.toExponential(2) : "-"}
                {isDropped ? <span title="Not shown in the chart: position outside protein length" style={{ marginLeft: 4 }}></span> : null}
            </div>
        </div>
    )
})}
        </div>
    )
}