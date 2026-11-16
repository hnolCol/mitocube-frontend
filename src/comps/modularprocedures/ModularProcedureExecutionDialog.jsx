import { Callout, Dialog, DialogBody, Tag } from "@blueprintjs/core";
import { useEffect, useMemo, useState } from "react";
import _ from "lodash";
import { api } from "@/api";
import { apiClient } from "@/api/client";
import { APIAxiosError } from "@/comps/core/base/states/APIError";
import { ConditionApplicationInput } from "@/comps/core/input/api/ConditionApplicationInput";
import { UserInput } from "@/comps/core/input/api/UserInput";
import { AttributeInput } from "@/comps/core/input/api/AttributeInput";
import { TraitInput } from "@/comps/core/input/api/TraitInput";
import { PlateCreateDialog } from "@/comps/admin/plates/PlateCreateDialog";

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

/**
 * Dialog to execute a published modular procedure on a set of samples:
 * select the input and output plates, place samples on the input plate,
 * map input wells to output wells (pooling and splitting supported),
 * assign condition applications to output wells, pick the responsible user
 * and optionally upload measured well metrics (e.g. protein concentration).
 */
export function ModularProcedureExecutionDialog({ procedure_tag, isOpen, onClose, onExecuted, current_user_tag }) {

    const { data: procedure } = api.modularProcedures.query.useGetModularProcedureByTag(
        { tag: procedure_tag }, { enabled: _.isString(procedure_tag) && isOpen })
    const { data: submissions } = api.modularProcedures.query.useGetModularProcedureSubmissions(
        { tag: procedure_tag }, { enabled: _.isString(procedure_tag) && isOpen })
    const { data: plates } = api.plates.plates.useGetPlates()

    const [inputPlateTag, setInputPlateTag] = useState(null)
    const [outputPlateTag, setOutputPlateTag] = useState(null)
    const [createPlateOpen, setCreatePlateOpen] = useState(false)
    const [availableSamples, setAvailableSamples] = useState([])
    const [pickedSample, setPickedSample] = useState(null)
    const [inputWells, setInputWells] = useState({})
    const [selectedInputWell, setSelectedInputWell] = useState(null)
    const [outputWells, setOutputWells] = useState({})
    const [selectedOutputWell, setSelectedOutputWell] = useState(null)
    const [responsibleUserTags, setResponsibleUserTags] = useState([])
    const [metricParams, setMetricParams] = useState([])  // [{attribute_tag, trait_tag}]
    const [metricAttributeTag, setMetricAttributeTag] = useState(null)
    const [wellMetrics, setWellMetrics] = useState([])     // [{position, trait_tag, value}]
    const [metricsError, setMetricsError] = useState(null)

    const { mutate: execute, isPending, isError, error } = api.modularProcedures.execute.useExecuteModularProcedure()

    const inputPlate = useMemo(() => _.find(plates, { tag: inputPlateTag }), [plates, inputPlateTag])
    const outputPlate = useMemo(() => _.find(plates, { tag: outputPlateTag }), [plates, outputPlateTag])

    const fetchSamples = () => {
        if (!isOpen || !_.isArray(submissions)) return
        let cancelled = false
        Promise.all(submissions.map((link) =>
            apiClient.get(`/submissions/${link.submission_tag}/samples`)
                .then((res) => _.isArray(res.data) ? res.data : [])
                .catch(() => [])
        )).then((results) => {
            if (!cancelled) setAvailableSamples(_.flatten(results))
        })
        return () => { cancelled = true }
    }
    useEffect(fetchSamples, [isOpen, submissions])

    useEffect(() => {
        if (isOpen && current_user_tag) setResponsibleUserTags([current_user_tag])
    }, [isOpen, current_user_tag])

    const placeSample = (position) => {
        setInputWells((prev) => {
            const samples = prev[position]?.sample_tags || []
            if (samples.includes(pickedSample)) return prev
            return { ...prev, [position]: { sample_tags: [...samples, pickedSample], output_positions: prev[position]?.output_positions || [] } }
        })
    }

    const handleInputWellClick = (position) => {
        setSelectedOutputWell(null)
        if (pickedSample !== null) {
            placeSample(position)
            return
        }
        if (_.has(inputWells, position)) {
            setSelectedInputWell(selectedInputWell === position ? null : position)
        }
    }

    const handleClearInputWell = (position) => {
        setInputWells((prev) => _.omit(prev, position))
        if (selectedInputWell === position) setSelectedInputWell(null)
    }

    const toggleOutputMapping = (position) => {
        if (selectedInputWell === null) return false
        const inputWell = inputWells[selectedInputWell]
        const mapped = inputWell?.output_positions || []
        const outputPositions = mapped.includes(position) ?
            mapped.filter((p) => p !== position) : [...mapped, position]
        setInputWells((prev) => ({ ...prev, [selectedInputWell]: { ...inputWell, output_positions: outputPositions } }))
        const hasOtherSources = _.some(inputWells, (well, p) =>
            p !== selectedInputWell && (well.output_positions || []).includes(position))
        if (outputPositions.length > 0 || hasOtherSources) {
            setOutputWells((prev) => ({ ...prev, [position]: prev[position] || { condition_application_tags: [] } }))
        } else {
            setOutputWells((prev) => _.omit(prev, position))
            if (selectedOutputWell === position) setSelectedOutputWell(null)
        }
        return true
    }

    const handleOutputWellClick = (position) => {
        if (toggleOutputMapping(position)) return
        setSelectedOutputWell(selectedOutputWell === position ? null : position)
    }

    const handleOutputWellRightClick = (position) => {
        if (selectedInputWell !== null) {
            toggleOutputMapping(position)
            return
        }
        setOutputWells((prev) => _.omit(prev, position))
        if (selectedOutputWell === position) setSelectedOutputWell(null)
    }

    const handleAddConditionApplication = (ca_tag) => {
        if (selectedOutputWell === null) return
        setOutputWells((prev) => {
            const well = prev[selectedOutputWell] || { condition_application_tags: [] }
            if (well.condition_application_tags.includes(ca_tag)) return prev
            return { ...prev, [selectedOutputWell]: { condition_application_tags: [...well.condition_application_tags, ca_tag] } }
        })
    }

    const handleAddMetricAttribute = (attribute_tag) => setMetricAttributeTag(attribute_tag)

    const handleMetricTraitSelect = (trait_tag) => {
        if (trait_tag && metricAttributeTag) {
            setMetricParams((prev) => prev.some((p) => p.trait_tag === trait_tag) ? prev :
                [...prev, { attribute_tag: metricAttributeTag, trait_tag }])
        }
        setMetricAttributeTag(null)
    }

    const handleRemoveMetricParam = (trait_tag) => {
        setMetricParams((prev) => prev.filter((p) => p.trait_tag !== trait_tag))
        setWellMetrics((prev) => prev.filter((m) => m.trait_tag !== trait_tag))
    }

    const handleMetricsUpload = (event) => {
        setMetricsError(null)
        const file = event.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => {
            try {
                const parsed = parseMetricsFile(String(reader.result), metricParams.map((p) => p.trait_tag))
                const outputPositions = _.keys(outputWells)
                const unknown = parsed.map((m) => m.position).filter((position) => !outputPositions.includes(position))
                if (unknown.length > 0)
                    throw new Error(`Wells in the file are not output wells of this execution: ${unknown.join(", ")}`)
                setWellMetrics((prev) => [
                    ...prev.filter((m) => !parsed.some((p) => p.position === m.position && p.trait_tag === m.trait_tag)),
                    ...parsed])
            } catch (e) {
                setMetricsError(e.message)
            }
        }
        reader.readAsText(file)
        event.target.value = ""
    }

    const handleAutoMap = () => {
        const outputRows = outputPlate?.rows || 0
        const outputColumns = outputPlate?.columns || 0
        setInputWells((prev) => {
            const next = { ...prev }
            _.forEach(prev, (well, position) => {
                const [rowIndex, columnIndex] = [position.charCodeAt(0) - 65, _.toInteger(position.slice(1)) - 1]
                if (rowIndex < outputRows && columnIndex < outputColumns && (well.output_positions || []).length === 0) {
                    next[position] = { ...well, output_positions: [position] }
                }
            })
            return next
        })
        setOutputWells((prev) => {
            const next = { ...prev }
            _.forEach(inputWells, (well, position) => {
                const [rowIndex, columnIndex] = [position.charCodeAt(0) - 65, _.toInteger(position.slice(1)) - 1]
                if (rowIndex < outputRows && columnIndex < outputColumns && (well.output_positions || []).length === 0) {
                    next[position] = next[position] || { condition_application_tags: [] }
                }
            })
            return next
        })
    }

    const handleExecute = () => {
        const input_wells = _.map(inputWells, (well, position) => ({
            position, sample_tags: well.sample_tags, output_positions: well.output_positions || []
        }))
        const output_wells = _.map(outputWells, (well, position) => ({
            position, condition_application_tags: well.condition_application_tags || []
        }))
        const output_well_metrics = wellMetrics
        execute({ tag: procedure_tag, input_plate_tag: inputPlateTag, output_plate_tag: outputPlateTag,
                  responsible_user_tag: responsibleUserTags[0], input_wells, output_wells, output_well_metrics }, {
            onSuccess: () => { if (onExecuted) onExecuted() }
        })
    }

    const placedSamples = _.flatten(_.map(inputWells, (well) => well.sample_tags))
    const unplacedSamples = availableSamples.filter((sample) => !placedSamples.includes(sample))
    const unmappedWells = _.filter(inputWells, (well) => (well.output_positions || []).length === 0).length
    const canExecute = inputPlateTag !== null && outputPlateTag !== null &&
        _.size(inputWells) > 0 && unmappedWells === 0
    const executeDisabledReason = inputPlateTag === null || outputPlateTag === null ?
        "Select the input and output plates." :
        _.size(inputWells) === 0 ? "Place at least one sample on the input plate." :
        unmappedWells > 0 ? `${unmappedWells} input well(s) are not mapped to an output well.` : null

    return <Dialog style={{ width: "min(1250px,90vw)" }} isOpen={isOpen} onClose={onClose}
        title={`Execute : ${procedure?.title || procedure_tag}`} canOutsideClickClose={false} canEscapeKeyClose={true}>
        <DialogBody>
            <div className="flex flex-column" style={{ gap: "0.75rem" }}>
                <div className="flex" style={{ gap: "1rem", flexWrap: "wrap" }}>
                    <label>
                        <div className="font-size--small">Input plate</div>
                        <select className="text-input" value={inputPlateTag || ""} onChange={(e) => { setInputPlateTag(e.target.value || null); setInputWells({}); setSelectedInputWell(null) }}>
                            <option value="">Select plate ...</option>
                            {plates?.map((plate) => <option key={plate.tag} value={plate.tag}>{plate.name}</option>)}
                        </select>
                    </label>
                    <label>
                        <div className="font-size--small">Output plate</div>
                        <select className="text-input" value={outputPlateTag || ""} onChange={(e) => { setOutputPlateTag(e.target.value || null); setOutputWells({}); setSelectedOutputWell(null) }}>
                            <option value="">Select plate ...</option>
                            {plates?.map((plate) => <option key={plate.tag} value={plate.tag}>{plate.name}</option>)}
                        </select>
                    </label>
                    <div style={{ minWidth: "260px" }}>
                        <div className="font-size--small">Responsible user</div>
                        <UserInput selected_users={responsibleUserTags}
                            onUserSelect={(callbackKey, user_tag) => setResponsibleUserTags(user_tag ? [user_tag] : [])}
                            current_user_tag={current_user_tag}
                            label="Responsible" showLabel={false} isRequired={false} />
                    </div>
                    <div className="flex center-items" style={{ gap: "0.5rem", alignSelf: "end" }}>
                        <button className="basic-button basic-button--small" disabled={!inputPlate || !outputPlate}
                            onClick={handleAutoMap}>Auto-map 1:1</button>
                        <button className="basic-button basic-button--small" onClick={() => setCreatePlateOpen(true)}>Create new plate</button>
                    </div>
                </div>
                <PlateCreateDialog isOpen={createPlateOpen} onClose={() => setCreatePlateOpen(false)}
                    onCreated={() => setCreatePlateOpen(false)} />

                <Callout intent="primary">
                    <strong>1.</strong> Pick a sample and click input wells to place it (click several wells to split it).
                    <strong> 2.</strong> Click an occupied input well, then click or drag over output wells to map it —
                    several input wells onto the same output well = pooling.
                    <strong> 3.</strong> Click an output well and add condition applications to it.
                </Callout>
                <div className="flex" style={{ gap: "0.5rem", flexWrap: "wrap" }}>
                    <Tag minimal intent="success" icon="full-circle">input well with samples</Tag>
                    <Tag minimal intent="primary" icon="square">mapped output well</Tag>
                    <Tag minimal intent="warning" icon="selection">selected well</Tag>
                </div>

                <div className="flex" style={{ gap: "1rem", alignItems: "flex-start" }}>
                    <div style={{ width: "280px", maxHeight: "55vh", overflowY: "auto" }}>
                        <h4 style={{ margin: "0 0 0.5rem 0" }}>Samples {availableSamples.length > 0 ? `(${unplacedSamples.length} unplaced)` : ""}</h4>
                        {availableSamples.length === 0 ? <div className="font-size--small" style={{ color: "#888" }}>
                            No samples found. Assign submissions to this procedure first.
                        </div> : null}
                        {unplacedSamples.length === 0 && availableSamples.length > 0 ?
                            <div className="font-size--small" style={{ color: "#888" }}>All samples placed.</div> : null}
                        {unplacedSamples.map((sample) =>
                            <button key={sample} className="basic-button basic-button--small"
                                style={{ width: "100%", textAlign: "left", marginBottom: "0.25rem",
                                    background: pickedSample === sample ? "#48aff0" : undefined }}
                                onClick={() => setPickedSample(pickedSample === sample ? null : sample)}>
                                {sample}
                            </button>)}
                        {pickedSample !== null ?
                            <div className="font-size--small" style={{ color: "#48aff0", marginTop: "0.25rem" }}>
                                Placing "{pickedSample}" — click one or more input wells.
                            </div> : null}
                    </div>

                    <div>
                        <h4 style={{ margin: "0 0 0.5rem 0" }}>Input plate {inputPlate ? `(${inputPlate.name})` : ""}</h4>
                        {inputPlate ? <PlateGrid plate={inputPlate} wells={inputWells} selectedWell={selectedInputWell}
                            onWellClick={handleInputWellClick} onWellAltClick={handleClearInputWell}
                            renderWell={(well) => well ?
                                `${well.sample_tags.length} sample(s) → ${well.output_positions.length} out` : ""} /> :
                            <div className="font-size--small" style={{ color: "#888" }}>Select an input plate.</div>}
                        <div className="font-size--small" style={{ color: "#888", marginTop: "0.25rem" }}>
                            Right-click an input well to clear it.
                        </div>
                    </div>

                    <div>
                        <h4 style={{ margin: "0 0 0.5rem 0" }}>Output plate {outputPlate ? `(${outputPlate.name})` : ""}</h4>
                        {outputPlate ? <>
                            <PlateGrid plate={outputPlate} wells={outputWells} selectedWell={selectedOutputWell}
                                onWellClick={handleOutputWellClick} onWellAltClick={handleOutputWellRightClick}
                                paintMode={selectedInputWell !== null}
                                renderWell={(well) => well ? `${well.condition_application_tags.length} CA(s)` : ""} />
                            <div className="flex center-items" style={{ gap: "0.5rem", marginTop: "0.5rem" }}>
                                <ConditionApplicationInput
                                    selected_ca_tags={selectedOutputWell !== null ? outputWells[selectedOutputWell]?.condition_application_tags || [] : []}
                                    onSelect={handleAddConditionApplication}
                                    samples_only={false}
                                    placeholder={selectedOutputWell !== null ? `Add CA to ${selectedOutputWell}` : "Select an output well"} />
                            </div>
                            <div className="font-size--small" style={{ color: "#888", marginTop: "0.25rem" }}>
                                Right-click an output well to remove it (or to unmap the selected input well).
                            </div>
                        </> :
                            <div className="font-size--small" style={{ color: "#888" }}>Select an output plate.</div>}
                    </div>
                </div>

                <div style={{ borderTop: "1px solid #ddd", paddingTop: "0.5rem" }}>
                    <div className="flex center-items" style={{ gap: "0.5rem", flexWrap: "wrap" }}>
                        <h4 style={{ margin: 0 }}>Well metrics</h4>
                        <AttributeInput text="Add metric attribute (e.g. Concentration)" onItemSelect={handleAddMetricAttribute} />
                        {metricAttributeTag !== null ?
                            <TraitInput attribute_tag={metricAttributeTag} text="Pick trait (e.g. ug/ul)"
                                onItemSelect={handleMetricTraitSelect} /> : null}
                        {metricParams.map((param) =>
                            <Tag key={param.trait_tag} minimal onRemove={() => handleRemoveMetricParam(param.trait_tag)}>
                                {param.trait_tag}
                            </Tag>)}
                        {metricParams.length > 0 && _.size(outputWells) > 0 ? <>
                            <button className="basic-button basic-button--small"
                                onClick={() => downloadMetricsTemplate(_.keys(outputWells), metricParams.map((p) => p.trait_tag))}>
                                Download template
                            </button>
                            <label className="basic-button basic-button--small" style={{ cursor: "pointer" }}>
                                Upload data
                                <input type="file" accept=".txt,.tsv,.csv" style={{ display: "none" }}
                                    onChange={handleMetricsUpload} />
                            </label>
                        </> : null}
                    </div>
                    {metricsError ? <div className="font-size--small" style={{ color: "#cd4246", marginTop: "0.25rem" }}>{metricsError}</div> : null}
                    {metricParams.length === 0 ?
                        <div className="font-size--small" style={{ color: "#888", marginTop: "0.25rem" }}>
                            Optionally define measured quantities: pick an attribute (e.g. Concentration) and a trait
                            (e.g. ug/ul), download the txt template, fill in the values per well and upload it.
                            Metrics can also be added after the execution.
                        </div> : null}
                    {wellMetrics.length > 0 ? <div style={{ marginTop: "0.5rem", maxHeight: "20vh", overflowY: "auto" }}>
                        {wellMetrics.map((metric) =>
                            <div key={`${metric.position}-${metric.trait_tag}`} className="flex center-items" style={{ gap: "0.5rem" }}>
                                <strong style={{ minWidth: "2.5rem" }}>{metric.position}</strong>
                                <span className="font-size--small">
                                    {metric.trait_tag}: <strong>{metric.value}</strong>
                                </span>
                                <button className="basic-button basic-button--small"
                                    onClick={() => setWellMetrics((prev) => prev.filter((m) => m !== metric))}>Remove</button>
                            </div>)}
                    </div> : null}
                </div>

                {isError ? <APIAxiosError error={error} /> : null}
                <div className="flex center-items justify-between" style={{ gap: "1rem" }}>
                    <div className="font-size--small" style={{ color: "#888" }}>
                        {canExecute ? `${_.size(inputWells)} input well(s) → ${_.size(outputWells)} output well(s)` : executeDisabledReason}
                    </div>
                    <div className="flex center-items" style={{ gap: "1rem" }}>
                        <button disabled={isPending || !canExecute} className="basic-button basic-button--highlighted"
                            onClick={handleExecute}>{isPending ? "Executing..." : "Execute procedure"}</button>
                        <button disabled={isPending} className="basic-button" onClick={onClose}>Cancel</button>
                    </div>
                </div>
            </div>
        </DialogBody>
    </Dialog>
}

function PlateGrid({ plate, wells, selectedWell, onWellClick, onWellAltClick, renderWell, paintMode = false }) {
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
                    return <button key={position}
                        title={position}
                        className="basic-button basic-button--small"
                        style={{
                            width: "4.5rem", height: "2.6rem", fontSize: "0.6rem", padding: "0.1rem",
                            border: isSelected ? "2px solid #48aff0" : "1px solid #ccc",
                            background: well ? "#d8f3d8" : "#fff",
                            color: "#000", textAlign: "center", overflow: "hidden",
                            whiteSpace: "normal", cursor: paintMode ? "crosshair" : "pointer"
                        }}
                        onMouseDown={(e) => { if (e.button === 0) handleMouseDown(position) }}
                        onMouseEnter={() => handleMouseEnter(position)}
                        onMouseUp={handleMouseUp}
                        onClick={() => onWellClick(position)}
                        onContextMenu={(e) => { e.preventDefault(); if (onWellAltClick) onWellAltClick(position) }}>
                        <div><strong>{position}</strong></div>
                        <div>{renderWell(well)}</div>
                    </button>
                })}
            </div>)}
    </div>
}
