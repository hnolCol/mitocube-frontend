import _ from "lodash"
import { useEffect, useMemo, useState } from "react"
import { Menu, MenuItem, Popover, Spinner, Tooltip } from "@blueprintjs/core"
import { api } from "@/api"
import { AnnotationGroupSelectionMenu } from "../mitomap/AnnotationGroupSelection"
import { OptionButton } from "@/comps/core/base/buttons/OptionButton"
import { useAnnotationProteinSets, useAnnotationTexts } from "@/api/orchestrated/annotationProteins"
import { directionBarColor, directionLabel, log2FCFieldName, rowDirectionInfo } from "./compareUtils"

const ANNOTATION_LOAD_CHUNK = 50
const ROW_LIMIT = 30
const DISCORDANT_COLOR = "#e8c468"
const BAR_TRACK_WIDTH = 220

function ListSelectionMenu({ listOptions, selectedListKeys, onToggleListKey }) {
    const [isOpen, setIsOpen] = useState(false)
    return <Popover
        content={<div className="padding--medium margin--little" style={{ minWidth: "22rem", maxHeight: "20rem", overflowY: "auto" }}>
            <h4>Lists to describe (select one or more)</h4>
            <Menu>
                {listOptions.map(option => <MenuItem
                    key={option.key}
                    icon={selectedListKeys.includes(option.key) ? "tick" : "blank"}
                    text={`${option.label} (${option.tags.length})`}
                    onClick={() => onToggleListKey(option.key)} />)}
            </Menu>
        </div>}
        minimal={true}
        isOpen={isOpen}
        onInteraction={(nextOpenState) => setIsOpen(nextOpenState)}
        placement="bottom-start">
        <button className="basic-button">{`Lists (${selectedListKeys.length} selected)`}</button>
    </Popover>
}

function quantile(sortedValues, p) {
    if (sortedValues.length === 0) return undefined
    const idx = (sortedValues.length - 1) * p
    const lo = Math.floor(idx)
    const hi = Math.ceil(idx)
    return sortedValues[lo] + (sortedValues[hi] - sortedValues[lo]) * (idx - lo)
}

function BoxPlotRow({ values, cy, boxHeight, color, x, withDots, points }) {
    const sorted = [...values].sort((a, b) => a - b)
    const q1 = quantile(sorted, 0.25)
    const median = quantile(sorted, 0.5)
    const q3 = quantile(sorted, 0.75)
    const min = sorted[0]
    const max = sorted[sorted.length - 1]
    return <g>
        <line x1={x(min)} y1={cy} x2={x(max)} y2={cy} stroke={color} strokeWidth={1} />
        <line x1={x(min)} y1={cy - boxHeight / 2} x2={x(min)} y2={cy + boxHeight / 2} stroke={color} strokeWidth={1} />
        <line x1={x(max)} y1={cy - boxHeight / 2} x2={x(max)} y2={cy + boxHeight / 2} stroke={color} strokeWidth={1} />
        <rect x={x(q1)} y={cy - boxHeight / 2} width={Math.max(1, x(q3) - x(q1))} height={boxHeight}
            fill={color} fillOpacity={0.35} stroke={color} strokeWidth={1} />
        <line x1={x(median)} y1={cy - boxHeight / 2} x2={x(median)} y2={cy + boxHeight / 2} stroke={color} strokeWidth={2} />
        {withDots ? points.map((point, idx) => <circle key={idx}
            cx={x(point.value)}
            cy={cy + (((idx * 37) % 11) - 5)}
            r={point.inList ? 3.2 : 2.4}
            fill={point.inList ? "#d13913" : color}
            fillOpacity={point.inList ? 0.95 : 0.6} />) : null}
    </g>
}

