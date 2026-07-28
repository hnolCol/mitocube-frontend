import _ from "lodash"
import { useMemo } from "react"
import { api } from "@/api"
import { usePrefetchProteins } from "@/api/orchestrated/proteins"
import { Icon } from "@blueprintjs/core"

function ProteinGeneNameCell({ tag }) {
    const { data: protein } = api.features.proteinsQuery.useGetProteinByTag(
        { tag }, { enabled: Boolean(tag), staleTime: Infinity }
    )
    return <>{protein?.gene_name || tag}</>
}

const cellStyle = { border: "0.5px solid black", padding: "6px 10px", textAlign: "center" }

function downloadCrosslinksTxt(crosslinks, protein_tag, geneNameByTag, showSource) {
    const resolve = (tag) => geneNameByTag[tag] || tag
    const headerCols = ["Protein A", "Pos A", "Protein B", "Pos B", "Score"]
    if (showSource) headerCols.push("Source")
    const header = headerCols.join("\t")

    const rows = crosslinks.map(xl => {
        const cols = [resolve(xl.protein_tag_a), xl.pos_a, resolve(xl.protein_tag_b), xl.pos_b, xl.score != null ? xl.score : ""]
        if (showSource) cols.push(xl.resource_title || "")
        return cols.join("\t")
    })
    const content = [header, ...rows].join("\n")

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `crosslinks_${protein_tag}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}

export function CrosslinksTable({ protein_tag, resource_tag, droppedTags = new Set(), focusedPartnerTag = null, visiblePartnerTags = null }) {
    const { data: crosslinks, isLoading, isError, isSuccess } =
        api.crosslinks.crosslinks.useGetCrosslinksByProteinTag(
            { protein_tag, resource_tag },
            { enabled: Boolean(protein_tag) }
        )

    const showSource = !resource_tag 

    const partnerSet = _.isArray(visiblePartnerTags) ? new Set(visiblePartnerTags) : null

    const visibleCrosslinks = useMemo(() => {
        if (!_.isArray(crosslinks)) return []
        return crosslinks.filter(xl => {
            const isSelfLink = xl.protein_tag_a === xl.protein_tag_b
            if (isSelfLink) return true
            if (focusedPartnerTag) {
                return xl.protein_tag_a === focusedPartnerTag || xl.protein_tag_b === focusedPartnerTag
            }
            if (partnerSet) {
                const partner = xl.protein_tag_a === protein_tag ? xl.protein_tag_b : xl.protein_tag_a
                return partnerSet.has(partner)
            }
            return true
        })
    }, [crosslinks, focusedPartnerTag, partnerSet, protein_tag])

    const sortedCrosslinks = useMemo(() => _.sortBy(visibleCrosslinks, "pos_a"), [visibleCrosslinks])

    const allTags = useMemo(() => {
        const tags = new Set()
        sortedCrosslinks.forEach(xl => {
            tags.add(xl.protein_tag_a)
            tags.add(xl.protein_tag_b)
        })
        return Array.from(tags)
    }, [sortedCrosslinks])

    const { tagQueries } = usePrefetchProteins(allTags)

    const geneNameByTag = useMemo(() => {
        const map = {}
        allTags.forEach((t, idx) => {
            const q = tagQueries[idx]
            if (q?.data) map[t] = q.data.gene_name ?? t
        })
        return map
    }, [allTags, tagQueries])

    if (isLoading) return <div className="padding--little">Loading crosslinks...</div>
    if (isError) return <div className="padding--little">Error loading crosslinks.</div>
    if (!isSuccess || crosslinks.length === 0) return <div className="padding--little">No crosslinks found.</div>
    if (sortedCrosslinks.length === 0) return <div className="padding--little">No crosslinks found for this partner.</div>

    const gridCols = showSource ? "1fr 1fr 1fr 1fr 1fr 1.4fr" : "1fr 1fr 1fr 1fr 1fr"

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 6 }}>
                <button
                    className="basic-button"
                    onClick={() => downloadCrosslinksTxt(sortedCrosslinks, protein_tag, geneNameByTag, showSource)}
                >
                    <Icon icon="download" /> Download .txt
                </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: gridCols }}>
                <div style={{ ...cellStyle, fontWeight: 600 }}>Protein A</div>
                <div style={{ ...cellStyle, fontWeight: 600 }}>Pos A</div>
                <div style={{ ...cellStyle, fontWeight: 600 }}>Protein B</div>
                <div style={{ ...cellStyle, fontWeight: 600 }}>Pos B</div>
                <div style={{ ...cellStyle, fontWeight: 600 }}>Score</div>
                {showSource ? <div style={{ ...cellStyle, fontWeight: 600 }}>Source</div> : null}
                {sortedCrosslinks.map((xl, i) => {
                    const isDropped = droppedTags.has(xl.tag)
                    const rowStyle = { ...cellStyle, backgroundColor: isDropped ? "#fff6d6" : undefined }
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
                            {showSource ? (
                                <div style={{ ...rowStyle, fontSize: 11 }} title={xl.resource_title || ""}>
                                    {xl.resource_title || "\u2014"}
                                </div>
                            ) : null}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}