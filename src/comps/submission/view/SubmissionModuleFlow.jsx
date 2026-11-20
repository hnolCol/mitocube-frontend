import PropTypes from "prop-types"
import _ from "lodash"
import { useState } from "react"
import { useQueries } from "@tanstack/react-query"
import { Group } from "@visx/group"
import { Cluster, hierarchy } from "@visx/hierarchy"
import { api } from "@/api"
import { apiClient } from "@/api/client"
import { overviewBoxStyle } from "@/comps/analysis/overview/overviewBoxStyle"
import {
    EXECUTION_STATUS_STYLE, ExecutionStateChip, ProcedureTitle, formatExecutionTime,
    StateHistory, WellTable,
} from "@/comps/modularprocedures/Shared"

SubmissionModuleFlow.propTypes = {
    submission_tag: PropTypes.string.isRequired
}

const NODE_WIDTH = 150
const NODE_HEIGHT = 24

const MODULE_COLORS = { done: "#9d5bd2", open: "#c87619" }

function nodeFill(node) {
    if (node.nodeType === "submission") return "#4051b5"
    if (node.nodeType === "plate") return "#8f9bb3"
    if (node.nodeType === "execution") return (EXECUTION_STATUS_STYLE[node.status] || { color: "#c87619" }).color
    return "#c87619"
}

/**
 * @description Chains the executions of one submission by plate continuity: the output plate of
 * one run is the input plate of the next. Runs whose input plate is nobody's output are chain
 * starts (the physical starting point of the sample material); a run whose output plate feeds
 * several runs opens a branch. Runs that pool outputs from several previous runs are attached to
 * the earliest one (the physical material flow dominates the timing).
 */
function buildLineageTree(submission_tag, links, executions) {
    if (!_.isArray(executions) || executions.length === 0) return null
    const sorted = _.orderBy(executions, ["created_at", "tag"], ["asc", "asc"])
    const parent = {}
    sorted.forEach((execution) => {
        const sortedCandidateParents = sorted.filter((candidate) =>
            candidate.tag !== execution.tag &&
            candidate.output_plate_tag === execution.input_plate_tag &&
            candidate.created_at <= execution.created_at)
        if (sortedCandidateParents.length > 0) parent[execution.tag] = sortedCandidateParents[0]
    })
    const children = {}
    sorted.forEach((execution) => { children[execution.tag] = [] })
    sorted.forEach((execution) => {
        const p = parent[execution.tag]
        if (p) children[p.tag].push(execution)
    })
    const roots = sorted.filter((execution) => !parent[execution.tag])

    const execNode = (execution) => {
        const link = _.find(links, { procedure_tag: execution.procedure_tag })
        return {
            nodeType: "execution",
            key: `execution-${execution.tag}`,
            tag: execution.tag,
            status: execution.status || "RUNNING",
            execution,
            children: children[execution.tag].map(execNode)
        }
    }

    const chainRoots = roots.length > 0 ? roots : sorted.slice(0, 1)
    return {
        nodeType: "submission",
        key: "submission",
        name: submission_tag,
        children: chainRoots.map((root, index) => ({
            nodeType: "plate",
            key: `input-plate-${root.input_plate_tag}-${index}`,
            name: `in: ${root.input_plate_tag}`,
            children: [execNode(root)]
        }))
    }
}

function ExecutionNodeLabel({ data }) {
    return <tspan>
        <ProcedureTitle procedure_tag={data.execution.procedure_tag} />
    </tspan>
}