function AnnotationLog2FCPlot({ entry, suffix, rowByTag, backgroundValues, selectedTags }) {
    const width = 340
    const height = 150
    const points = useMemo(() => entry.memberTags
        .map(tag => rowByTag.get(tag))
        .filter(row => _.isObject(row) && _.isNumber(row[log2FCFieldName(suffix)]))
        .map(row => ({ value: row[log2FCFieldName(suffix)], inList: selectedTags.has(row.tag) })),
        [entry, suffix, rowByTag, selectedTags])
    const allValues = useMemo(() => [...backgroundValues, ...points.map(p => p.value)], [backgroundValues, points])
    if (allValues.length === 0) return <span className="font-size--smallest">No log2FC values for this volcano.</span>
    const min = Math.min(...allValues)
    const max = Math.max(...allValues)
    const pad = (max - min) * 0.05 || 1
    const x0 = min - pad
    const x1 = max + pad
    const x = value => 10 + ((value - x0) / (x1 - x0)) * (width - 20)
    const zeroX = x(0)
    return <svg width={width} height={height} style={{ maxWidth: "100%" }}>
        <line x1={zeroX} y1={12} x2={zeroX} y2={height - 22} stroke="#8a8a8a" strokeDasharray="3,3" strokeWidth={1} />
        <text x={zeroX} y={10} fontSize="9" textAnchor="middle" fill="#8a8a8a">0</text>
        <text x={x(min)} y={height - 8} fontSize="9" textAnchor="middle" fill="#8a8a8a">{min.toFixed(2)}</text>
        <text x={x(max)} y={height - 8} fontSize="9" textAnchor="middle" fill="#8a8a8a">{max.toFixed(2)}</text>
        <text x={6} y={42} fontSize="9" fill="#8a8a8a">all</text>
        <text x={6} y={102} fontSize="9" fill="#8a8a8a">ann.</text>
        <BoxPlotRow values={backgroundValues} cy={40} boxHeight={16} color="#9a9a9a" x={x} withDots={false} points={[]} />
        <BoxPlotRow values={points.map(p => p.value)} cy={100} boxHeight={18} color="#4a7ba6" x={x} withDots={true} points={points} />
    </svg>
}

