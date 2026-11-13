import { Callout, Dialog, DialogBody } from "@blueprintjs/core";
import { useEffect, useMemo, useState } from "react";
import _ from "lodash";
import { api } from "@/api";
import { apiClient } from "@/api/client";
import { APIAxiosError } from "@/comps/core/base/states/APIError";
import { ConditionApplicationInput } from "@/comps/core/input/api/ConditionApplicationInput";
import { PlateCreateDialog } from "@/comps/admin/plates/PlateCreateDialog";

const rowLabel = (rowIndex) => String.fromCharCode(rowIndex + 65)
const positionOf = (rowIndex, columnIndex) => `${rowLabel(rowIndex)}${columnIndex + 1}`

/**
 * Dialog to execute a published modular procedure on a set of samples:
 * select the input and output plates, place samples on the input plate,
 * map input wells to output wells (pooling and splitting supported) and
 * assign condition applications to output wells.
 */
export function ModularProcedureExecutionDialog({ procedure_tag, isOpen, onClose, onExecuted }) {

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

    const handleInputWellClick = (position) => {
        setSelectedOutputWell(null)
        if (pickedSample !== null) {
            setInputWells((prev) => {
                const samples = prev[position]?.sample_tags || []
                if (samples.includes(pickedSample)) return prev
                return { ...prev, [position]: { sample_tags: [...samples, pickedSample], output_positions: prev[position]?.output_positions || [] } }
            })
            setPickedSample(null)
            return
        }
        if (_.has(inputWells, position)) {
            const well = inputWells[position]
            setSelectedInputWell(selectedInputWell === position ? null : position)
        }
    }

    const handleClearInputWell = (position) => {
        setInputWells((prev) => _.omit(prev, position))
        setSelectedInputWell(null)
    }

    const handleOutputWellClick = (position) => {
        if (selectedInputWell !== null) {
            const inputWell = inputWells[selectedInputWell]
            const mapped = inputWell?.output_positions || []
            const outputPositions = mapped.includes(position) ?
                mapped.filter((p) => p !== position) : [...mapped, position]
            setInputWells((prev) => ({ ...prev, [selectedInputWell]: { ...inputWell, output_positions: outputPositions } }))
            const hasSources = _.some(inputWells, (well, p) =>
                p !== selectedInputWell && (well.output_positions || []).includes(position))
            if (outputPositions.length === 0 && !hasSources) {
                setOutputWells((prev) => _.omit(prev, position))
            } else {
                setOutputWells((prev) => ({ ...prev, [position]: prev[position] || { condition_application_tags: [] } }))
            }
            return
        }
        setSelectedOutputWell(selectedOutputWell === position ? null : position)
    }

    const handleAddConditionApplication = (ca_tag) => {
        if (selectedOutputWell === null) return
        setOutputWells((prev) => {
            const well = prev[selectedOutputWell] || { condition_application_tags: [] }
            if (well.condition_application_tags.includes(ca_tag)) return prev
            return { ...prev, [selectedOutputWell]: { condition_application_tags: [...well.condition_application_tags, ca_tag] } }
        })
    }

    const handleExecute = () => {
        const input_wells = _.map(inputWells, (well, position) => ({
            position, sample_tags: well.sample_tags, output_positions: well.output_positions || []
        }))
        const output_wells = _.map(outputWells, (well, position) => ({
            position, condition_application_tags: well.condition_application_tags || []
        }))
        execute({ tag: procedure_tag, input_plate_tag: inputPlateTag, output_plate_tag: outputPlateTag,
                  input_wells, output_wells }, {
            onSuccess: () => { if (onExecuted) onExecuted() }
        })
    }

    const placedSamples = _.flatten(_.map(inputWells, (well) => well.sample_tags))
    const unplacedSamples = availableSamples.filter((sample) => !placedSamples.includes(sample))
    const canExecute = inputPlateTag !== null && outputPlateTag !== null &&
        _.size(inputWells) > 0 && _.every(inputWells, (well) => (well.output_positions || []).length > 0)

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
                    <div className="flex center-items" style={{ gap: "0.5rem", alignSelf: "end" }}>
                        <button className="basic-button basic-button--small" onClick={() => setCreatePlateOpen(true)}>Create new plate</button>
                    </div>
                </div>
                <PlateCreateDialog isOpen={createPlateOpen} onClose={() => setCreatePlateOpen(false)}
                    onCreated={() => setCreatePlateOpen(false)} />

                <Callout intent="primary">
                    1. Pick a sample and click an input well to place it. 2. Click an occupied input well to select it,
                    then click output wells to map it (multiple output wells = splitting, several input wells into one = pooling).
                    3. Click an output well and add condition applications to it.
                </Callout>

                <div className="flex" style={{ gap: "1rem", alignItems: "flex-start" }}>
                    <div style={{ width: "280px", maxHeight: "55vh", overflowY: "auto" }}>
                        <h4 style={{ margin: "0 0 0.5rem 0" }}>Samples</h4>
                        {unplacedSamples.length === 0 ? <div className="font-size--small" style={{ color: "#888" }}>All samples placed.</div> : null}
                        {unplacedSamples.map((sample) =>
                            <button key={sample} className="basic-button basic-button--small"
                                style={{ width: "100%", textAlign: "left", marginBottom: "0.25rem",
                                    background: pickedSample === sample ? "#48aff0" : undefined }}
                                onClick={() => setPickedSample(pickedSample === sample ? null : sample)}>
                                {sample}
                            </button>)}
                    </div>

                    <div>
                        <h4 style={{ margin: "0 0 0.5rem 0" }}>Input plate {inputPlate ? `(${inputPlate.name})` : ""}</h4>
                        {inputPlate ? <PlateGrid plate={inputPlate} wells={inputWells} selectedWell={selectedInputWell}
                            onWellClick={handleInputWellClick} onWellAltClick={handleClearInputWell}
                            renderWell={(well) => well ? `${well.sample_tags.length} sample(s) → ${well.output_positions.length} out` : ""} /> :
                            <div className="font-size--small" style={{ color: "#888" }}>Select an input plate.</div>}
                    </div>

                    <div>
                        <h4 style={{ margin: "0 0 0.5rem 0" }}>Output plate {outputPlate ? `(${outputPlate.name})` : ""}</h4>
                        {outputPlate ? <>
                            <PlateGrid plate={outputPlate} wells={outputWells} selectedWell={selectedOutputWell}
                                onWellClick={handleOutputWellClick}
                                renderWell={(well) => well ? `${well.condition_application_tags.length} CA(s)` : ""} />
                            <div className="flex center-items" style={{ gap: "0.5rem", marginTop: "0.5rem" }}>
                                <ConditionApplicationInput
                                    selected_ca_tags={selectedOutputWell !== null ? outputWells[selectedOutputWell]?.condition_application_tags || [] : []}
                                    onSelect={handleAddConditionApplication}
                                    samples_only={false}
                                    placeholder={selectedOutputWell !== null ? `Add CA to ${selectedOutputWell}` : "Select an output well"} />
                            </div>
                        </> :
                            <div className="font-size--small" style={{ color: "#888" }}>Select an output plate.</div>}
                    </div>
                </div>

                {isError ? <APIAxiosError error={error} /> : null}
                <div className="flex center-items justify-end" style={{ gap: "1rem" }}>
                    <button disabled={isPending || !canExecute} className="basic-button basic-button--highlighted"
                        onClick={handleExecute}>{isPending ? "Executing..." : "Execute procedure"}</button>
                    <button disabled={isPending} className="basic-button" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </DialogBody>
    </Dialog>
}

function PlateGrid({ plate, wells, selectedWell, onWellClick, onWellAltClick, renderWell }) {
    return <div>
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
                            whiteSpace: "normal"
                        }}
                        onClick={() => onWellClick(position)}
                        onContextMenu={(e) => { e.preventDefault(); if (onWellAltClick) onWellAltClick(position) }}>
                        <div><strong>{position}</strong></div>
                        <div>{renderWell(well)}</div>
                    </button>
                })}
            </div>)}
        <div className="font-size--small" style={{ color: "#888", marginTop: "0.25rem" }}>
            Right-click an input well to clear it.
        </div>
    </div>
}