function ExecutionDetailPanel({ execution_tag, onClose }) {
    const { data: execution, isLoading, isError, error } =
        api.modularProcedures.execute.useGetModularProcedureExecution(
            { tag: execution_tag }, { enabled: _.isString(execution_tag), staleTime: 30000, retry: false })
    if (isLoading) return <div className="font-size--small padding--little">Loading execution details ...</div>
    if (isError) return <div className="font-size--small padding--little">Execution details not available.</div>
    return <div className="flex flex-column gap--small margin--little padding--little"
        style={{ borderTop: "1px solid #ddd", background: "#f5f8fa", borderRadius: "6px" }}>
        <div className="flex center-items justify-between gap--tiny flex--wrap">
            <div className="flex center-items gap--tiny">
                <strong className="font-size--small">{execution_tag}</strong>
                <ExecutionStateChip status={execution.status} />
                <span className="font-size--smallest" style={{ color: "#666" }}>
                    <ProcedureTitle procedure_tag={execution.procedure_tag} />
                </span>
            </div>
            <button className="basic-button basic-button--small" onClick={onClose}>Close details</button>
        </div>
        <div className="flex font-size--smallest flex--wrap gap--tiny" style={{ color: "#666" }}>
            <span>Input plate: {execution.input_plate_tag}</span>
            <span>Output plate: {execution.output_plate_tag}</span>
            <span>Responsible: {execution.responsible_user_tag || "–"}</span>
            <span>Created: {formatExecutionTime(execution.created_at)} by {execution.user_tag}</span>
            {execution.wells_blocked ? <span>Output wells blocked</span> : null}
        </div>
        <StateHistory execution_tag={execution.tag} />
        <div>
            <h5 style={{ margin: "0.25rem 0" }}>Input plate details</h5>
            <WellTable wells={execution.input_wells} side="input" />
        </div>
        <div>
            <h5 style={{ margin: "0.25rem 0" }}>Output plate details</h5>
            <WellTable wells={execution.output_wells} side="output" />
        </div>
    </div>
}

/**
 * @description Directed flow visualization of the workflow modules a submission passed through:
 * the runs are chained by plate continuity (output plate of one run = input plate of the next),
 * starting at the input plate of the material — branches appear where one run's plate feeds
 * several subsequent runs. Node colors are the status reports (execution states, done/open
 * modules); hovering shows the summary, clicking a run opens its detail view (state history
 * with the user who changed it, plate tables with samples, per-well values and condition
 * applications). Only the requesting user's own data is visible (the backend masks everything
 * else).
 * @param {Object} props
 * @param {String} props.submission_tag Submission tag
 * @returns {JSX.Element} The module flow container.
 */
