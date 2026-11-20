import PropTypes from "prop-types"
import _ from "lodash"
import moment from "moment"
import { useState } from "react"
import { useQueries } from "@tanstack/react-query"
import { Group } from "@visx/group"
import { Cluster, hierarchy } from "@visx/hierarchy"
import { api } from "@/api"
import { apiClient } from "@/api/client"
import { overviewBoxStyle } from "@/comps/analysis/overview/overviewBoxStyle"
import { EXECUTION_STATUS_STYLE, ProcedureTitle } from "@/comps/modularprocedures/Shared"

SubmissionModuleFlow.propTypes = {
    submission_tag: PropTypes.string.isRequired
}

const NODE_WIDTH = 118
const NODE_HEIGHT = 22
const LEVEL_WIDTH = 170

const MODULE_COLORS = { done: "#9d5bd2", open: "#c87619" }

const formatTime = (value) => _.isNumber(value) ? moment.unix(value).format("YYYY-MM-DD HH:mm") : ""

function ExecutionTagLabel({ execution_tag }) {
    return <tspan>{execution_tag}</tspan>
}

/**
 * @description Builds the directed flow graph of the submission's workflow: submission -> modules
 * (in assignment order) -> executions (in run order) -> input wells -> the output wells they were
 * transferred to. Executions and wells only contain the data visible to the requesting user (the
 * backend masks other users' samples, values and condition applications).
 */
function buildFlowTree(submission_tag, links, executions) {
    if (!_.isArray(links) || links.length === 0) return null
    const moduleChildren = _.map(links, (link, index) => {
        const moduleExecutions = _.orderBy(
            _.filter(executions, (execution) => execution.procedure_tag === link.procedure_tag),
            ["created_at"], ["asc"])
        return {
            nodeType: "module",
            key: `module-${link.procedure_tag}-${index}`,
            name: link.procedure_tag,
            procedure_tag: link.procedure_tag,
            version: undefined,
            status: link.done ? "done" : "open",
            tooltip: [
                `Module: ${link.procedure_tag}`,
                `Assigned: ${formatTime(link.created_at)}`,
                link.done ? `Done: ${formatTime(link.done_at)}${link.done_by ? ` by ${link.done_by}` : ""}` : "Status: open — processing"
            ],
            children: moduleExecutions.map((execution) => ({
                nodeType: "execution",
                key: `execution-${execution.tag}`,
                name: execution.tag,
                status: execution.status || "RUNNING",
                tooltip: [
                    `Execution: ${execution.tag}`,
                    `State: ${execution.status || "RUNNING"}`,
                    `Input plate: ${execution.input_plate_tag}`,
                    `Output plate: ${execution.output_plate_tag}`,
                    `Responsible: ${execution.responsible_user_tag || "–"}`,
                    `Created: ${formatTime(execution.created_at)}`
                ],
                children: execution.input_wells.map((well) => ({
                    nodeType: "inputWell",
                    key: `input-${execution.tag}-${well.position}`,
                    name: well.position,
                    tooltip: [
                        `Input well: ${well.position} (${execution.input_plate_tag})`,
                        `Samples: ${well.sample_tags.join(", ") || "–"}`,
                        well.metrics?.length > 0 ?
                            `Values: ${well.metrics.map((metric) => `${metric.trait_tag}: ${metric.value}`).join(", ")}` : "Values: –"
                    ],
                    children: (well.output_positions || []).map((position) => {
                        const outputWell = _.find(execution.output_wells, { position })
                        return {
                            nodeType: "outputWell",
                            key: `output-${execution.tag}-${well.position}-${position}`,
                            name: position,
                            tooltip: [
                                `Output well: ${position} (${execution.output_plate_tag})`,
                                `Samples: ${(outputWell?.sample_tags || []).join(", ") || "–"}`,
                                outputWell?.condition_application_tags?.length > 0 ?
                                    `Condition applications: ${outputWell.condition_application_tags.join(", ")}` : null,
                                outputWell?.metrics?.length > 0 ?
                                    `Measured: ${outputWell.metrics.map((metric) => `${metric.trait_tag}: ${metric.value}`).join(", ")}` : null
                            ].filter((line) => line !== null)
                        }
                    })
                }))
            }))
        }
    })
    return {
        nodeType: "submission",
        key: "submission",
        name: submission_tag,
        tooltip: [`Submission: ${submission_tag}`],
        children: moduleChildren
    }
}

function ModuleNodeLabel({ node }) {
    const { data: procedure } = api.modularProcedures.query.useGetModularProcedureByTag(
        { tag: node.data.procedure_tag }, { enabled: _.isString(node.data.procedure_tag), staleTime: 300000, retry: false })
    const title = _.isObject(procedure) && _.isString(procedure.title) ? procedure.title : node.data.procedure_tag
    const label = title.length > 16 ? `${title.substring(0, 15)}…` : title
    return <tspan>{label}{_.isNumber(procedure?.version) && procedure.version > 1 ? ` (v${procedure.version})` : ""}</tspan>
}

function nodeFill(node) {
    if (node.nodeType === "submission") return "#4051b5"
    if (node.nodeType === "module") return MODULE_COLORS[node.status] || MODULE_COLORS.open
    if (node.nodeType === "execution") return (EXECUTION_STATUS_STYLE[node.status] || { color: "#c87619" }).color
    return node.nodeType === "inputWell" ? "#48aff0" : "#43a047"
}

