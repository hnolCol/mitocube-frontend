import { useEffect, useState } from "react";
import _ from "lodash";
import { Dialog, DialogBody, DialogFooter, Button, Intent, Switch } from "@blueprintjs/core";
import "@/comps/core/plate/plate.css";
import { downloadTxtFile } from "@/services/downloads/txt";

/**
 * Reusable pieces of the modular procedure execution setup.
 * The former inline execution dialog was removed: executions are designed on the
 * dedicated setup page (`ExecutionSetupPage.jsx`) with backend-generated draft IDs.
 */

const rowLabel = (rowIndex) => String.fromCharCode(rowIndex + 65)
const positionOf = (rowIndex, columnIndex) => `${rowLabel(rowIndex)}${columnIndex + 1}`

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


/**
 * The sample -> well rows of one plate side of an execution: one row per placed sample with the
 * well it is in (wells on additional plates are plate-qualified), ordered row-wise over the
 * plates (A1, A2, ... then B1). The `execution` needs `input_wells` (with sample_tags and, for
 * drafts, output_positions) and/or `output_wells` (with the derived sample_tags).
 */
export function executionPlateRows(execution, side = "input") {
    const wells = side === "input" ? (execution.input_wells || []) : (execution.output_wells || [])
    const plates = _.uniq(wells.map((well) => well.plate_tag).filter(_.isString))
    const qualified = plates.length > 1
    const wellSortKey = (well) => {
        const position = well.position || ""
        const match = /^([A-Za-z]+)([0-9]+)$/.exec(position)
        const rowIndex = match ? match[1].toUpperCase().split("").reduce((acc, char) => acc * 26 + (char.charCodeAt(0) - 64), 0) : 0
        const columnIndex = match ? _.toInteger(match[2]) : 0
        return `${well.plate_tag || ""}|${rowIndex}|${columnIndex}`
    }
    const rows = []
    _.sortBy(wells, wellSortKey).forEach((well) => {
        (well.sample_tags || []).forEach((sample_tag) =>
            rows.push({ sample_tag, well: qualified && well.plate_tag ? `${well.plate_tag}:${well.position}` : well.position }))
    })
    return rows
}

/**
 * Downloads one plate side of an execution like the runlist export: an info header (procedure,
 * execution, plates, side) followed by a tab-delimited `sample_tag -> well` table. `scramble`
 * only randomizes the order of the rows in the file — never the sample-to-well mapping.
 */
export function downloadExecutionPlate({ execution, side = "input", scramble = false }) {
    const rows = executionPlateRows(execution, side)
    const ordered = scramble ? _.shuffle(rows) : rows
    const plates = side === "input" ? (execution.input_plate_tags || [execution.input_plate_tag].filter(_.isString))
                                   : (execution.output_plate_tags || [execution.output_plate_tag].filter(_.isString))
    const infoLines = [
        `procedure_tag\t${execution.procedure_tag}`,
        `execution_tag\t${execution.tag}`,
        `${side}_plate_tags\t${plates.join(", ")}`,
        `side\t${side.toUpperCase()}`,
        `scrambled\t${scramble}`,
    ]
    const tableLines = ["sample_tag\twell", ...ordered.map((entry) => `${entry.sample_tag}\t${entry.well}`)]
    downloadTxtFile(`${infoLines.join("\n")}\n\n\n${tableLines.join("\n")}`,
        `execution-${side}-plate${plates.length > 1 ? "s" : ""}-${(plates[0] || "unknown").replace(/[^a-zA-Z0-9_-]/g, "")}.txt`)
}

/**
 * The plate export dialog: one row per sample with its well, like the runlist export, with an
 * optional scramble (random row order in the file only). Used on the execution setup page and
 * in the executions overview — the download is also available for running / finished executions.
 */
export function ExecutionPlateExportDialog({ isOpen, side, execution, onClose }) {
    const [scramble, setScramble] = useState(false)
    useEffect(() => { if (isOpen) setScramble(false) }, [isOpen])
    if (!isOpen || !_.isString(side)) return null
    return <Dialog title={`Export ${side} plate`} isOpen={isOpen} onClose={onClose}>
        <DialogBody>
            <div className="font-size--small" style={{ maxWidth: "420px" }}>
                Download the plate layout as a tab-delimited txt — one row per sample with the well it
                is in (sample_tag → well), like the runlist export.
            </div>
            <div style={{ margin: "0.75rem 0" }}>
                <Switch label="Scramble (download the sample rows in random order)"
                    checked={scramble}
                    onChange={(e) => setScramble(e.target.checked)} />
            </div>
            <div className="font-size--smallest" style={{ color: "#888" }}>
                Scrambling only shuffles the order of the rows in the file — the mapping of the
                samples to their wells in this execution is never changed.
            </div>
        </DialogBody>
        <DialogFooter actions={<>
            <Button text="Cancel" onClick={onClose} />
            <Button intent={Intent.PRIMARY} icon="download" text="Download"
                onClick={() => { downloadExecutionPlate({ execution, side, scramble }); onClose() }} />
        </>} />
    </Dialog>
}
