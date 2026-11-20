import { useCallback, useEffect, useMemo, useState } from "react"
import PropTypes from "prop-types"
import _ from "lodash"
import { Spinner } from "@blueprintjs/core"
import { Group } from "@visx/group"
import { localPoint } from "@visx/event"
import { getColorPalette, HIGHLIGHT_COLOR } from "@/comps/core/colors/colorPalette"
import { buildSubmissionCAIndex, splitIntoChildren } from "./cas"
import "./explore.css"

const SLOT_WIDTH = 120
const LEVEL_HEIGHT = 130
const MARGIN = { top: 30, right: 30, bottom: 30, left: 60 }
const MAX_LABEL_LENGTH = 22

// The number of attribute levels that are expanded by default when the data
// loads; deeper levels are expanded on demand by clicking a node.
const AUTO_EXPAND_DEPTH = 4

const defaultRootNode = (submissionTags) => ({
    root: { id: "root", parentId: null, label: "All submissions", attribute_text: null, submission_tags: submissionTags, childIds: null, split: null, depth: 0 }
})

ExploreGraph.propTypes = {
    submissions: PropTypes.array,
    caAggregates: PropTypes.array,
    onSelectionChange: PropTypes.func
}

/**
 * @description Interactive visx-based partition tree of the explored submissions.
 * Each node is a set of submissions; clicking a node expands it by the condition
 * application attribute with the highest dividing power (see cas.js) and selects
 * it. The node area encodes the number of submissions. Nodes without a further
 * division stay leaves. The selected node is reported to the parent via
 * onSelectionChange to display its submissions in the tube below the graph.
 * @param {Object} props
 * @param {Object[]} [props.submissions] Explore submission rows (tag, title, ...).
 * @param {Object[]} [props.caAggregates] Condition application aggregates per submission.
 * @param {Function} [props.onSelectionChange] Callback with { label_path, submissions } of the selected node.
 * @returns {JSX.Element} The condition application explore graph.
 */
