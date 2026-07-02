import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import _ from "lodash"
import { api } from "@/api"
import { usePrefetchProteins, usePrefetchInterproFeatures } from "@/api/orchestrated/proteins"
import APIError from "../../core/error/APIerror"
import viz from "@mitocube/viz"

function PartnerCrosslinkFetcher({ tag, resource_tag, onData }) {
    
    const { data } = api.crosslinks.crosslinks.useGetCrosslinksByProteinTag(
        { protein_tag: tag, resource_tag },
        { enabled: Boolean(tag), staleTime: Infinity }
    )
    useEffect(() => {
        if (_.isArray(data)) onData(tag, data)
    }, [data, tag])
    return null
}

export function ProteinCrosslinkViewer({
    tag,
    resource_tag,
    limit = 20,
    partnerFilter = null,
    onPartnersChange = () => {},
    onDroppedTagsChange = () => {},
    focusedPartnerTag = null,
    onFocusPartner = () => {},
    showInterPartner = false,
}) {
    const [partnerCrosslinkMap, setPartnerCrosslinkMap] = useState({})
    const [selectedInterPartners, setSelectedInterPartners] = useState(new Set())
    const prevPartnerOrderRef = useRef(null)
    const prevDroppedRef = useRef(null)

    useEffect(() => {
        if (!showInterPartner) setSelectedInterPartners(new Set())
    }, [showInterPartner])

    const { data: crosslinks, isLoading, isFetching, isSuccess, isError, error } =
        api.crosslinks.crosslinks.useGetCrosslinksByProteinTag(
            { protein_tag: tag, resource_tag },
            { enabled: Boolean(tag) }
        )

    const partnerOrder = useMemo(() => {
        if (!_.isArray(crosslinks)) return []
        const counts = {}
        crosslinks.forEach(xl => {
            const partner = xl.protein_tag_a === tag ? xl.protein_tag_b : xl.protein_tag_a
            if (partner === tag) return
            counts[partner] = (counts[partner] || 0) + 1
        })
        return _.orderBy(Object.keys(counts), p => counts[p], "desc")
    }, [crosslinks, tag])

    const filteredPartnerOrder = useMemo(() => {
        if (focusedPartnerTag) return partnerOrder.filter(p => p === focusedPartnerTag)
        if (partnerFilter === null || partnerFilter === undefined) return partnerOrder
        if (partnerFilter.length === 0) return []
        const filterSet = new Set(partnerFilter)
        return partnerOrder.filter(p => filterSet.has(p))
    }, [partnerOrder, partnerFilter, focusedPartnerTag])

    const noFilterMatches = partnerFilter !== null && partnerFilter !== undefined && filteredPartnerOrder.length === 0

    const allTags = useMemo(() => {
        const base = [tag, ...filteredPartnerOrder]
        return limit ? base.slice(0, limit) : base
    }, [tag, filteredPartnerOrder, limit])

    const visiblePartnerTags = useMemo(() => allTags.filter(t => t !== tag), [allTags, tag])

    const { isReady: proteinsReady, tagQueries: proteinTagQueries } = usePrefetchProteins(allTags)
    const { tagQueries: featureTagQueries, isReady: featuresReady } = usePrefetchInterproFeatures(allTags)
    
    console.log(featureTagQueries, "domains")
    // features merged into proteinsByTag
    const proteinsByTag = useMemo(() => {
        const map = {}
        allTags.forEach((t, idx) => {
            const q = proteinTagQueries[idx]
            const fq = featureTagQueries[idx]
            if (q?.data) map[t] = {
                ...q.data,
                label: q.data.gene_name ?? t, 
                features: fq?.data ?? [], 
            }
        })
        return map
    }, [proteinTagQueries, featureTagQueries, allTags, featuresReady ])

    console.log(proteinsByTag, "proteinsByTag")


    const { isReady: allPartnersReady, tagQueries: allPartnerQueries } = usePrefetchProteins(partnerOrder)
    const allPartnersByTag = useMemo(() => {
        const map = {}
        partnerOrder.forEach((t, idx) => {
            const q = allPartnerQueries[idx]
            if (q?.data) map[t] = q.data
        })
        return map
    }, [allPartnerQueries, partnerOrder])

    useEffect(() => {
        if (!allPartnersReady) return
        const key = partnerOrder.join(",")
        if (prevPartnerOrderRef.current === key) return
        prevPartnerOrderRef.current = key
        onPartnersChange(partnerOrder.map(t => ({ tag: t, gene_name: allPartnersByTag[t]?.gene_name || t })))
    }, [allPartnersReady, partnerOrder, allPartnersByTag])

    const handlePartnerData = useCallback((t, data) => {
        setPartnerCrosslinkMap(prev => {
            if (prev[t] === data) return prev
            return { ...prev, [t]: data }
        })
    }, [])

    const interPartnerLinks = useMemo(() => {
        if (!showInterPartner) return []
        const partnerSet = new Set(visiblePartnerTags)
        const seen = new Set()
        const result = []
        Object.values(partnerCrosslinkMap).forEach(xls => {
            if (!_.isArray(xls)) return
            xls.forEach(xl => {
                const { protein_tag_a, protein_tag_b, pos_a, pos_b } = xl
                if (!partnerSet.has(protein_tag_a) || !partnerSet.has(protein_tag_b)) return
                if (protein_tag_a === protein_tag_b) return
                const key = [...[protein_tag_a, protein_tag_b].sort(), pos_a, pos_b].join("|")
                if (seen.has(key)) return
                seen.add(key)
                result.push(xl)
            })
        })
        return result
    }, [partnerCrosslinkMap, visiblePartnerTags, showInterPartner])

    const filteredInterPartnerLinks = useMemo(() => {
        if (selectedInterPartners.size === 0) return interPartnerLinks
        return interPartnerLinks.filter(l =>
            selectedInterPartners.has(l.protein_tag_a) || selectedInterPartners.has(l.protein_tag_b)
        )
    }, [interPartnerLinks, selectedInterPartners])

    const legendTypes = useMemo(() => {
        if (!focusedPartnerTag) return []
        const types = new Set()
        allTags.forEach(t => {
            const features = proteinsByTag[t]?.features
            if (!_.isArray(features)) return
            features.forEach(f => types.add(f.type))
        })
        return Array.from(types).sort()
    }, [proteinsByTag, allTags, focusedPartnerTag])

    const handleArcClick = useCallback((partnerTag) => {
        if (showInterPartner) {
            setSelectedInterPartners(prev => {
                const next = new Set(prev)
                next.has(partnerTag) ? next.delete(partnerTag) : next.add(partnerTag)
                return next
            })
        } else {
            onFocusPartner(focusedPartnerTag === partnerTag ? null : partnerTag)
        }
    }, [showInterPartner, focusedPartnerTag, onFocusPartner])

    const handleLayoutComputed = useCallback((layout) => {
        const key = [...layout.droppedTags].join(",")
        if (prevDroppedRef.current === key) return
        prevDroppedRef.current = key
        onDroppedTagsChange(layout.droppedTags)
    }, [onDroppedTagsChange])

    if (isLoading || isFetching) return <div>Loading...</div>
    if (isError) return <APIError error={error} />
    if (isSuccess && (!crosslinks || crosslinks.length === 0)) return <div className="padding--little">No crosslinks found for this protein.</div>
    if (!proteinsReady) return <div>Loading protein metadata...</div>
    if (noFilterMatches) return (
        <div className="padding--little" style={{ textAlign: "center", color: "#888", marginTop: 20 }}>
            No crosslinked partners found for the selected annotation.
        </div>
    )

    return (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ position: "relative", width: "100%", display: "flex", gap: 12, justifyContent: "center", alignItems: "flex-start" }}>

                {showInterPartner && visiblePartnerTags.map(t => (
                    <PartnerCrosslinkFetcher
                        key={t}
                        tag={t}
                        resource_tag={resource_tag}
                        onData={handlePartnerData}
                    />
                ))}

                {focusedPartnerTag && legendTypes.length > 0 && (
                    <div style={{
                        display: "flex", flexDirection: "column", gap: 6,
                        fontSize: 11, color: "#444", minWidth: 120,
                        paddingTop: 16, flexShrink: 0,
                    }}>
                        <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 12 }}>Features</div>
                        {legendTypes.map(type => (
                            <div key={type} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <div style={{
                                    width: 12, height: 12, borderRadius: 2, flexShrink: 0,
                                    backgroundColor: viz.colors.crosslinks.featureColor(type),
                                    opacity: 0.9,
                                }} />
                                <span style={{ textTransform: "capitalize" }}>{type.replace(/_/g, " ")}</span>
                            </div>
                        ))}
                    </div>
                )}

                <viz.charts.CrosslinkViewer
                    tag={tag}
                    crosslinks={crosslinks}
                    allTags={allTags}
                    proteinsByTag={proteinsByTag}
                    interPartnerLinks={filteredInterPartnerLinks}
                    focusedPartnerTag={focusedPartnerTag}
                    showInterPartner={showInterPartner}
                    selectedInterPartners={selectedInterPartners}
                    onArcClick={handleArcClick}
                    onLayoutComputed={handleLayoutComputed}
                    getLabelText={(t, protein) => protein?.gene_name ?? t}
                />
            </div>
        </div>
    )
}