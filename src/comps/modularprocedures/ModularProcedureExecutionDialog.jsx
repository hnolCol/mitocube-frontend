import { useEffect, useState } from "react";
import _ from "lodash";
import "@/comps/core/plate/plate.css";

/**
 * Reusable pieces of the modular procedure execution setup.
 * The former inline execution dialog was removed: executions are designed on the
 * dedicated setup page (`ExecutionSetupPage.jsx`) with backend-generated draft IDs.
 */

/**
 * Downloads a txt template for well metrics: one header line (well + one column per attribute)
 * and one line per well, ready to be filled in and uploaded again.
 */
export function downloadMetricsTemplate(wellPositions, traitTags, filename = "well_metrics_template.txt") {
    const lines = [["well", ...traitTags].join("\t")]
    wellPositions.forEach((position) => lines.push([position, ...traitTags.map(() => "")].join("\t")))
    const blob = new Blob([lines.join("\n") + "\n"], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
}

/**
 * Parses an uploaded well metrics txt file (tab, comma or semicolon separated).
 * The header line names the attribute tags; each following line is a well position
 * followed by one numeric value per attribute. Returns {position, values} entries.
 */
export function parseMetricsFile(content, traitTags) {
    const rows = content.split(/\r?\n/).map((line) => line.trim()).filter((line) => line.length > 0)
    if (rows.length < 2) throw new Error("The file must contain a header line and at least one well line.")
    const separator = [ "\t", ";", "," ].find((sep) => rows[0].includes(sep)) || "\t"
    const header = rows[0].split(separator).map((column) => column.trim())
    if (header[0].toLowerCase() !== "well") throw new Error("The first header column must be 'well'.")
    const columns = header.slice(1).map((trait_tag) => {
        if (!traitTags.includes(trait_tag))
            throw new Error(`Unknown trait in the header: ${trait_tag}`)
        return trait_tag
    })
    const wellMetrics = []
    rows.slice(1).forEach((row) => {
        const cells = row.split(separator).map((cell) => cell.trim())
        const position = cells[0]
        if (!/^[A-Za-z]+[0-9]+$/.test(position)) throw new Error(`Invalid well position: ${position}`)
        const values = []
        columns.forEach((trait_tag, index) => {
            const cell = cells[index + 1]
            if (cell.length === 0) return
            const value = _.toNumber(cell)
            if (_.isNaN(value)) throw new Error(`Value '${cell}' for ${trait_tag} in well ${position} is not a number.`)
            values.push({ trait_tag, value })
        })
        values.forEach((metric) => wellMetrics.push({ position: position.toUpperCase(), trait_tag: metric.trait_tag, value: metric.value }))
    })
    return wellMetrics
}

export function PlateGrid({ plate, wells, selectedWell, onWellClick, onWellAltClick, renderWell, paintMode = false,
                            isWellDisabled = null, onWellDrop = null }) {
    const [isPainting, setIsPainting] = useState(false)
    const handleMouseDown = (position) => { if (paintMode) { setIsPainting(true); onWellClick(position) } }
    const handleMouseEnter = (position) => { if (paintMode && isPainting) onWellClick(position) }
    const handleMouseUp = () => setIsPainting(false)
    useEffect(() => {
        if (!paintMode) return
        const stopPaint = () => setIsPainting(false)
        window.addEventListener("mouseup", stopPaint)
        return () => window.removeEventListener("mouseup", stopPaint)
    }, [paintMode])

    return <div className="flex flex-column" style={{ gap: "2px" }} onMouseLeave={handleMouseUp}>
        {_.range(plate.rows).map((rowIndex) =>
            <div key={rowIndex} className="flex" style={{ gap: "2px" }}>
                <div style={{ width: "1.25rem", fontSize: "0.7rem", color: "#888" }}>{rowLabel(rowIndex)}</div>
                {_.range(plate.columns).map((columnIndex) => {
                    const position = positionOf(rowIndex, columnIndex)
                    const well = wells[position]
                    const isSelected = selectedWell === position
                    const disabled = isWellDisabled !== null && isWellDisabled(position)
                    return <div key={position}
                        title={disabled ? `${position} — already used` : position}
                        className="well-border prevent-select"
                        style={{ cursor: disabled ? "not-allowed" : (paintMode ? "crosshair" : "pointer") }}
                        onMouseDown={(e) => { if (e.button === 0 && !disabled) handleMouseDown(position) }}
                        onMouseEnter={() => handleMouseEnter(position)}
                        onMouseUp={handleMouseUp}
                        onClick={() => { if (!disabled) onWellClick(position) }}
                        onDragOver={(e) => { if (onWellDrop !== null && !disabled) e.preventDefault() }}
                        onDrop={(e) => {
                            if (onWellDrop === null || disabled) return
                            e.preventDefault()
                            onWellDrop(position, e.dataTransfer.getData("text/plain"))
                        }}
                        onContextMenu={(e) => { e.preventDefault(); if (onWellAltClick && !disabled) onWellAltClick(position) }}>
                        <div className={`well__base bg--grey ${isSelected ? "well__base--selected" : ""}`}
                            style={{
                                width: "4.2rem", height: "2.4rem", fontSize: "0.6rem",
                                border: disabled ? "1px dashed #cd4246" : (isSelected ? "2px solid #48aff0" : "1px solid #ccc"),
                                background: disabled ? "#f2dede" : (well ? "#d8f3d8" : undefined),
                                color: disabled ? "#a06060" : undefined, textAlign: "center",
                                display: "flex", flexDirection: "column", justifyContent: "center", overflow: "hidden"
                            }}>
                            <div><strong>{position}</strong>{disabled ? " ✕" : ""}</div>
                            <div>{renderWell(well)}</div>
                        </div>
                    </div>
                })}
            </div>)}
    </div>
}