export function ExploreGraph({ submissions, caAggregates, onSelectionChange }) {

    const caIndex = useMemo(() => buildSubmissionCAIndex(caAggregates), [caAggregates])
    const submissionTags = useMemo(() => (_.isArray(submissions) ? submissions.map(submission => submission.tag).filter(_.isString) : []), [submissions])
    const submissionByTag = useMemo(() => new Map((_.isArray(submissions) ? submissions : []).map(submission => [submission.tag, submission])), [submissions])
    const rootCount = Math.max(submissionTags.length, 1)

    const [expanded, setExpanded] = useState(null)
    const [selectedId, setSelectedId] = useState("root")
    const [leafHintId, setLeafHintId] = useState(null)
    const [hovered, setHovered] = useState(null)

    useEffect(() => {
        setSelectedId("root")
        setLeafHintId(null)
        if (submissionTags.length === 0) {
            setExpanded(null)
            return
        }
        const nodeMap = defaultRootNode(submissionTags)
        let changed = true
        let expandedAny = false
        while (changed) {
            changed = false
            for (const node of Object.values(nodeMap)) {
                if (node.depth >= AUTO_EXPAND_DEPTH || _.isArray(node.childIds)) continue
                const result = splitIntoChildren(node, caIndex)
                if (result === null) continue
                nodeMap[node.id] = { ...node, childIds: result.children.map(child => child.id), split: result.split }
                for (const child of result.children) nodeMap[child.id] = child
                changed = true
                expandedAny = true
            }
        }
        setExpanded(expandedAny ? nodeMap : null)
    }, [caIndex, submissionTags])

    const nodeMap = useMemo(() => (expanded === null ? defaultRootNode(submissionTags) : expanded), [expanded, submissionTags])

    const reportSelection = useCallback((id, nodes) => {
        if (!_.isFunction(onSelectionChange)) return
        const label_path = []
        let current = nodes[id]
        while (current !== undefined && current.parentId !== null) {
            label_path.unshift(current.label)
            current = nodes[current.parentId]
        }
        onSelectionChange({
            label_path,
            submissions: (nodes[id].submission_tags || [])
                .map(tag => submissionByTag.get(tag))
                .filter(submission => _.isObject(submission))
        })
    }, [onSelectionChange, submissionByTag])

    const handleNodeClick = useCallback((event, id) => {
        event.stopPropagation()
        setHovered(null)
        const nextNodes = { ...nodeMap }
        const node = nextNodes[id]
        if (node === undefined) return
        setSelectedId(id)
        if (_.isArray(node.childIds)) {
            let stack = [...node.childIds]
            while (stack.length > 0) {
                const childId = stack.pop()
                const child = nextNodes[childId]
                if (child === undefined) continue
                stack = stack.concat(_.isArray(child.childIds) ? child.childIds : [])
                delete nextNodes[childId]
            }
            nextNodes[id] = { ...node, childIds: null, split: null }
        } else {
            const result = splitIntoChildren(node, caIndex)
            if (result === null) {
                setLeafHintId(id)
                reportSelection(id, nextNodes)
                return
            }
            setLeafHintId(null)
            for (const child of result.children) nextNodes[child.id] = child
            nextNodes[id] = { ...node, childIds: result.children.map(child => child.id), split: result.split }
        }
        setExpanded(nextNodes)
        reportSelection(id, nextNodes)
    }, [caIndex, nodeMap, reportSelection])

    const layout = useMemo(() => {
        let cursor = 0
        let maxDepth = 0
        const positions = {}
        const walk = (id) => {
            const node = nodeMap[id]
            if (node === undefined) return 0
            maxDepth = Math.max(maxDepth, node.depth)
            if (_.isArray(node.childIds) && node.childIds.length > 0) {
                const childX = node.childIds.map(walk)
                positions[id] = { x: (Math.min(...childX) + Math.max(...childX)) / 2, y: node.depth }
            } else {
                positions[id] = { x: cursor, y: node.depth }
                cursor = cursor + 1
            }
            return positions[id].x
        }
        walk("root")
        const positionsList = Object.values(positions)
        const width = MARGIN.left + MARGIN.right + Math.max(cursor, 1) * SLOT_WIDTH
        const height = MARGIN.top + MARGIN.bottom + (maxDepth + 1) * LEVEL_HEIGHT
        return { positions, width, height, slots: Math.max(cursor, 1), maxDepth, maxSlot: (positionsList.length > 0 ? Math.max(...positionsList.map(position => position.x)) : 0) }
    }, [nodeMap])

    const colors = useMemo(() => getColorPalette(Math.max(layout.maxDepth + 1, 2)), [layout.maxDepth])
    const radius = (count) => 6 + 22 * Math.sqrt(count / rootCount)
    const toX = (slot) => MARGIN.left + (slot + 0.5) * SLOT_WIDTH
    const toY = (depth) => MARGIN.top + (depth + 0.5) * LEVEL_HEIGHT + 20
    const truncate = (text) => _.isString(text) && text.length > MAX_LABEL_LENGTH ? `${text.slice(0, MAX_LABEL_LENGTH - 1)}…` : text

    if (submissionTags.length === 0) return <div className="flex center-items padding--medium"><Spinner size={20} /></div>

    return <div className="explore-graph">
        <div className="explore-graph__canvas container--scroll-y-hide-x">
            <svg width={layout.width} height={layout.height} onClick={event => handleNodeClick(event, "root")}>
                {Object.values(nodeMap).map(node => {
                    if (node.parentId === null) return null
                    const parent = nodeMap[node.parentId]
                    const p = layout.positions[parent.id]
                    const c = layout.positions[node.id]
                    if (p === undefined || c === undefined) return null
                    const px = toX(p.x), py = toY(p.y), cx = toX(c.x), cy = toY(c.y)
                    const midY = (py + cy) / 2
                    const isOnSelectedPath = node.parentId === selectedId || node.id === selectedId
                    return <path key={`link-${node.id}`}
                        className="explore-graph__link"
                        fill="none"
                        stroke={isOnSelectedPath ? HIGHLIGHT_COLOR : "#c8c8c8"}
                        strokeWidth={isOnSelectedPath ? 2 : 1.2}
                        d={`M${px},${py + radius(parent.submission_tags.length)} C${px},${midY} ${cx},${midY} ${cx},${cy - radius(node.submission_tags.length)}`} />
                })}
                {Object.values(nodeMap).map(node => {
                    const position = layout.positions[node.id]
                    if (position === undefined) return null
                    const x = toX(position.x)
                    const y = toY(position.y)
                    const count = node.submission_tags.length
                    const isExpanded = _.isArray(node.childIds)
                    const isSelected = node.id === selectedId
                    return <Group key={`node-${node.id}`} className="explore-graph__node">
                        <circle
                            cx={x}
                            cy={y}
                            r={radius(count)}
                            fill={colors[(node.depth + 1) % colors.length]}
                            opacity={isSelected ? 1 : 0.75}
                            stroke={isSelected ? HIGHLIGHT_COLOR : "none"}
                            strokeWidth={2}
                            style={{ cursor: "pointer" }}
                            onClick={event => handleNodeClick(event, node.id)}
                            onMouseMove={event => {
                                const point = localPoint(event)
                                setHovered({ node, x: point ? point.x : 0, y: point ? point.y : 0 })
                            }}
                            onMouseLeave={() => setHovered(null)} />
                        <text
                            x={x}
                            y={y + radius(count) + 14}
                            textAnchor="middle"
                            className="explore-graph__label"
                            style={{ fontWeight: isSelected ? "bold" : "normal" }}>
                            {truncate(node.label)}
                        </text>
                        <text x={x} y={y + radius(count) + 26} textAnchor="middle" className="explore-graph__count">{count}</text>
                        {isExpanded ? null :
                            <text x={x + radius(count) + 6} y={y - radius(count) - 2} className="explore-graph__hint">+</text>}
                    </Group>
                })}
            </svg>
            {hovered !== null && _.isObject(hovered.node) ?
                <div className="explore-graph__tooltip" style={{ left: hovered.x + 12, top: hovered.y + 12 }}>
                    <span className="font-weight--bold">{hovered.node.label}</span>
                    <span className="font-size--smallest">{hovered.node.submission_tags.length} submission{hovered.node.submission_tags.length === 1 ? "" : "s"}</span>
                    {_.isString(hovered.node.split && hovered.node.split.attribute_text) ?
                        <span className="font-size--smallest">divided by {hovered.node.split.attribute_text}</span> : null}
                    {_.isString(hovered.node.attribute_text) && hovered.node.id !== "root" ?
                        <span className="font-size--smallest">{hovered.node.attribute_text}</span> : null}
                </div> : null}
        </div>
        {leafHintId !== null && leafHintId === selectedId ?
            <div className="font-size--smallest padding--little">
                No condition application attribute divides the selected submissions further.
            </div> : null}
        <div className="font-size--smallest padding--little">
            The first {AUTO_EXPAND_DEPTH} levels are expanded by default. Click a node to expand it further by the condition application attribute with the highest dividing power or to collapse it again. The node area is proportional to the number of submissions.
        </div>
    </div>
}

export default ExploreGraph
