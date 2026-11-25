import _ from "lodash"
import { useState, useEffect, useMemo } from "react"
import { useQueries } from "@tanstack/react-query"
import { useNavigate, useParams, useSearchParams } from "react-router"
import { Callout, Tag } from "@blueprintjs/core"
import { api } from "@/api"
import { apiClient } from "@/api/client"
import { APIAxiosError } from "@/comps/core/base/states/APIError"
import { ConditionApplicationInput } from "@/comps/core/input/api/ConditionApplicationInput"
import { SubmissionInput } from "@/comps/core/input/api/SubmissionInput"
import { UserInput } from "@/comps/core/input/api/UserInput"
import { AttributeInput } from "@/comps/core/input/api/AttributeInput"
import { PlateColorDot, getPlateColor } from "@/comps/core/plates/PlateColorDot"
import { PlateCreateDialog } from "@/comps/admin/plates/PlateCreateDialog"
import { ProcedureTitle, formatExecutionTime, ExecutionStateChip, TinyXButton, isUserAtLeast, STATE_CHANGE_ROLE }
    from "@/comps/modularprocedures/Shared"
import {
    PlateGrid, downloadMetricsTemplate, parseMetricsFile, ExecutionPlateExportDialog,
} from "@/comps/modularprocedures/ModularProcedureExecutionDialog"

const SUBMISSION_COLORS = ["#4051b5", "#238551", "#c87619", "#9d5bd2", "#48aff0", "#cd4246", "#8f99a8", "#2e7d32"]
const submissionColor = (index) => SUBMISSION_COLORS[index % SUBMISSION_COLORS.length]


/**
 * @description The execution setup page: a three column workflow in the style of the Organize and
 * Modular Processes tabs. LEFT: the input plate with all assigned submissions on top (each in its
 * color so the samples are recognizable on the plate), further submissions can be pooled in, the
 * responsible user is assigned. MIDDLE: the module console — the description of the modular
 * process, its optional parameters (the condition applications applied per output well) and the
 * per-well input values of the declared input attributes. RIGHT: the output plate. The setup is a
 * saved draft: it can be saved anytime and continued later, or started (full validation) directly.
 * @returns {JSX.Element} The setup page.
 */
function AttributeTitle({ attribute_tag }) {
    const { data: attribute } = api.attributes.queryAttributes.useGetAttribute(
        { tag: attribute_tag }, { enabled: _.isString(attribute_tag), staleTime: 300000, retry: false })
    return <span>{_.isObject(attribute) && _.isString(attribute.text) ? attribute.text : attribute_tag}</span>
}