/**
 * @description Directed flow visualization of the workflow modules a submission passed through:
 * submission -> modules (assignment order) -> executions -> input wells -> output wells, drawn as a
 * left-to-right hierarchy (@visx/hierarchy tree). Colors carry the status reports (module done/open,
 * execution state) and hovering a node opens a tooltip with its details.
 * @param {Object} props
 * @param {String} props.submission_tag Submission tag
 * @returns {JSX.Element} The module flow container.
 */
export function SubmissionModuleFlow({ submission_tag }) {
    const [hovered, setHovered] = useState(null)

    const { data: links, isLoading: linksLoading } = api.modularProcedures.query.useGetSubmissionModularProcedures(
        { submission_tag }, { enabled: _.isString(submission_tag), staleTime: 30000, retry: false })
    const { data: executions, isLoading: executionsLoading } =
        api.modularProcedures.execute.useQueryModularProcedureExecutions(
            { search_submission_tag: submission_tag, limit: 100 }, { enabled: _.isString(submission_tag), staleTime: 30000, retry: false })

    const executionSummaries = _.isArray(executions) ? executions : []
    const detailQueries = useQueries({
        queries: executionSummaries.map((execution) => ({
            queryKey: ["getModularProcedureExecution", execution.tag],
            queryFn: () => apiClient.get(`/procedures/executions/${execution.tag}`).then((response) => response.data),
            staleTime: 30000, retry: false,
        }))
    })
    const detailsLoading = executionsLoading || detailQueries.some((query) => query.isLoading)

    if (_.isArray(links) && links.length === 0) return null

    if (linksLoading || detailsLoading) return null
    const executionDetails = detailQueries.map((query) => query.data).filter(_.isObject)
    const root = buildFlowTree(submission_tag, links, executionDetails)
    if (root === null) return null

    const leaves = []
    const collectLeaves = (node) => (node.children ? node.children.forEach(collectLeaves) : leaves.push(node))
    collectLeaves(root)
    const width = 520 + LEVEL_WIDTH * 3
    const height = Math.max(240, leaves.length * 30 + 90)

    const nodeX = (node) => NODE_WIDTH / 2 + 20 + node.y
    const nodeY = (node) => 30 + node.x

    return <div className="container--shadow padding--little margin-top--little" style={overviewBoxStyle}>
        <div className="flex flex-column">
            <h3>Module Flow</h3>
            <div style={{ position: "relative", overflowX: "auto" }}>
                <svg width={width} height={height} style={{ display: "block" }}>
                    <Cluster root={hierarchy(root)} size={[height - 60, width - 2 * NODE_WIDTH - 40]}>
                        {(cluster) => <Group>
                            {cluster.links().map((link, index) => {
                                const source = { x: nodeX(link.source) + NODE_WIDTH / 2, y: nodeY(link.source) }
                                const target = { x: nodeX(link.target) - NODE_WIDTH / 2, y: nodeY(link.target) }
                                const midX = (source.x + target.x) / 2
                                return <path key={`link-${index}`}
                                    d={`M${source.x},${source.y} C${midX},${source.y} ${midX},${target.y} ${target.x},${target.y}`}
                                    fill="none" stroke="#ccc" strokeWidth={1.2} />
                            })}
                            {cluster.descendants().map((node) => {
                                const x = nodeX(node)
                                const y = nodeY(node)
                                const fill = nodeFill(node.data)
                                return <Group key={node.data.key} top={y} left={x}>
                                    <rect x={-NODE_WIDTH / 2} y={-NODE_HEIGHT / 2} width={NODE_WIDTH} height={NODE_HEIGHT}
                                        rx={6} fill={fill}
                                        onMouseEnter={(event) => setHovered({
                                            data: node.data, x: event.clientX, y: event.clientY
                                        })}
                                        onMouseLeave={() => setHovered(null)} />
                                    <text dy=".33em" fontSize={9.5} textAnchor="middle" fontFamily="Inter, sans-serif"
                                        fill="#ffffff" style={{ pointerEvents: "none" }}>
                                        {node.data.nodeType === "module" ? <ModuleNodeLabel node={node} /> :
                                            node.data.nodeType === "execution" ? <ExecutionTagLabel execution_tag={node.data.name} /> :
                                                node.data.name}
                                    </text>
                                </Group>
                            })}
                        </Group>}
                    </Cluster>
                </svg>
                {hovered ? <div style={{
                    position: "fixed", left: Math.min(hovered.x + 12, window.innerWidth - 260), top: hovered.y + 12,
                    background: "#1c2227", color: "#f5f8fa", borderRadius: "6px", padding: "0.4rem 0.6rem",
                    fontSize: "0.72rem", lineHeight: 1.4, pointerEvents: "none", zIndex: 1000, maxWidth: "260px"
                }}>
                    {hovered.data.tooltip?.map((line, index) => <div key={index}>{line}</div>)}
                </div> : null}
            </div>
            <div className="flex gap--tiny flex--wrap font-size--smallest" style={{ color: "#666", marginTop: "0.25rem" }}>
                <span style={{ color: "#4051b5" }}>■ submission</span>
                <span style={{ color: MODULE_COLORS.done }}>■ module done</span>
                <span style={{ color: MODULE_COLORS.open }}>■ module open</span>
                <span style={{ color: "#c87619" }}>■ execution running</span>
                <span style={{ color: "#43a047" }}>■ succeeded</span>
                <span style={{ color: "#cd4246" }}>■ failed</span>
                <span style={{ color: "#48aff0" }}>■ input well</span>
                <span style={{ color: "#2e7d32" }}>■ output well</span>
                <span>hover a node for details</span>
            </div>
        </div>
    </div>
}
