import { useEffect, useRef, useState } from "react"

const CDN_URL = "https://3Dmol.org/build/3Dmol-min.js"
const DIM_COLOR = "#cccccc"

function useScriptLoader(src) {
    const [loaded, setLoaded] = useState(!!window.$3Dmol)

    useEffect(() => {
        if (window.$3Dmol) {
            setLoaded(true)
            return
        }
        const existing = document.querySelector(`script[src="${src}"]`)
        if (existing) {
            existing.addEventListener("load", () => setLoaded(true))
            return
        }
        const script = document.createElement("script")
        script.src = src
        script.async = true
        script.onload = () => setLoaded(true)
        document.body.appendChild(script)
    }, [src])

    return loaded
}

export function MoleculeViewer({ structures = [], selectedXlTag = null }) {
    // structures: [{ cifUrl, label, sites: [{ residue, color, xlTag }] }]
    const containerRef = useRef(null)
    const viewerRef = useRef(null)
    const scriptLoaded = useScriptLoader(CDN_URL)
    const [hoverInfo, setHoverInfo] = useState(null)

    const structureKey = structures
        .map(s => `${s.cifUrl}|${(s.sites || []).map(site => `${site.residue}:${site.color}`).join(",")}`)
        .join(";") + `|${selectedXlTag}`

    useEffect(() => {
        if (!scriptLoaded || !containerRef.current || structures.length === 0) return
        let disposed = false

        const viewer = window.$3Dmol.createViewer(containerRef.current, {
            backgroundColor: "white",
        })
        viewerRef.current = viewer

        Promise.all(structures.map(s => fetch(s.cifUrl).then(r => r.text())))
            .then((dataList) => {
                if (disposed) return

                let xOffset = 0
                const GAP = 30
                const zoomSelectors = []
                const modelLabelPositions = []

                dataList.forEach((data, modelIdx) => {
                    viewer.addModel(data, "cif")
                    const model = viewer.getModel(modelIdx)
                    const atoms = model.selectedAtoms({})
                    if (atoms.length === 0) return

                    if (xOffset > 0) {
                        atoms.forEach((a) => { a.x += xOffset })
                    }
                    const xs = atoms.map((a) => a.x)
                    const ys = atoms.map((a) => a.y)
                    const width = Math.max(...xs) - Math.min(...xs)
                    const topY = Math.max(...ys)
                    const centerX = (Math.max(...xs) + Math.min(...xs)) / 2

                    modelLabelPositions.push({ x: centerX, y: topY + 5, z: atoms[0].z, text: structures[modelIdx].label })

                    xOffset += width + GAP

                    viewer.setStyle({ model: modelIdx }, { cartoon: { color: "white" } })

                    const sites = structures[modelIdx].sites || []
                    sites.forEach((site) => {
                        const isSelected = !selectedXlTag || site.xlTag === selectedXlTag
                        const color = isSelected ? site.color : DIM_COLOR

                        viewer.setStyle(
                            { model: modelIdx, resi: [site.residue] },
                            isSelected
                                ? {
                                      cartoon: { color, thickness: 0.8 },
                                      stick: { color, radius: 0.35 },
                                      sphere: { color, scale: 0.35 },
                                  }
                                : { cartoon: { color, thickness: 0.3 }, stick: { color, radius: 0.12 } }
                        )

                        if (isSelected && selectedXlTag) {
                            viewer.addLabel(`${site.residue}`, {
                                position: { resi: site.residue, model: modelIdx },
                                fontColor: "white",
                                backgroundColor: color,
                                fontSize: 12,
                                showBackground: true,
                            })
                            zoomSelectors.push({ resi: site.residue, model: modelIdx })
                        }
                    })
                })

                modelLabelPositions.forEach((pos) => {
                    viewer.addLabel(pos.text, {
                        position: { x: pos.x, y: pos.y, z: pos.z },
                        fontColor: "#333",
                        backgroundColor: "white",
                        backgroundOpacity: 0.8,
                        fontSize: 14,
                        bold: true,
                        showBackground: true,
                    })
                })

                viewer.setHoverable(
                    {},
                    true,
                    (atom, viewerInstance, event) => {
                        if (!atom) return
                        const modelSites = structures[atom.model]?.sites || []
                        const site = modelSites.find(s => s.residue === atom.resi)
                        setHoverInfo({
                            resi: atom.resi,
                            resn: atom.resn,
                            label: structures[atom.model]?.label,
                            isCrosslinked: Boolean(site),
                            color: site?.color,
                            x: event.offsetX,
                            y: event.offsetY,
                        })
                    },
                    () => setHoverInfo(null)
                )

                if (selectedXlTag && zoomSelectors.length > 0) {
                    viewer.zoomTo({ or: zoomSelectors }, 800)
                } else {
                    viewer.zoomTo()
                }

                viewer.render()
            })
            .catch((err) => console.error("Failed to load structure(s):", err))

        return () => {
            disposed = true
        }
    }, [scriptLoaded, structureKey])

    const handleResetView = () => {
        if (viewerRef.current) {
            viewerRef.current.zoomTo()
            viewerRef.current.render()
        }
    }

    if (structures.length === 0) {
        return <div style={{ padding: 20, color: "#888", fontSize: 13 }}>No structure URL provided.</div>
    }
    if (!scriptLoaded) {
        return <div style={{ padding: 20, color: "#888", fontSize: 13 }}>Loading 3D viewer...</div>
    }

    return (
        <div style={{ position: "relative" }}>
            <div
                ref={containerRef}
                style={{
                    position: "relative", width: "100%", maxWidth: 900, height: 520,
                    border: "1px solid #e1e1e1", borderRadius: 6,
                }}
            />
            <button
                onClick={handleResetView}
                style={{
                    position: "absolute", top: 8, right: 8, zIndex: 5,
                    padding: "4px 10px", fontSize: 12, background: "white",
                    border: "1px solid #ccc", borderRadius: 4, cursor: "pointer",
                }}
            >
                Reset view
            </button>
            {hoverInfo && (
                <div
                    style={{
                        position: "absolute",
                        left: hoverInfo.x + 12,
                        top: hoverInfo.y + 12,
                        background: hoverInfo.isCrosslinked ? hoverInfo.color : "#333",
                        color: "white",
                        fontSize: 12,
                        padding: "4px 8px",
                        borderRadius: 4,
                        pointerEvents: "none",
                        whiteSpace: "nowrap",
                        zIndex: 10,
                    }}
                >
                    {hoverInfo.label ? `${hoverInfo.label} - ` : ""}{hoverInfo.resn} {hoverInfo.resi}
                </div>
            )}
        </div>
    )
}