import { useEffect, useState } from "react";
import _ from "lodash";
import { Dialog, DialogBody, DialogFooter, Button, Intent, Switch } from "@blueprintjs/core";
import { Well as RunlistWell } from "@/comps/core/plate/wellplate";
import { downloadTxtFile } from "@/services/downloads/txt";

/**
 * Reusable pieces of the modular procedure execution setup.
 * The former inline execution dialog was removed: executions are designed on the
 * dedicated setup page (`ExecutionSetupPage.jsx`) with backend-generated draft IDs.
 */

const rowLabel = (rowIndex) => String.fromCharCode(rowIndex + 65)
const positionOf = (rowIndex, columnIndex) => `${rowLabel(rowIndex)}${columnIndex + 1}`

/**
 * Downloads a txt template for well metrics in the long format: one line per well and
 * selected trait pair (the value cell stays empty to be filled in) — header
 * `well<TAB>attribute_tag<TAB>trait_tag<TAB>value`. `traitSelection` is a list of
 * {attribute_tag, trait_tag} pairs, the trait selected as the unit to record the values in;
 * wells are repeated once per pair so several declared attributes are covered by one file.
 */
export function downloadMetricsTemplate(wellPositions, traitSelection, filename = "well_metrics_template.txt") {
    const pairs = _.isArray(traitSelection) ? traitSelection : []
    const lines = ["well\tattribute_tag\ttrait_tag\tvalue"]
    wellPositions.forEach((position) =>
        pairs.forEach(({ attribute_tag, trait_tag }) =>
            lines.push([position, attribute_tag, trait_tag, ""].join("\t"))))
    const linesOut = [lines[0], ...lines.slice(1).filter((line) => line.length > 0)]
    const blob = new Blob([linesOut.join("\n") + "\n"], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
}

/**
 * Parses an uploaded well metrics txt file (tab, semicolon or comma separated) in the
 * long format: a header line `well, attribute_tag, trait_tag, value` followed by one line
 * per measurement. Every trait must be one of the allowed (declared) trait tags and the
 * attribute tag must match the trait (checked against the traitToAttribute map); values
 * must be numbers. Returns {position, trait_tag, value} entries.
 */
export function parseMetricsFile(content, traitTags, traitToAttribute = {}) {
    const allowed = _.isArray(traitTags) ? traitTags : []
    const rows = content.split(/\r?\n/).map((line) => line.trim()).filter((line) => line.length > 0)
    if (rows.length < 2) throw new Error("The file must contain a header line and at least one well line.")
    const separator = ["\t", ";", ","].find((sep) => rows[0].includes(sep)) || "\t"
    const header = rows[0].split(separator).map((column) => column.trim().toLowerCase())
    if (header[0] !== "well" || header[1] !== "attribute_tag" || header[2] !== "trait_tag" || header[3] !== "value")
        throw new Error("The header must be 'well, attribute_tag, trait_tag, value' — download the template to get it.")
    const wellMetrics = []
    rows.slice(1).forEach((row) => {
        const cells = row.split(separator).map((cell) => cell.trim())
        if (cells.length < 4) throw new Error(`Incomplete line (well, attribute_tag, trait_tag and value expected): '${row}'`)
        const position = cells[0]
        if (!/^[A-Za-z]+[0-9]+$/.test(position)) throw new Error(`Invalid well position: ${position}`)
        const attribute_tag = cells[1]
        const trait_tag = cells[2]
        if (!allowed.includes(trait_tag))
            throw new Error(`Unknown trait '${trait_tag}' in well ${position} — use one of: ${allowed.join(", ")}`)
        if (_.has(traitToAttribute, trait_tag) && traitToAttribute[trait_tag] !== attribute_tag)
            throw new Error(`Trait '${trait_tag}' belongs to attribute '${traitToAttribute[trait_tag]}', ` +
                `but '${attribute_tag}' was given in well ${position}.`)
        const valueCell = cells.slice(3).join(separator)
        if (valueCell.length === 0) return
        const value = _.toNumber(valueCell)
        if (_.isNaN(value)) throw new Error(`Value '${valueCell}' for ${trait_tag} in well ${position} is not a number.`)
        wellMetrics.push({ position: position.toUpperCase(), trait_tag, value })
    })
    return wellMetrics
}

export function PlateGrid({ plate, wells, selectedWell, onWellClick, onWellAltClick, renderWell, paintMode = false,
                            isWellDisabled = null, onWellDrop = null, wellTitle = null, wellStyle = null }) {
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
    const noOp = () => {}

    return <div className="flex flex-column" style={{ gap: "2px" }} onMouseLeave={handleMouseUp}>
        {_.range(plate.rows).map((rowIndex) =>
            <div key={rowIndex} className="flex" style={{ gap: "2px" }}>
                <div style={{ width: "1.25rem", fontSize: "0.7rem", color: "#888" }}>{rowLabel(rowIndex)}</div>
                {_.range(plate.columns).map((columnIndex) => {
                    const position = positionOf(rowIndex, columnIndex)
                    const well = wells[position]
                    const isSelected = selectedWell === position
                    const disabled = isWellDisabled !== null && isWellDisabled(position)
                    const wellTooltip = wellTitle !== null && well ? wellTitle(position, well) : null
                    return <div key={position} title={disabled ? `${position} — already used`
                        : (wellTooltip !== null ? wellTooltip : position)}
                        style={{ position: "relative", opacity: disabled ? 0.75 : 1,
                            cursor: disabled ? "not-allowed" : (paintMode ? "crosshair" : "pointer") }}
                        onClick={() => { if (!disabled) onWellClick(position) }}
                        onDragOver={(e) => { if (onWellDrop !== null && !disabled) e.preventDefault() }}
                        onDrop={(e) => {
                            if (onWellDrop === null || disabled) return
                            e.preventDefault()
                            onWellDrop(position, e.dataTransfer.getData("text/plain"))
                        }}
                        onContextMenu={(e) => { e.preventDefault(); if (onWellAltClick && !disabled) onWellAltClick(position) }}>
                        <RunlistWell row={rowIndex} column={columnIndex} rowLabel={rowLabel(rowIndex)}
                            handleMouseDown={() => { if (!disabled) handleMouseDown(position) }}
                            handleMouseUp={noOp}
                            handleMouseEnter={() => { if (!disabled) handleMouseEnter(position) }}
                            handleMouseLeave={noOp}
                            selected={isSelected} />
                        {disabled ? <div style={{
                            position: "absolute", inset: 0, borderRadius: "50%", pointerEvents: "none",
                            border: "2px dashed #cd4246", background: "rgba(205, 66, 70, 0.15)" }} /> : null}
                        {well && wellStyle !== null && wellStyle(position, well) !== null ? <div style={{
                            position: "absolute", inset: 0, borderRadius: "50%", pointerEvents: "none",
                            ...wellStyle(position, well) }} /> : null}
                        {well ? <div style={{
                            position: "absolute", inset: 0, pointerEvents: "none",
                            display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                            <span style={{
                                transform: "scale(0.62)", transformOrigin: "bottom center", whiteSpace: "nowrap",
                                fontSize: "0.55rem", lineHeight: "0.75rem", color: "#1c2a1c",
                                display: "flex", alignItems: "center", gap: "1px" }}>
                                {renderWell(well, position)}
                            </span>
                        </div> : null}
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