export function ExecutionSetupPage() {
    const { execution_tag } = useParams()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const procedureFromQuery = searchParams.get("procedure")

    const { mutate: createDraft, isPending: createDraftIsPending, isError: createDraftIsError, error: createDraftError } =
        api.modularProcedures.execute.useCreateExecutionDraft()
    const { mutate: saveDraft, isPending: saveIsPending } = api.modularProcedures.execute.useSaveExecutionDraft()
    const { mutate: startDraft, isPending: startIsPending, isError: startIsError, error: startError } =
        api.modularProcedures.execute.useStartExecutionDraft()

    // entering without a draft tag: create one for the requested procedure and use it
    useEffect(() => {
        if (_.isString(execution_tag) || !_.isString(procedureFromQuery)) return
        createDraft({ tag: procedureFromQuery }, {
            onSuccess: (draftExecution) => navigate(`/modular-procedures/setup/${draftExecution.tag}`,
                { replace: true })
        })
    }, [execution_tag, procedureFromQuery])

    const { data: execution, isLoading, isError, error } = api.modularProcedures.execute.useGetModularProcedureExecution(
        { tag: execution_tag }, { enabled: _.isString(execution_tag), staleTime: 0 })
    const procedure_tag = execution?.procedure_tag || procedureFromQuery
    const { data: procedure } = api.modularProcedures.query.useGetModularProcedureByTag(
        { tag: procedure_tag }, { enabled: _.isString(procedure_tag), staleTime: 300000, retry: false })
    const { data: submissions, refetch: refetchSubmissions } = api.modularProcedures.query.useGetModularProcedureSubmissions(
        { tag: procedure_tag }, { enabled: _.isString(procedure_tag), staleTime: 30000, retry: false })
    const { mutate: unlinkSubmission } = api.modularProcedures.modify.useUnlinkModularProcedureFromSubmission()
    const { data: plates, refetch: refetchPlates } = api.plates.plates.useGetPlates()
    const [createPlateTarget, setCreatePlateTarget] = useState(null) // "input" | "output"

    const [inputPlateTag, setInputPlateTag] = useState(null)
    const [outputPlateTag, setOutputPlateTag] = useState(null)
    const [availableSamples, setAvailableSamples] = useState([])
    const [extraSubmissionTags, setExtraSubmissionTags] = useState([])
    const [pickedSample, setPickedSample] = useState(null)
    const [inputWells, setInputWells] = useState({})
    const [selectedInputWell, setSelectedInputWell] = useState(null)
    const [outputWells, setOutputWells] = useState({})
    const [selectedOutputWell, setSelectedOutputWell] = useState(null)
    const [responsibleUserTags, setResponsibleUserTags] = useState([])
    const [metricStates, setMetricStates] = useState({
        OUTPUT: { metrics: [] },
        INPUT: { metrics: [] },
    })
    const [metricErrors, setMetricErrors] = useState({ OUTPUT: null, INPUT: null })
    const [fillRowsFirst, setFillRowsFirst] = useState(true)
    const [exportDialogProps, setExportDialogProps] = useState({ isOpen: false, side: null })
    const [fillMessage, setFillMessage] = useState(null)
    const [savedMessage, setSavedMessage] = useState(null)
    const [started, setStarted] = useState(false)

    // respect occupied wells: wells that already hold a run (runlists) and output wells blocked by
    // other executions (running or kept blocked); drafts block nothing
    const { data: occupiedInputWells } = api.plates.plates.useGetPlateOccupied(
        { tag: inputPlateTag }, { enabled: _.isString(inputPlateTag), staleTime: 15000 })
    const { data: occupiedOutputRunlistWells } = api.plates.plates.useGetPlateOccupied(
        { tag: outputPlateTag }, { enabled: _.isString(outputPlateTag), staleTime: 15000 })
    const { data: occupiedOutputExecutionWells } = api.modularProcedures.execute.useGetProcedurePlateOccupied(
        { tag: outputPlateTag }, { enabled: _.isString(outputPlateTag), staleTime: 15000 })
    const inputWellDisabled = (position) => (_.isArray(occupiedInputWells) ? occupiedInputWells : [])
        .some((well) => well.position === position)
    const outputWellDisabled = (position) =>
        (_.isArray(occupiedOutputRunlistWells) ? occupiedOutputRunlistWells : []).some((well) => well.position === position)
        || (_.isArray(occupiedOutputExecutionWells) ? occupiedOutputExecutionWells : []).includes(position)

    const inputPlate = useMemo(() => _.find(plates, { tag: inputPlateTag }), [plates, inputPlateTag])
    const outputPlate = useMemo(() => _.find(plates, { tag: outputPlateTag }), [plates, outputPlateTag])

    // the measurable quantities are part of the module definition: the input/output attributes
    // declared by the procedure and their traits (the units). Nothing declared (e.g. a plain
    // digestion) - nothing to enter.
    const declaredAttributes = (side) => _.isArray(side === "INPUT" ?
        procedure?.input_attribute_tags : procedure?.output_attribute_tags) ?
        (side === "INPUT" ? procedure.input_attribute_tags : procedure.output_attribute_tags) : []
    const traitQueries = useQueries({
        queries: _.uniq([...declaredAttributes("INPUT"), ...declaredAttributes("OUTPUT")]).map((attribute_tag) => ({
            queryKey: ["traitsByTag", attribute_tag, 100],
            queryFn: () => apiClient.get(`/attributes/${attribute_tag}/traits`, { params: { tag: attribute_tag, limit: 100 } })
                .then((response) => response.data),
            staleTime: 300000, retry: false,
        }))
    })
    const traitsByAttribute = _.fromPairs(_.zip(_.uniq([...declaredAttributes("INPUT"), ...declaredAttributes("OUTPUT")]),
        traitQueries.map((query) => (_.isArray(query.data) ? query.data : []))))
    const sideTraitTags = (side) => _.flatten(declaredAttributes(side).map((attribute_tag) => traitsByAttribute[attribute_tag] || []))

    const plateMatches = (plate, format, type) =>
        (!format || plate?.format === format) &&
        (!type || (plate?.applications || []).some((application) => application.trait_text === type))
    const inputConstraint = { format: procedure?.input_plate_format, type: procedure?.input_plate_type }
    const outputConstraint = { format: procedure?.output_plate_format, type: procedure?.output_plate_type }
    const inputPlateOptions = (inputConstraint.format || inputConstraint.type) ?
        (plates || []).filter((plate) => plateMatches(plate, inputConstraint.format, inputConstraint.type)) : plates
    const outputPlateOptions = (outputConstraint.format || outputConstraint.type) ?
        (plates || []).filter((plate) => plateMatches(plate, outputConstraint.format, outputConstraint.type)) : plates

    // load the samples of the procedure's submissions + pooled extra submissions
    useEffect(() => {
        if (!_.isArray(submissions)) return
        let cancelled = false
        const allLinks = [
            ...submissions,
            ...extraSubmissionTags.map((tag) => ({ submission_tag: tag, submission_label: tag })),
        ]
        Promise.all(allLinks.map((link) =>
            apiClient.get(`/submissions/${link.submission_tag}/samples`)
                .then((res) => _.isArray(res.data) ? res.data : [])
                .catch(() => [])
                .then((tags) => tags.map((tag) => ({
                    tag, submission_tag: link.submission_tag,
                    submission_label: link.submission_label || link.submission_tag,
                })))
        )).then((results) => { if (!cancelled) setAvailableSamples(_.flatten(results)) })
        return () => { cancelled = true }
    }, [submissions, extraSubmissionTags])

    // load the saved design of the draft once
    const [loadedRevision, setLoadedRevision] = useState(null)
    useEffect(() => {
        if (!_.isObject(execution) || loadedRevision === execution) return
        setLoadedRevision(execution)
        setInputPlateTag(execution.input_plate_tag || null)
        setOutputPlateTag(execution.output_plate_tag || null)
        setInputWells(_.fromPairs((execution.input_wells || []).map((well) =>
            [well.position, { sample_tags: [...(well.sample_tags || [])], output_positions: [...(well.output_positions || [])] }])))
        setOutputWells(_.fromPairs((execution.output_wells || []).map((well) =>
            [well.position, { condition_application_tags: [...(well.condition_application_tags || [])] }])))
        setResponsibleUserTags(execution.responsible_user_tag ? [execution.responsible_user_tag] : [])
        const inputMetrics = (execution.input_well_metrics || [])
            .concat(_.flatten((execution.input_wells || []).map((well) => well.metrics || [])))
        const outputMetrics = _.flatten((execution.output_wells || []).map((well) => well.metrics || []))
        setMetricStates({
            INPUT: { metrics: inputMetrics.map((metric) => ({ position: metric.position, trait_tag: metric.trait_tag, value: metric.value })) },
            OUTPUT: { metrics: outputMetrics.map((metric) => ({ position: metric.position, trait_tag: metric.trait_tag, value: metric.value })) },
        })
    }, [execution, loadedRevision])

    // -------- handlers (same interaction semantics as the execution dialog) --------
    const handleInputWellClick = (position) => {
        if (inputWellDisabled(position)) return
        if (pickedSample !== null) {
            setInputWells((prev) => {
                const samples = prev[position]?.sample_tags || []
                if (samples.includes(pickedSample.tag)) return prev
                return { ...prev, [position]: { sample_tags: [...samples, pickedSample.tag], output_positions: prev[position]?.output_positions || [] } }
            })
            return
        }
        if (_.has(inputWells, position)) setSelectedInputWell(selectedInputWell === position ? null : position)
    }

    const handleInputWellDrop = (position, sample_tag) => {
        if (!_.isString(sample_tag) || sample_tag.length === 0) return
        if (inputWellDisabled(position)) return
        setInputWells((prev) => {
            const samples = prev[position]?.sample_tags || []
            if (samples.includes(sample_tag)) return prev
            return { ...prev, [position]: { sample_tags: [...samples, sample_tag], output_positions: prev[position]?.output_positions || [] } }
        })
    }

    const handleClearInputWell = (position) => {
        setInputWells((prev) => _.omit(prev, position))
        if (selectedInputWell === position) setSelectedInputWell(null)
    }

    const toggleOutputMapping = (position) => {
        if (outputWellDisabled(position)) return false
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
        if (selectedInputWell !== null) { toggleOutputMapping(position); return }
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

    const updateMetricState = (side, updater) =>
        setMetricStates((prev) => ({ ...prev, [side]: updater(prev[side]) }))

    const handleRemoveMetric = (side) => (metric) =>
        updateMetricState(side, (state) => ({ ...state, metrics: state.metrics.filter((m) => m !== metric) }))

    const sideWellPositions = (side) => _.keys(side === "OUTPUT" ? outputWells : inputWells)
    const sideWellName = (side) => side === "OUTPUT" ? "output" : "input"

    const handleMetricsUpload = (side) => (event) => {
        setMetricErrors((prev) => ({ ...prev, [side]: null }))
        const file = event.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => {
            try {
                const parsed = parseMetricsFile(String(reader.result), sideTraitTags(side))
                const wells = sideWellPositions(side)
                const unknown = parsed.map((m) => m.position).filter((position) => !wells.includes(position))
                if (unknown.length > 0)
                    throw new Error(`Wells in the file are not ${sideWellName(side)} wells of this execution: ${unknown.join(", ")}`)
                updateMetricState(side, (state) => ({
                    ...state,
                    metrics: [
                        ...state.metrics.filter((m) => !parsed.some((p) => p.position === m.position && p.trait_tag === m.trait_tag)),
                        ...parsed.map((metric) => ({ ...metric, side }))],
                }))
            } catch (e) {
                setMetricErrors((prev) => ({ ...prev, [side]: e.message }))
            }
        }
        reader.readAsText(file)
        event.target.value = ""
    }

    // runlist-style sample assignment: the samples (in submission order) fill the free input
    // wells row by row or column by column - the placements stay editable afterwards (drag &
    // drop, click, right-click clear), e.g. to correct a sample that was mixed up
    const handleFillFreeWells = (separate) => {
        if (!_.isObject(inputPlate)) return
        setFillMessage(null)
        const rows = inputPlate.rows || 0
        const columns = inputPlate.columns || 0
        const rowLabelOf = (rowIndex) => String.fromCharCode(rowIndex + 65)
        const positionsInOrder = fillRowsFirst ?
            _.flatten(_.range(rows).map((rowIndex) =>
                _.range(columns).map((columnIndex) => `${rowLabelOf(rowIndex)}${columnIndex + 1}`))) :
            _.flatten(_.range(columns).map((columnIndex) =>
                _.range(rows).map((rowIndex) => `${rowLabelOf(rowIndex)}${columnIndex + 1}`)))
        const freeWells = positionsInOrder.filter((position) =>
            !inputWellDisabled(position) && !(inputWells[position]?.sample_tags || []).length)
        const toPlace = _.flatten(submissionOrder.map((submission_tag) => unplacedBySubmission[submission_tag] || []))
        if (toPlace.length === 0) return
        // separate submissions: every submission starts in its own line (rows first: the next row
        // index, columns first: the next column - so the first samples all sit in row A)
        let assignments = null
        if (separate) {
            const lineOf = fillRowsFirst ?
                (position) => position.charCodeAt(0) - 65 :
                (position) => _.toInteger(position.slice(1)) - 1
            const freeByLine = {}
            freeWells.forEach((position) => {
                const line = lineOf(position)
                ;(freeByLine[line] = freeByLine[line] || []).push(position)
            })
            const maxLines = fillRowsFirst ? rows : columns
            const used = new Set()
            assignments = []
            let line = -1
            submissionOrder.forEach((submission_tag) => {
                const remaining = [...(unplacedBySubmission[submission_tag] || [])]
                if (remaining.length === 0) return
                line += 1
                while (remaining.length > 0 && line < maxLines) {
                    const candidates = (freeByLine[line] || []).filter((position) => !used.has(position))
                    if (candidates.length === 0) { line += 1; continue }
                    const take = Math.min(candidates.length, remaining.length)
                    for (let index = 0; index < take; index++) {
                        assignments.push([candidates[index], remaining[index].tag])
                        used.add(candidates[index])
                    }
                    remaining.splice(0, take)
                    if (remaining.length > 0) line += 1
                }
            })
        }
        const assignedPairs = separate ? assignments : freeWells.slice(0, toPlace.length).map((position, index) => [position, toPlace[index].tag])
        setInputWells((prev) => {
            const next = { ...prev }
            assignedPairs.forEach(([position, sample_tag]) => {
                next[position] = { sample_tags: [sample_tag], output_positions: next[position]?.output_positions || [] }
            })
            return next
        })
        if (toPlace.length > assignedPairs.length) {
            setFillMessage(`${assignedPairs.length} of ${toPlace.length} sample(s) placed — assign the remaining samples on further plates or move them manually.`)
        } else {
            setFillMessage(`Assigned ${toPlace.length} sample(s) filling ${fillRowsFirst ? "rows" : "columns"} first${separate ? " (separate submissions)" : ""}.`)
        }
    }

    // the pseudo execution handed to the shared plate export: the draft side data in the shape of
    // a stored execution (the output samples are derived from the transfer map)
    const exportExecution = () => {
        const outputSamples = {}
        _.forEach(inputWells, (well) => (well.output_positions || []).forEach((position) =>
            (well.sample_tags || []).forEach((tag) => {
                outputSamples[position] = outputSamples[position] || new Set()
                outputSamples[position].add(tag)
            })))
        return {
            procedure_tag, tag: (execution && execution.tag) || execution_tag,
            input_plate_tag: inputPlateTag, output_plate_tag: outputPlateTag,
            input_wells: _.map(inputWells, (well, position) => ({
                position, plate_tag: inputPlate.tag, sample_tags: well.sample_tags || [] })),
            output_wells: _.map(outputWells, (well, position) => ({
                position, plate_tag: outputPlate ? outputPlate.tag : undefined,
                sample_tags: [...(outputSamples[position] || [])] })),
        }
    }

    const handleClearPlacements = () => {
        setInputWells({})
        setSelectedInputWell(null)
        setFillMessage(null)
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
    }

    const handleAddExtraSubmission = (tag) => {
        if (!_.isString(tag) || tag.length === 0) return
        if (extraSubmissionTags.includes(tag) || (submissions || []).some((link) => link.submission_tag === tag)) return
        apiClient.get(`/submissions/${tag}/samples`)
            .then(() => setExtraSubmissionTags((prev) => prev.includes(tag) ? prev : [...prev, tag]))
            .catch(() => {})
    }
    const handleRemoveExtraSubmission = (tag) =>
        setExtraSubmissionTags((prev) => prev.filter((t) => t !== tag))

    // assigned (linked) submissions are unlinked from the procedure; extra pooled submissions are
    // only dropped from this execution setup - both right where they are listed
    const handleRemoveSubmission = (submission_tag) => {
        if (extraSubmissionTags.includes(submission_tag)) {
            handleRemoveExtraSubmission(submission_tag)
            return
        }
        if (!_.isString(procedure_tag)) return
        unlinkSubmission({ tag: procedure_tag, submission_tag }, { onSuccess: () => refetchSubmissions() })
    }

    const buildExecutionPayload = () => ({
        input_plate_tag: inputPlateTag, output_plate_tag: outputPlateTag,
        responsible_user_tag: responsibleUserTags[0],
        input_wells: _.map(inputWells, (well, position) => ({
            position, sample_tags: well.sample_tags, output_positions: well.output_positions || []
        })),
        output_wells: _.map(outputWells, (well, position) => ({
            position, condition_application_tags: well.condition_application_tags || []
        })),
        output_well_metrics: metricStates.OUTPUT.metrics.map((metric) => ({ ...metric, side: "OUTPUT" })),
        input_well_metrics: metricStates.INPUT.metrics.map((metric) => ({ ...metric, side: "INPUT" })),
    })

    const canExecute = inputPlateTag !== null && outputPlateTag !== null &&
        _.size(inputWells) > 0 && _.size(outputWells) > 0 &&
        _.every(inputWells, (well) => (well.output_positions || []).length > 0)

    const handleSave = () => {
        setSavedMessage(null)
        saveDraft({ tag: execution_tag, ...buildExecutionPayload() }, {
            onSuccess: () => setSavedMessage("Setup saved — continue anytime from the executions overview.")
        })
    }

    const handleStart = () => {
        setSavedMessage(null)
        saveDraft({ tag: execution_tag, ...buildExecutionPayload() }, {
            onSuccess: () => startDraft({ tag: execution_tag }, { onSuccess: () => setStarted(true) })
        })
    }

    // -------- derived view data --------
    const placedSampleTagSet = new Set(_.flatten(_.map(inputWells, (well) => well.sample_tags)))
    const sampleSubmissionIndex = {} // sample tag -> submission color index
    const submissionOrder = [...(submissions || []).map((link) => link.submission_tag), ...extraSubmissionTags]
    const submissionIndexOf = (submission_tag) => submissionOrder.indexOf(submission_tag)
    const sampleSubmissions = {} // sample tag -> submission tag
    availableSamples.forEach((sample) => { sampleSubmissions[sample.tag] = sample.submission_tag })
    const samplesOfSubmission = _.groupBy(availableSamples, "submission_tag")
    const unplacedBySubmission = _.fromPairs(submissionOrder.map((submission_tag) =>
        [submission_tag, (samplesOfSubmission[submission_tag] || []).filter((sample) => !placedSampleTagSet.has(sample.tag))]))
    const wellColorDots = (well) => {
        const tags = well.sample_tags || []
        const counts = _.countBy(tags.map((tag) => submissionIndexOf(sampleSubmissions[tag])))
        return tags.length === 0 ? null : <div className="flex center-items" style={{ gap: "0.15rem" }}>
            {Object.keys(counts).map((index) =>
                <span key={index} title={`${counts[index]} sample(s)`}
                    style={{ width: "0.45rem", height: "0.45rem", borderRadius: "50%", display: "inline-block",
                        background: submissionColor(_.toInteger(index)) }} />)}
        </div>
    }

    // the three columns share the full width of the parent equally and stretch to its full
    // height; each column scrolls its own content
    const columnStyle = {
        flex: "1 1 0", minWidth: 0, border: "1px solid #ccc", borderRadius: "6px",
        background: "#fafafa", padding: "0.75rem", overflowY: "auto", display: "flex",
        flexDirection: "column", minHeight: 0
    }

    const renderMetricsSection = (side, title) => {
        const state = metricStates[side]
        const positions = sideWellPositions(side)
        const attributes = declaredAttributes(side)
        if (attributes.length === 0) return null
        const attributeTags = attributes
        return <div style={{ borderTop: "1px dashed #ddd", marginTop: "0.5rem", paddingTop: "0.5rem" }}>
            <div className="font-size--small" style={{ fontWeight: 600 }}>{title}</div>
            <div className="font-size--smallest" style={{ color: "#888", margin: "0.25rem 0" }}>
                Declared by the module definition{positions.length > 0 ? " — download the template, fill in one line per well and upload it" : " — place the wells first to enter values"}.
            </div>
            {attributeTags.map((attribute_tag) =>
                <div key={attribute_tag} className="margin-top--little">
                    <span className="font-size--smallest" style={{ fontWeight: 600 }}><AttributeTitle attribute_tag={attribute_tag} />:</span>
                    <span className="flex flex--wrap" style={{ gap: "0.25rem" }}>
                        {(traitsByAttribute[attribute_tag] || []).map((trait_tag) =>
                            <Tag key={trait_tag} minimal>{trait_tag}</Tag>)}
                    </span>
                </div>)}
            {positions.length > 0 ? <div className="flex center-items flex--wrap" style={{ gap: "0.35rem", marginTop: "0.35rem" }}>
                <button className="basic-button basic-button--small"
                    onClick={() => downloadMetricsTemplate(positions, sideTraitTags(side))}>
                    Template
                </button>
                <label className="basic-button basic-button--small" style={{ cursor: "pointer" }}>
                    Upload data
                    <input type="file" accept=".txt,.tsv,.csv" style={{ display: "none" }}
                        onChange={handleMetricsUpload(side)} />
                </label>
            </div> : null}
            {metricErrors[side] ? <div className="font-size--small" style={{ color: "#cd4246" }}>{metricErrors[side]}</div> : null}
            {state.metrics.length > 0 ? <div style={{ marginTop: "0.35rem", maxHeight: "12vh", overflowY: "auto" }}>
                {state.metrics.map((metric) =>
                    <div key={`${metric.position}-${metric.trait_tag}`}
                        className="flex center-items justify-between" style={{ gap: "0.5rem" }}>
                        <span className="font-size--smallest"><strong>{metric.position}</strong> {metric.trait_tag}: {metric.value}</span>
                        <button className="basic-button basic-button--small"
                            onClick={() => handleRemoveMetric(side)(metric)}>×</button>
                    </div>)}
            </div> : null}
        </div>
    }

    if (!_.isString(execution_tag) && !_.isString(procedureFromQuery)) {
        return <div className="padding--medium">No procedure given for the execution setup.</div>
    }
    if (createDraftIsPending || (isLoading && _.isString(execution_tag))) {
        return <div className="padding--medium">Opening the execution setup ...</div>
    }
    if (createDraftIsError) return <div className="padding--medium"><APIAxiosError error={createDraftError} /></div>
    if (isError) return <div className="padding--medium"><APIAxiosError error={error} /></div>

    const handlePlateCreated = (createdPlate) => {
        setCreatePlateTarget(null)
        refetchPlates()
        if (_.isObject(createdPlate) && _.isString(createdPlate.tag)) {
            if (createPlateTarget === "input") setInputPlateTag(createdPlate.tag)
            if (createPlateTarget === "output") setOutputPlateTag(createdPlate.tag)
        }
    }

    return <div className="div--expand padding--medium">
        {createPlateTarget !== null ?
            <PlateCreateDialog isOpen={true}
                onClose={() => setCreatePlateTarget(null)}
                onCreated={handlePlateCreated} /> : null}
        {_.isObject(execution) && execution.status !== "DRAFT" || started ? <div className="flex flex-column align-center padding--large gap--medium">
            <h3>Execution started</h3>
            <p className="font-size--small" style={{ color: "#888" }}>
                The run {_.isObject(execution) ? execution.tag : execution_tag} is running — its outcome
                (successful / failed / aborted) is confirmed on the executions overview.
            </p>
            <button className="basic-button basic-button--highlighted"
                onClick={() => navigate("/modular-procedures/executions")}>To the executions overview</button>
        </div> :
        <>
        <div className="flex justify-between center-items" style={{ padding: "1rem" }}>
            <div>
                <h3 style={{ margin: 0 }}>Execution setup {_.isObject(execution) ?
                    <span className="font-size--small" style={{ color: "#888" }}>{execution.tag}</span> : null}</h3>
                <div className="flex center-items" style={{ gap: "0.5rem" }}>
                    <ProcedureTitle procedure_tag={procedure_tag} />
                    {_.isObject(execution) ? <ExecutionStateChip status={execution.status} /> : null}
                    {_.isObject(execution) ? <span className="font-size--smallest" style={{ color: "#888" }}>
                        created {formatExecutionTime(execution.created_at)}</span> : null}
                </div>
            </div>
            <div className="flex center-items" style={{ gap: "0.5rem" }}>
                <button disabled={saveIsPending || startIsPending}
                    className="basic-button" onClick={handleSave}>{saveIsPending ? "Saving..." : "Save setup"}</button>
                <button disabled={saveIsPending || startIsPending || !canExecute}
                    className="basic-button basic-button--highlighted" onClick={handleStart}>
                    {startIsPending ? "Starting..." : "Start execution"}</button>
            </div>
        </div>
        {savedMessage ? <Callout intent="success" style={{ margin: "0 1rem" }}>{savedMessage}</Callout> : null}
        {startIsError ? <div className="padding--medium"><APIAxiosError error={startError} /></div> : null}

        <div className="flex div--expand" style={{ gap: "1rem", alignItems: "stretch", padding: "1rem", minHeight: "60vh" }}>
            {/* ---------------- LEFT: input plate + assigned submissions ---------------- */}
            <div style={columnStyle}>
                <h4 style={{ margin: "0 0 0.25rem 0" }}>
                    <span style={{ color: inputPlateTag ? "#238551" : "#c87619" }}>① Input plate</span>
                    <span className="font-size--smallest" style={{ color: "#888" }}>
                        {inputPlateTag ? "" : " — select or design the plate the samples were placed on"}
                    </span>
                </h4>
                <div className="flex center-items" style={{ gap: "0.5rem" }}>
                    <select className="text-input" style={{ flex: 1 }} value={inputPlateTag || ""}
                        onChange={(e) => { setInputPlateTag(e.target.value || null); setSelectedInputWell(null) }}>
                        <option value="">Select an added plate ...</option>
                        {(inputPlateOptions || []).map((plate) =>
                            <option key={plate.tag} value={plate.tag}>{plate.name} ({plate.format})</option>)}
                    </select>
                    <button className="basic-button basic-button--small" onClick={() => setCreatePlateTarget("input")}>New</button>
                </div>
                {inputPlate ? <div className="font-size--smallest flex center-items" style={{ color: "#888", gap: "0.35rem", margin: "0.25rem 0" }}>
                    <PlateColorDot color={getPlateColor(inputPlate)} /> {inputPlate.name} · {inputPlate.format}
                </div> : null}

                <h4 style={{ margin: "0.75rem 0 0.25rem 0" }}>Assigned submissions</h4>
                {submissionOrder.map((submission_tag, index) => {
                    const unplaced = unplacedBySubmission[submission_tag] || []
                    return <div key={submission_tag} className="flex center-items justify-between"
                        style={{ gap: "0.5rem", padding: "0.2rem 0", borderBottom: "1px solid #eee" }}>
                        <span className="font-size--small flex center-items" style={{ gap: "0.35rem", minWidth: 0 }}>
                            <span style={{ width: "0.6rem", height: "0.6rem", borderRadius: "50%", display: "inline-block", flexShrink: 0,
                                background: submissionColor(index) }} />
                            {submission_tag}
                            {extraSubmissionTags.includes(submission_tag) ? <em className="font-size--smallest" style={{ color: "#888" }}>(added)</em> : null}
                        </span>
                        <span className="font-size--smallest" style={{ color: "#888", flexShrink: 0 }}>
                            {`${unplaced.length} of ${(samplesOfSubmission[submission_tag] || []).length} unplaced`}
                        </span>
                        <TinyXButton
                            title={extraSubmissionTags.includes(submission_tag) ?
                                `Drop ${submission_tag} from this execution` :
                                `Unlink ${submission_tag} from ${procedure?.title || procedure_tag}`}
                            onClick={() => handleRemoveSubmission(submission_tag)} />
                    </div>
                })}
                <div style={{ margin: "0.5rem 0" }}>
                    <SubmissionInput
                        selected_submission_tags={extraSubmissionTags}
                        onSelect={(tag) => handleAddExtraSubmission(tag)}
                        minimal={true} />
                </div>

                {inputPlate ? <>
                    <div style={{ marginTop: "0.5rem" }}>
                        <div className="font-size--small" style={{ fontWeight: 600, color: placedSampleTagSet.size > 0 ? "#238551" : "#c87619" }}>
                            ② Place the samples on the input plate
                        </div>
                        <div className="flex center-items flex--wrap" style={{ gap: "0.35rem", margin: "0.3rem 0" }}>
                            <div className="flex center-items" style={{ gap: "0.2rem" }}>
                                <button className={`basic-button basic-button--small ${fillRowsFirst ? "basic-button--highlighted" : ""}`}
                                    title="Fill A1, A2, A3 ... then B1, B2, B3"
                                    onClick={() => setFillRowsFirst(true)}>rows first</button>
                                <button className={`basic-button basic-button--small ${!fillRowsFirst ? "basic-button--highlighted" : ""}`}
                                    title="Fill A1, B1, C1 ... then A2, B2, C2"
                                    onClick={() => setFillRowsFirst(false)}>columns first</button>
                            </div>
                            <button className="basic-button basic-button--small"
                                title="Assign the unplaced samples (in submission order) to the free wells — like the runlist"
                                onClick={() => handleFillFreeWells(false)}>Fill empty wells</button>
                            <button className="basic-button basic-button--small"
                                title={`Each submission starts in its own ${fillRowsFirst ? "row" : "column"} — the first sample of every submission sits in ${fillRowsFirst ? "column 1" : "row A"}`}
                                onClick={() => handleFillFreeWells(true)}>Fill empty wells (separate submissions)</button>
                            {placedSampleTagSet.size > 0 ?
                                <button className="basic-button basic-button--small"
                                    onClick={handleClearPlacements}>Clear placements</button> : null}
                        </div>
                        {fillMessage ? <div className="font-size--smallest" style={{ color: "#c87619" }}>{fillMessage}</div> : null}
                        {pickedSample !== null ?
                            <div className="font-size--small" style={{ color: submissionColor(submissionIndexOf(pickedSample.submission_tag)) }}>
                                Placing "{pickedSample.tag}" — click one or more input wells
                                <button className="basic-button basic-button--small" style={{ marginLeft: "0.35rem" }}
                                    onClick={() => setPickedSample(null)}>unpick</button>
                            </div> :
                            <div className="font-size--smallest" style={{ color: "#888" }}>
                                {placedSampleTagSet.size} sample(s) placed — "Fill empty wells" assigns the samples in
                                submission order to the free wells (rows or columns first, like the runlist; "(separate
                                submissions)" starts every submission in its own row / column); afterwards
                                drag a sample onto a well (or click it, then wells) to change the placement, right-click
                                a well to clear it; crossed-out wells already hold a run.
                            </div>}
                        <div style={{ maxHeight: "18vh", overflowY: "auto" }}>
                            {submissionOrder.map((submission_tag, index) =>
                                (unplacedBySubmission[submission_tag] || []).map((sample) =>
                                    <button key={sample.tag} className="basic-button basic-button--small"
                                        title="Drag onto an input well, or click and then click wells"
                                        style={{ width: "100%", textAlign: "left", marginBottom: "0.15rem",
                                            borderLeft: `4px solid ${submissionColor(index)}`,
                                            background: pickedSample?.tag === sample.tag ? "#d8f0ff" : undefined,
                                            cursor: "grab" }}
                                        draggable={true}
                                        onDragStart={(e) => e.dataTransfer.setData("text/plain", sample.tag)}
                                        onClick={() => setPickedSample(pickedSample?.tag === sample.tag ? null : sample)}>
                                        {sample.tag}
                                    </button>))}
                        </div>
                    </div>
                    <PlateGrid plate={inputPlate} wells={inputWells} selectedWell={selectedInputWell}
                        onWellClick={handleInputWellClick} onWellAltClick={handleClearInputWell}
                        isWellDisabled={inputWellDisabled} onWellDrop={handleInputWellDrop}
                        renderWell={(well) => well && _.size(well.sample_tags) > 0 ?
                            <span className="flex center-items" style={{ gap: "0.15rem" }}>
                                <span className="font-size--smallest">{_.size(well.sample_tags)}</span>
                                {wellColorDots(well)}
                            </span> : ""} />
                    <div className="flex center-items flex--wrap" style={{ gap: "0.5rem", marginTop: "0.5rem" }}>
                        <button className="basic-button basic-button--small" onClick={handleAutoMap}>Auto-map 1:1</button>
                        <button className="basic-button basic-button--small"
                            title="Download the sample -> well table of the input plate like the runlist export"
                            onClick={() => setExportDialogProps({ isOpen: true, side: "input" })}>Export input plate</button>
                        <span className="font-size--smallest" style={{ color: "#888" }}>
                            then select a well and click output wells to map
                        </span>
                    </div>
                </> : <div className="font-size--small" style={{ color: "#888", marginTop: "0.5rem" }}>Select an input plate first.</div>}

                <h4 style={{ margin: "0.75rem 0 0.25rem 0" }}>Responsible user</h4>
                <UserInput selected_users={responsibleUserTags} showLabel={false}
                    onUserSelect={(callbackKey, user_tag) => setResponsibleUserTags(user_tag ? [user_tag] : [])} />
            </div>

        {/* ---------------- MIDDLE: the module console ---------------- */}
            <div style={columnStyle}>
                <h4 style={{ margin: "0 0 0.5rem 0" }}>{procedure?.title || procedure_tag}
                    {_.isNumber(procedure?.version) && procedure.version > 1 ?
                        <span className="font-size--small" style={{ color: "#888" }}> v{procedure.version}</span> : null}
                </h4>
                <div className="font-size--small" style={{ color: "#555" }}>{procedure?.description}</div>
                <div className="font-size--smallest" style={{ color: "#888", marginTop: "0.35rem" }}>
                    {[procedure?.input_plate_format ? `input format: ${procedure.input_plate_format}` : null,
                      procedure?.input_plate_type ? `input type: ${procedure.input_plate_type}` : null,
                      procedure?.output_plate_format ? `output format: ${procedure.output_plate_format}` : null,
                      procedure?.output_plate_type ? `output type: ${procedure.output_plate_type}` : null,
                      procedure?.pubmed_ids?.length ? `PubMed: ${procedure.pubmed_ids.join(", ")}` : null,
                      procedure?.min_output_wells_per_sample > 1 || procedure?.max_output_wells_per_sample ?
                          `${procedure.min_output_wells_per_sample || 1}-${procedure.max_output_wells_per_sample || "n"} output wells per sample` : null]
                        .filter((part) => part).join(" · ")}
                </div>

                {renderMetricsSection("INPUT", "Per-well input values (declared input attributes)")}

                <div style={{ borderTop: "1px dashed #ddd", marginTop: "0.5rem", paddingTop: "0.5rem" }}>
                    <div className="font-size--small" style={{ fontWeight: 600 }}>Optional parameters per output well</div>
                    <div className="font-size--smallest" style={{ color: "#888", margin: "0.25rem 0" }}>
                        Select an output well on the right, then add the condition applications of this module
                        (e.g. heat treatment) that were applied to it.
                    </div>
                    <ConditionApplicationInput
                        selected_ca_tags={selectedOutputWell !== null ? outputWells[selectedOutputWell]?.condition_application_tags || [] : []}
                        onSelect={handleAddConditionApplication}
                        samples_only={false}
                        placeholder={selectedOutputWell !== null ? `Add parameter to ${selectedOutputWell}` : "Select an output well"} />
                    {selectedOutputWell !== null && (outputWells[selectedOutputWell]?.condition_application_tags || []).map((ca_tag) =>
                        <Tag key={ca_tag} minimal style={{ margin: "0.15rem 0.15rem 0 0" }}>{ca_tag}</Tag>)}
                </div>

                {renderMetricsSection("OUTPUT", "Measured output values")}
            </div>

            {/* ---------------- RIGHT: the output plate ---------------- */}
            <div style={columnStyle}>
                <h4 style={{ margin: "0 0 0.5rem 0" }}>
                    <span style={{ color: outputPlateTag ? "#238551" : "#c87619" }}>③ Output plate</span>
                    <span className="font-size--smallest" style={{ color: "#888" }}>
                        {outputPlateTag ? "" : " — select the plate the samples are transferred to"}
                    </span>
                </h4>
                <div className="flex center-items" style={{ gap: "0.5rem" }}>
                    <select className="text-input" style={{ flex: 1 }} value={outputPlateTag || ""}
                        onChange={(e) => { setOutputPlateTag(e.target.value || null); setSelectedOutputWell(null) }}>
                        <option value="">Select an added plate ...</option>
                        {(outputPlateOptions || []).map((plate) =>
                            <option key={plate.tag} value={plate.tag}>{plate.name} ({plate.format})</option>)}
                    </select>
                    <button className="basic-button basic-button--small" onClick={() => setCreatePlateTarget("output")}>New</button>
                </div>
                {outputPlate ? <>
                    <PlateGrid plate={outputPlate} wells={outputWells} selectedWell={selectedOutputWell}
                        onWellClick={handleOutputWellClick} onWellAltClick={handleOutputWellRightClick}
                        isWellDisabled={outputWellDisabled}
                        paintMode={selectedInputWell !== null}
                        renderWell={(well) => well ? <span className="font-size--smallest">
                            CA{well.condition_application_tags.length}</span> : ""} />
                    <div className="font-size--smallest" style={{ color: "#888", marginTop: "0.25rem" }}>
                        Select an input well (left) and click/drag over output wells to map it — mapping
                        several input wells onto the same output well pools them; right-click removes a well.
                    </div>
                    <button className="basic-button basic-button--small" style={{ marginTop: "0.25rem" }}
                        title="Download the sample -> well table of the output plate like the runlist export"
                        onClick={() => setExportDialogProps({ isOpen: true, side: "output" })}>Export output plate</button>
                </> : <div className="font-size--small" style={{ color: "#888", marginTop: "0.5rem" }}>Select an output plate.</div>}
            </div>
        </div>
        <ExecutionPlateExportDialog
            isOpen={exportDialogProps.isOpen} side={exportDialogProps.side}
            execution={exportExecution()}
            onClose={() => setExportDialogProps({ isOpen: false, side: null })} />
        </>}
    </div>
}
