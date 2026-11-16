import { Callout, Dialog, DialogBody, Tag } from "@blueprintjs/core";
import { useState } from "react";
import _ from "lodash";
import { api } from "@/api";
import { APIAxiosError } from "@/comps/core/base/states/APIError";
import { AttributeInput } from "@/comps/core/input/api/AttributeInput";
import { TraitInput } from "@/comps/core/input/api/TraitInput";
import { downloadMetricsTemplate, parseMetricsFile } from "./ModularProcedureExecutionDialog";

/**
 * Dialog to set or update the measured well metrics (e.g. protein concentration) of an
 * existing procedure execution: pick the execution, define the measured attributes,
 * download the txt template (one column per attribute, one line per output well),
 * fill it in and upload it.
 */
export function ModularProcedureExecutionMetricsDialog({ procedure_tag, isOpen, onClose, onSaved }) {

    const { data: execution_tags } = api.modularProcedures.execute.useGetModularProcedureExecutions(
        { tag: procedure_tag }, { enabled: _.isString(procedure_tag) && isOpen })
    const [executionTag, setExecutionTag] = useState(null)
    const { data: execution, isError: executionIsError, error: executionError } =
        api.modularProcedures.execute.useGetModularProcedureExecution(
            { tag: executionTag }, { enabled: _.isString(executionTag) && isOpen })

    const [metricParams, setMetricParams] = useState([])  // [{attribute_tag, trait_tag}]
    const [metricAttributeTag, setMetricAttributeTag] = useState(null)
    const [wellMetrics, setWellMetrics] = useState([])     // [{position, trait_tag, value}]
    const [metricsError, setMetricsError] = useState(null)
    const { mutate: saveMetrics, isPending, isError, error } =
        api.modularProcedures.execute.useSetModularProcedureExecutionMetrics()

    const outputWells = execution?.output_wells || []
    const outputPositions = outputWells.map((well) => well.position)
    const existingMetrics = _.fromPairs(outputWells.map((well) => [well.position, well.metrics || {}]))

    const handleSelectExecution = (tag) => {
        setExecutionTag(tag)
        setWellMetrics({})
        setMetricsError(null)
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

    const handleSave = () => {
        saveMetrics({ tag: executionTag, well_metrics: wellMetrics }, {
            onSuccess: () => { if (onSaved) onSaved() }
        })
    }

    return <Dialog style={{ width: "min(900px,90vw)" }} isOpen={isOpen} onClose={onClose}
        title={`Well metrics : ${procedure_tag}`} canOutsideClickClose={false} canEscapeKeyClose={true}>
        <DialogBody>
            <div className="flex flex-column" style={{ gap: "0.75rem" }}>
                <label>
                    <div className="font-size--small">Execution</div>
                    <select className="text-input" value={executionTag || ""} onChange={(e) => handleSelectExecution(e.target.value || null)}>
                        <option value="">Select execution ...</option>
                        {execution_tags?.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
                    </select>
                </label>

                {executionTag === null ? <Callout intent="primary">
                    Select the execution whose output wells should receive measured values.
                </Callout> : null}
                {executionIsError ? <APIAxiosError error={executionError} /> : null}

                {executionTag !== null ? <>
                    <div className="flex center-items" style={{ gap: "0.5rem", flexWrap: "wrap" }}>
                        <h4 style={{ margin: 0 }}>Measured quantities</h4>
                        <AttributeInput text="Add metric attribute (e.g. Concentration)" onItemSelect={handleAddMetricAttribute} />
                        {metricAttributeTag !== null ?
                            <TraitInput attribute_tag={metricAttributeTag} text="Pick trait (e.g. ug/ul)"
                                onItemSelect={handleMetricTraitSelect} /> : null}
                        {metricParams.map((param) =>
                            <Tag key={param.trait_tag} minimal onRemove={() => handleRemoveMetricParam(param.trait_tag)}>
                                {param.trait_tag}
                            </Tag>)}
                    </div>

                    {metricParams.length > 0 ? <>
                        <div className="flex center-items" style={{ gap: "0.5rem" }}>
                            <button className="basic-button basic-button--small"
                                onClick={() => downloadMetricsTemplate(outputPositions, metricParams.map((p) => p.trait_tag),
                                    `well_metrics_${executionTag.slice(0, 8)}.txt`)}>
                                Download template ({outputPositions.length} wells)
                            </button>
                            <label className="basic-button basic-button--small" style={{ cursor: "pointer" }}>
                                Upload filled file
                                <input type="file" accept=".txt,.tsv,.csv" style={{ display: "none" }}
                                    onChange={handleMetricsUpload} />
                            </label>
                        </div>
                        <div className="font-size--small" style={{ color: "#888" }}>
                            The template has one header line (well + one column per trait, e.g. ug/ul) and one line per output well.
                            Fill in the values and upload the file — tab, comma and semicolon separators are all accepted.
                        </div>
                    </> : null}

                    {metricsError ? <div className="font-size--small" style={{ color: "#cd4246" }}>{metricsError}</div> : null}

                    {outputWells.length > 0 ? <div style={{ maxHeight: "30vh", overflowY: "auto" }}>
                        {outputWells.map((well) =>
                            <div key={well.position} className="flex center-items" style={{ gap: "0.5rem" }}>
                                <strong style={{ minWidth: "2.5rem" }}>{well.position}</strong>
                                <span className="font-size--small" style={{ color: "#888" }}>
                                    {well.sample_tags.length} sample(s)
                                </span>
                                {(wellMetrics.filter((m) => m.position === well.position).length > 0 || (well.metrics || []).length > 0) ?
                                    [...(well.metrics || []).map((m) => ({ ...m, existing: true })),
                                     ...wellMetrics.filter((m) => m.position === well.position)]
                                        .map((metric, index) =>
                                        <span key={`${metric.trait_tag}-${index}`} className="font-size--small">
                                            {metric.trait_tag}: <strong>{metric.value}</strong>
                                        </span>) :
                                    <span className="font-size--small" style={{ color: "#bbb" }}>no metrics</span>}
                            </div>)}
                    </div> : null}
                </> : null}

                {isError ? <APIAxiosError error={error} /> : null}
                <div className="flex center-items justify-end" style={{ gap: "1rem" }}>
                    <button disabled={isPending || executionTag === null || wellMetrics.length === 0}
                        className="basic-button basic-button--highlighted"
                        onClick={handleSave}>{isPending ? "Saving..." : "Save metrics"}</button>
                    <button disabled={isPending} className="basic-button" onClick={onClose}>Close</button>
                </div>
            </div>
        </DialogBody>
    </Dialog>
}