export function SubmissionModuleFlow({ submission_tag }) {
    const [hovered, setHovered] = useState(null)
    const [selectedTag, setSelectedTag] = useState(null)

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

    if (_.isArray(links) && links.length === 0 && _.isArray(executions) && executions.length === 0) return null
    if (linksLoading || detailsLoading) return null

    const executionDetails = detailQueries.map((query) => query.data).filter(_.isObject)
    const root = buildLineageTree(submission_tag, links, executionDetails)
    if (root === null) return null

    const leaves = []
    const collectLeaves = (node) => (node.children ? node.children.forEach(collectLeaves) : leaves.push(node))
    collectLeaves(root)
    const depth = (() => {
        let maxDepth = 0
        const walk = (node, level) => {
            maxDepth = Math.max(maxDepth, level)
            node.children?.forEach((child) => walk(child, level + 1))
        }
        walk(root, 1)
        return maxDepth
    })()
    const width = Math.max(560, NODE_WIDTH + 40 + (depth - 1) * (NODE_WIDTH + 60))
    const height = Math.max(200, leaves.length * 46 + 80)

    const nodeX = (node) => NODE_WIDTH / 2 + 20 + node.y
    const nodeY = (node) => 40 + node.x

    return <div className="container--shadow padding--little margin-top--little" style={overviewBoxStyle}>
        <div className="flex flex-column">
            <h3>Module Flow</h3>
            <p className="font-size--smallest" style={{ color: "#666", margin: "0 0 0.5rem 0" }}>
                The runs of this submission's samples chained by plate: the output plate of one module is the
                input plate of the next; branches show where a plate feeds several runs. Hover for a summary,
                click a run for its details.
            </p>
            <div style={{ position: "relative", overflowX: "auto" }}>
                <svg width={width} height={height} style={{ display: "block" }}>
                    <Cluster root={hierarchy(root)} size={[height - 80, width - 2 * NODE_WIDTH - 40]}>
                        {(cluster) => <Group>
                            {cluster.links().map((link, index) => {
                                const source = { x: nodeX(link.source) + NODE_WIDTH / 2, y: nodeY(link.source) }
                                const target = { x: nodeX(link.target) - NODE_WIDTH / 2, y: nodeY(link.target) }
                                const midX = (source.x + target.x) / 2
                                return <path key={`link-${index}`}
                                    d={`M${source.x},${source.y} C${midX},${source.y} ${midX},${target.y} ${target.x},${target.y}`}
                                    fill="none" stroke="#ccc" strokeWidth={1.4} />
                            })}
                            {cluster.descendants().map((node) => {
                                const x = nodeX(node)
                                const y = nodeY(node)
                                const fill = nodeFill(node.data)
                                const link = node.data.nodeType === "execution" ?
                                    _.find(links, { procedure_tag: node.data.execution.procedure_tag }) : null
                                return <Group key={node.data.key} top={y} left={x}>
                                    <rect x={-NODE_WIDTH / 2} y={-NODE_HEIGHT / 2} width={NODE_WIDTH} height={NODE_HEIGHT}
                                        rx={6}
                                        fill={fill}
                                        stroke={selectedTag === node.data.tag ? "#4051b5" : "none"}
                                        strokeWidth={2}
                                        style={{
                                            cursor: node.data.nodeType === "execution" ? "pointer" : "default"
                                        }}
                                        onMouseEnter={(event) => setHovered(node.data.nodeType === "execution" ? {
                                            data: node.data, x: event.clientX, y: event.clientY
                                        } : null)}
                                        onMouseLeave={() => setHovered(null)}
                                        onClick={() => setSelectedTag(node.data.nodeType === "execution" ?
                                            (selectedTag === node.data.tag ? null : node.data.tag) : null)} />
                                    <text dy=".33em" fontSize={10} textAnchor="middle" fontFamily="Inter, sans-serif"
                                        fill="#ffffff" style={{ pointerEvents: "none" }}>
                                        {node.data.nodeType === "execution" ?
                                            <ExecutionNodeLabel data={node.data} /> :
                                            (node.data.name || "")}
                                    </text>
                                    {node.data.nodeType === "execution" && link ?
                                        <text dy="1.35em" fontSize={7.5} textAnchor="middle" fontFamily="Inter, sans-serif"
                                            fill="#ffffff" style={{ pointerEvents: "none" }}>
                                            {link.done ? "done" : "open"}
                                        </text> : null}
                                </Group>
                            })}
                        </Group>}
                    </Cluster>
                </svg>
                {hovered ? <div style={{
                    position: "fixed", left: Math.min(hovered.x + 12, window.innerWidth - 280), top: hovered.y + 12,
                    background: "#1c2227", color: "#f5f8fa", borderRadius: "6px", padding: "0.4rem 0.6rem",
                    fontSize: "0.72rem", lineHeight: 1.4, pointerEvents: "none", zIndex: 1000, maxWidth: "280px"
                }}>
                    <div><strong>{hovered.data.execution.procedure_tag}</strong></div>
                    <div>Execution: {hovered.data.tag}</div>
                    <div>State: {hovered.data.status}</div>
                    <div>Input plate: {hovered.data.execution.input_plate_tag}</div>
                    <div>Output plate: {hovered.data.execution.output_plate_tag}</div>
                    <div>Created: {formatExecutionTime(hovered.data.execution.created_at)}</div>
                    <div>Responsible: {hovered.data.execution.responsible_user_tag || "–"}</div>
                    <div>Click for details</div>
                </div> : null}
            </div>
            <div className="flex gap--tiny flex--wrap font-size--smallest" style={{ color: "#666", marginTop: "0.25rem" }}>
                <span style={{ color: "#4051b5" }}>■ submission</span>
                <span style={{ color: "#8f9bb3" }}>■ input plate</span>
                <span style={{ color: "#c87619" }}>■ running</span>
                <span style={{ color: "#43a047" }}>■ succeeded</span>
                <span style={{ color: "#cd4246" }}>■ failed</span>
                <span style={{ color: "#888" }}>■ aborted</span>
                <span>hover for a summary, click a run for its details</span>
            </div>
            {_.isString(selectedTag) ?
                <ExecutionDetailPanel execution_tag={selectedTag} onClose={() => setSelectedTag(null)} /> : null}
        </div>
    </div>
}