function AnnotationRow({ entry, label, isExpanded, onToggle, plotSuffix, setPlotSuffix, suffixes, rowByTag, backgroundValuesBySuffix, selectedTags }) {
    const maxTotal = entry.maxTotal
    const segment = (count, color, key) => count > 0
        ? <div key={key} style={{ width: `${(count / maxTotal) * BAR_TRACK_WIDTH}px`, minWidth: "2px", height: "0.9rem", backgroundColor: color }} />
        : null
    return <div className="margin-bottom--little">
        <Tooltip compact={true} content={`${entry.tag} — ${entry.overlapCount} of ${entry.total} members in selected list(s)`}>
            <div className="flex center-items"
                style={{ gap: "0.4rem", cursor: "pointer", backgroundColor: isExpanded ? "#efefef" : "white" }}
                onClick={onToggle}>
                <span className="font-size--small" style={{ width: "220px", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
                <div className="flex center-items" style={{ width: `${BAR_TRACK_WIDTH}px`, height: "0.9rem", backgroundColor: "#efefef", flexShrink: 0 }}>
                    {segment(entry.up, directionBarColor("up"), "up")}
                    {segment(entry.down, directionBarColor("down"), "down")}
                    {segment(entry.both, DISCORDANT_COLOR, "both")}
                </div>
                <span className="font-size--small font-weight--bold">{entry.overlapCount}</span>
                <span className="font-size--smallest">of {entry.total} in list</span>
            </div>
        </Tooltip>
        {isExpanded ? <div className="margin-top--little margin-left--medium">
            <div className="flex center-items margin-bottom--little" style={{ gap: "0.3rem", flexWrap: "wrap" }}>
                <span className="font-size--smallest">log2FC volcano:</span>
                {suffixes.map(suffix => <OptionButton key={suffix} isSelected={suffix === plotSuffix} onClick={() => setPlotSuffix(suffix)}>{suffix}</OptionButton>)}
            </div>
            <AnnotationLog2FCPlot entry={entry} suffix={plotSuffix} rowByTag={rowByTag}
                backgroundValues={backgroundValuesBySuffix[plotSuffix] ?? []} selectedTags={selectedTags} />
            <div className="font-size--smallest margin-top--little">
                gray = all proteins of the volcano, blue = members of this annotation, red = in selected list(s)
            </div>
        </div> : null}
    </div>
}

/**
 * @description Describes one or more selectable protein lists (default: all significant proteins of the
 * current direction) by the annotations of a chosen annotation group: per annotation, how many members
 * are in the list and in which direction, plus an expandable log2FC distribution against the volcano background.
 */
export function AnnotationDescriptionSection({ data, suffixes, direction, submission_tag, listOptions, selectedListKeys, onToggleListKey }) {
    const [groupTag, setGroupTag] = useState(undefined)
    const [annotationLimit, setAnnotationLimit] = useState(ANNOTATION_LOAD_CHUNK)
    const [visibleRowCount, setVisibleRowCount] = useState(ROW_LIMIT)
    const [expandedTag, setExpandedTag] = useState(undefined)
    const [plotSuffix, setPlotSuffix] = useState(_.isArray(suffixes) ? suffixes[0] : undefined)

    useEffect(() => {
        setAnnotationLimit(ANNOTATION_LOAD_CHUNK)
        setVisibleRowCount(ROW_LIMIT)
        setExpandedTag(undefined)
    }, [groupTag])

    useEffect(() => {
        if (_.isArray(suffixes) && !suffixes.includes(plotSuffix)) setPlotSuffix(suffixes[0])
    }, [_.join(suffixes, ";")])

    const selectedTags = useMemo(() => {
        const set = new Set()
        ;(listOptions ?? []).filter(option => selectedListKeys.includes(option.key))
            .forEach(option => (option.tags ?? []).forEach(tag => set.add(tag)))
        return set
    }, [listOptions, selectedListKeys])

    const { data: groupedAnnotations, isLoading: groupsLoading } = api.annotations.queryAnnotations.useGetAnnotationsBySearchString(
        { search_string: "", limit: 10000, group_by_group: true },
        { staleTime: Infinity, enabled: _.isString(groupTag) && groupTag.length > 0 })

    const allAnnotationTags = useMemo(() => {
        if (!_.isArray(groupedAnnotations)) return []
        const group = groupedAnnotations.find(g => g.group_tag === groupTag)
        return _.isArray(group?.annotation_tags) ? group.annotation_tags : []
    }, [groupedAnnotations, groupTag])

    const visibleAnnotationTags = useMemo(() => allAnnotationTags.slice(0, annotationLimit), [allAnnotationTags, annotationLimit])

    const { isReady: proteinSetsReady, proteinTagsByAnnotation } = useAnnotationProteinSets({ submission_tag, annotation_tags: visibleAnnotationTags })
    const { textByAnnotation } = useAnnotationTexts(visibleAnnotationTags)

    const rowByTag = useMemo(() => (_.isArray(data) ? new Map(data.map(row => [row.tag, row])) : new Map()), [data])

    const backgroundValuesBySuffix = useMemo(() => _.fromPairs(suffixes.map(suffix => [suffix,
        (_.isArray(data) ? data.map(row => row[log2FCFieldName(suffix)]) : []).filter(_.isNumber)
    ])), [data, suffixes])

    const entries = useMemo(() => {
        if (!(selectedTags instanceof Set) || selectedTags.size === 0) return []
        return visibleAnnotationTags.map(tag => {
            const set = proteinTagsByAnnotation.get(tag)
            if (!(set instanceof Set) || set.size === 0) return null
            const overlapTags = [...set].filter(tag => selectedTags.has(tag))
            const rows = overlapTags.map(tag => rowByTag.get(tag)).filter(_.isObject)
            let up = 0
            let down = 0
            let both = 0
            rows.forEach(row => {
                const info = rowDirectionInfo(row, suffixes)
                if (info.discordant) both++
                else if (info.hasUp) up++
                else if (info.hasDown) down++
            })
            return { tag, total: set.size, overlapCount: overlapTags.length, up, down, both, memberTags: [...set] }
        }).filter(_.isObject)
            .sort((a, b) => b.overlapCount - a.overlapCount || b.total - a.total)
    }, [visibleAnnotationTags, proteinTagsByAnnotation, selectedTags, rowByTag, suffixes])

    const maxTotal = useMemo(() => _.max(entries.map(entry => entry.total)) || 1, [entries])
    const entriesWithScale = useMemo(() => entries.map(entry => ({ ...entry, maxTotal })), [entries, maxTotal])
    const visibleEntries = useMemo(() => entriesWithScale.slice(0, visibleRowCount), [entriesWithScale, visibleRowCount])

    const activePlotSuffix = _.isArray(suffixes) && suffixes.includes(plotSuffix) ? plotSuffix : suffixes?.[0]

    return <div>
        <div className="flex center-items flex--wrap margin-bottom--little" style={{ gap: "0.5rem" }}>
            <ListSelectionMenu listOptions={listOptions} selectedListKeys={selectedListKeys} onToggleListKey={onToggleListKey} />
            <AnnotationGroupSelectionMenu
                placeholder="Select annotation group"
                selected_tags={_.isString(groupTag) ? [groupTag] : []}
                onSelection={(e, tag) => setGroupTag(tag)}
                showTags={true} />
        </div>
        <div className="font-size--small margin-bottom--little">
            Describing <strong>{selectedTags.size}</strong> {directionLabel(direction).toLowerCase()} proteins
            {_.isString(groupTag) ? ` by the annotations of the selected group` : null}.
        </div>
        {!_.isString(groupTag) ? <span className="font-size--small">Select an annotation group to see how the selected list(s) are covered by its annotations.</span> : null}
        {_.isString(groupTag) && groupsLoading ? <Spinner size={20} /> : null}
        {_.isString(groupTag) && !groupsLoading && allAnnotationTags.length === 0 ? <span className="font-size--small">No annotations found for this group.</span> : null}
        {_.isString(groupTag) && allAnnotationTags.length > 0 && !proteinSetsReady ? <Spinner size={20} /> : null}
        {_.isString(groupTag) && allAnnotationTags.length > 0 && proteinSetsReady ? <div>
            {entriesWithScale.length === 0
                ? <span className="font-size--small">No overlap between the selected list(s) and the annotations of this group.</span>
                : <div className="flex flex-column">
                    <div className="flex center-items margin-bottom--little" style={{ gap: "0.4rem" }}>
                        <span className="font-size--smallest" style={{ width: "220px", flexShrink: 0 }}>Annotation</span>
                        <span className="font-size--smallest">members in list (up / down / both)</span>
                    </div>
                    {visibleEntries.map(entry => <AnnotationRow
                        key={entry.tag}
                        entry={entry}
                        label={textByAnnotation.get(entry.tag) ?? entry.tag}
                        isExpanded={expandedTag === entry.tag}
                        onToggle={() => setExpandedTag(expandedTag === entry.tag ? undefined : entry.tag)}
                        plotSuffix={activePlotSuffix}
                        suffixes={suffixes}
                        rowByTag={rowByTag}
                        backgroundValuesBySuffix={backgroundValuesBySuffix}
                        selectedTags={selectedTags}
                        setPlotSuffix={setPlotSuffix} />)}
                </div>}
            {visibleEntries.length < entriesWithScale.length
                ? <button className="basic-button--small margin-top--little"
                    onClick={() => setVisibleRowCount(visibleRowCount + ROW_LIMIT)}>
                    Show more ({Math.min(visibleRowCount, entriesWithScale.length)} of {entriesWithScale.length})
                </button>
                : null}
            {annotationLimit < allAnnotationTags.length
                ? <button className="basic-button--small margin-top--little"
                    onClick={() => setAnnotationLimit(annotationLimit + ANNOTATION_LOAD_CHUNK)}>
                    Load more annotations ({Math.min(annotationLimit, allAnnotationTags.length)} of {allAnnotationTags.length})
                </button>
                : null}
        </div> : null}
    </div>
}
