import _ from "lodash"
import { memo, useCallback, useEffect, useMemo, useState } from "react"
import { InputGroup, Menu, MenuItem, Popover, Spinner, Tooltip } from "@blueprintjs/core"
import { api } from "@/api"
import { AnnotationGroupSelectionMenu } from "../mitomap/AnnotationGroupSelection"
import { OptionButton } from "@/comps/core/base/buttons/OptionButton"
import { useAnnotationProteinSets, useAnnotationTexts } from "@/api/orchestrated/annotationProteins"
import { getItemFromLocalStorage, saveInLocalStorage } from "@/services/localstorage"
import { directionBarColor, directionLabel, log2FCFieldName, rowDirectionInfo } from "./compareUtils"

const ANNOTATION_LOAD_CHUNK = 50
const ROW_LIMIT = 30
const DISCORDANT_COLOR = "#e8c468"
const BAR_TRACK_WIDTH = 220
const GROUP_STORAGE_KEY = "volcanoAnnotationDescriptionGroup"

const SORT_MODES = [
    { key: "overlap", label: "Overlap" },
    { key: "coverage", label: "Coverage" },
    { key: "median", label: "|Median log2FC|" },
    { key: "purity", label: "Direction purity" }
]

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

function proteinDisplayName(proteinTagMap, tag) {
    if (!_.isString(tag)) return ""
    return tag.split(";").map(t => {
        const mapped = proteinTagMap instanceof Map ? proteinTagMap.get(t) : undefined
        return _.isObject(mapped) && _.isString(mapped.text) && mapped.text.length > 0 ? mapped.text : t
    }).join(", ")
}

function median(values) {
    const sorted = [...values].filter(_.isNumber).sort((a, b) => a - b)
    return quantile(sorted, 0.5)
}

function BoxPlotRow({ sorted, cy, boxHeight, color, x, withDots, points }) {
    const q1 = quantile(sorted, 0.25)
    const med = quantile(sorted, 0.5)
    const q3 = quantile(sorted, 0.75)
    const min = sorted[0]
    const max = sorted[sorted.length - 1]
    return <g>
        <line x1={x(min)} y1={cy} x2={x(max)} y2={cy} stroke={color} strokeWidth={1} />
        <line x1={x(min)} y1={cy - boxHeight / 2} x2={x(min)} y2={cy + boxHeight / 2} stroke={color} strokeWidth={1} />
        <line x1={x(max)} y1={cy - boxHeight / 2} x2={x(max)} y2={cy + boxHeight / 2} stroke={color} strokeWidth={1} />
        <rect x={x(q1)} y={cy - boxHeight / 2} width={Math.max(1, x(q3) - x(q1))} height={boxHeight}
            fill={color} fillOpacity={0.35} stroke={color} strokeWidth={1} />
        <line x1={x(med)} y1={cy - boxHeight / 2} x2={x(med)} y2={cy + boxHeight / 2} stroke={color} strokeWidth={2} />
        {withDots ? points.map((point, idx) => <circle key={idx}
            cx={x(point.value)}
            cy={cy + (((idx * 37) % 11) - 5)}
            r={point.inList ? 3.2 : 2.4}
            fill={point.inList ? "#d13913" : color}
            fillOpacity={point.inList ? 0.95 : 0.6}
            style={{ cursor: "pointer" }}
            onMouseEnter={point.onHover ? () => point.onHover() : undefined} />) : null}
    </g>
}

const LIST_COLOR = "#e8a33d"

function AnnotationLog2FCPlot({ entry, suffix, rowByTag, backgroundValues, selectedTags, proteinTagMap, setRequiredProteinTags }) {
    const width = 340
    const height = 190
    const [hoveredPoint, setHoveredPoint] = useState(null)
    const points = useMemo(() => entry.memberTags
        .map(tag => rowByTag.get(tag))
        .filter(row => _.isObject(row) && _.isNumber(row[log2FCFieldName(suffix)]))
        .map(row => ({ value: row[log2FCFieldName(suffix)], inList: selectedTags.has(row.tag), tag: row.tag })),
        [entry, suffix, rowByTag, selectedTags])
    const sortedPointValues = useMemo(() => points.map(p => p.value).sort((a, b) => a - b), [points])
    const sortedListValues = useMemo(() => [...selectedTags]
        .map(tag => rowByTag.get(tag))
        .map(row => _.isObject(row) ? row[log2FCFieldName(suffix)] : undefined)
        .filter(_.isNumber)
        .sort((a, b) => a - b), [selectedTags, rowByTag, suffix])
    const allValues = useMemo(() => [...backgroundValues, ...sortedPointValues, ...sortedListValues], [backgroundValues, sortedPointValues, sortedListValues])
    useEffect(() => {
        if (!_.isFunction(setRequiredProteinTags)) return
        const missing = entry.memberTags.filter(tag => !(proteinTagMap instanceof Map && proteinTagMap.has(tag)))
        if (missing.length === 0) return
        setRequiredProteinTags(prev => _.isArray(prev) ? _.uniq([...prev, ...missing]) : missing)
    }, [entry, proteinTagMap])
    if (allValues.length === 0) return <span className="font-size--smallest">No log2FC values for this volcano.</span>
    const min = Math.min(...allValues)
    const max = Math.max(...allValues)
    // symmetric domain around 0 so the zero line is centered and distribution skew is visible at a glance
    const maxAbs = Math.max(Math.abs(min), Math.abs(max))
    const pad = maxAbs * 0.05 || 1
    const x0 = -maxAbs - pad
    const x1 = maxAbs + pad
    const x = value => 10 + ((value - x0) / (x1 - x0)) * (width - 20)
    const zeroX = x(0)
    const hoveredName = hoveredPoint ? proteinDisplayName(proteinTagMap, hoveredPoint.tag) : ""
    const hoveredLabelX = hoveredPoint ? Math.min(Math.max(x(hoveredPoint.value), 50), width - 50) : 0
    return <svg width={width} height={height} style={{ maxWidth: "100%" }}>
        <line x1={zeroX} y1={12} x2={zeroX} y2={height - 22} stroke="#8a8a8a" strokeDasharray="3,3" strokeWidth={1} />
        <text x={zeroX} y={10} fontSize="9" textAnchor="middle" fill="#8a8a8a">0</text>
        <text x={x(min)} y={height - 8} fontSize="9" textAnchor="middle" fill="#8a8a8a">{min.toFixed(2)}</text>
        <text x={x(max)} y={height - 8} fontSize="9" textAnchor="middle" fill="#8a8a8a">{max.toFixed(2)}</text>
        <text x={6} y={39} fontSize="9" fill="#8a8a8a">all</text>
        <text x={6} y={89} fontSize="9" fill="#8a8a8a">list</text>
        <text x={6} y={144} fontSize="9" fill="#8a8a8a">ann.</text>
        <BoxPlotRow sorted={backgroundValues} cy={35} boxHeight={14} color="#9a9a9a" x={x} withDots={false} points={[]} />
        <BoxPlotRow sorted={sortedListValues} cy={85} boxHeight={14} color={LIST_COLOR} x={x} withDots={false} points={[]} />
        <g onMouseLeave={() => setHoveredPoint(null)}>
            <BoxPlotRow sorted={sortedPointValues} cy={140} boxHeight={18} color="#4a7ba6" x={x} withDots={true} points={points.map(p => ({ ...p, onHover: () => setHoveredPoint(p) }))} />
        </g>
        {hoveredPoint ? <text x={hoveredLabelX} y={118} fontSize="10" textAnchor="middle" fill="#000000" fontWeight="bold">{hoveredName}</text> : null}
    </svg>
}

const AnnotationRow = memo(function AnnotationRow({ entry, label, isExpanded, onToggleRow, plotSuffix, setPlotSuffix, suffixes, rowByTag,
        backgroundValuesBySuffix, selectedTags, listOptions, selectedListKeys, markedProteinTags, onMarkProteinList, onLabelProteinList,
        proteinTagMap, setRequiredProteinTags }) {
    const segment = (count, color, key) => count > 0
        ? <div key={key} style={{ width: `${(count / entry.total) * BAR_TRACK_WIDTH}px`, minWidth: "2px", height: "0.9rem", backgroundColor: color }} />
        : null
    const overlapTags = entry.overlapTags
    const listIsMarked = overlapTags.length > 0 && _.difference(overlapTags, markedProteinTags ?? []).length === 0
    const tooltipLines = [
        `${entry.tag} — ${entry.overlapCount} of ${entry.total} members in selected list(s), |median log2FC| = ${_.isNumber(entry.med) ? Math.abs(entry.med).toFixed(2) : "-"}`,
        ...listOptions.filter(option => selectedListKeys.includes(option.key))
            .map(option => `${option.label}: ${overlapTags.filter(tag => option.tags.includes(tag)).length}`)
    ].join("\n")
    return <div className="margin-bottom--little">
        <Tooltip compact={true} content={<div style={{ whiteSpace: "pre-line" }}>{tooltipLines}</div>}>
            <div className="flex center-items"
                style={{ gap: "0.4rem", cursor: "pointer", backgroundColor: isExpanded ? "#efefef" : "white" }}
                onClick={() => onToggleRow(entry.tag)}>
                <span className="font-size--small" style={{ width: "200px", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
                <div className="flex center-items" style={{ width: `${BAR_TRACK_WIDTH}px`, height: "0.9rem", backgroundColor: "#efefef", flexShrink: 0 }}>
                    {segment(entry.up, directionBarColor("up"), "up")}
                    {segment(entry.down, directionBarColor("down"), "down")}
                    {segment(entry.both, DISCORDANT_COLOR, "both")}
                </div>
                <span className="font-size--small font-weight--bold">{entry.overlapCount}</span>
                <span className="font-size--smallest">of {entry.total}</span>
                <span className="font-size--smallest" style={{
                    width: "4.5rem", flexShrink: 0, textAlign: "right",
                    color: entry.med > 0 ? "#3d7a3a" : entry.med < 0 ? "#7a4d96" : "#8a8a8a"
                }}>{_.isNumber(entry.med) ? entry.med.toFixed(2) : "-"}</span>
                {_.isFunction(onMarkProteinList) ? <button className="basic-button--small" style={{ flexShrink: 0, fontWeight: listIsMarked ? "bold" : "normal" }}
                    onClick={(e) => { e.stopPropagation(); onMarkProteinList(listIsMarked ? [] : overlapTags) }}>
                    {listIsMarked ? "Unmark" : "Mark"}
                </button> : null}
                {_.isFunction(onLabelProteinList) ? <button className="basic-button--small" style={{ flexShrink: 0 }}
                    onClick={(e) => { e.stopPropagation(); onLabelProteinList(overlapTags) }}>
                    Label
                </button> : null}
            </div>
        </Tooltip>
        {isExpanded ? <div className="margin-top--little margin-left--medium">
            <div className="flex center-items margin-bottom--little" style={{ gap: "0.3rem", flexWrap: "wrap" }}>
                <span className="font-size--smallest">log2FC volcano:</span>
                {suffixes.map(suffix => <OptionButton key={suffix} isSelected={suffix === plotSuffix} onClick={() => setPlotSuffix(suffix)}>{suffix}</OptionButton>)}
            </div>
            <AnnotationLog2FCPlot entry={entry} suffix={plotSuffix} rowByTag={rowByTag}
                backgroundValues={backgroundValuesBySuffix[plotSuffix] ?? []} selectedTags={selectedTags}
                proteinTagMap={proteinTagMap} setRequiredProteinTags={setRequiredProteinTags} />
            <div className="flex center-items flex--wrap margin-top--little" style={{ gap: "0.6rem" }}>
                {[
                    { color: "#9a9a9a", label: "all proteins of the volcano (background)", shape: "box" },
                    { color: LIST_COLOR, label: "selected list(s) distribution", shape: "box" },
                    { color: "#4a7ba6", label: "member of this annotation", shape: "dot" },
                    { color: "#d13913", label: "in selected list(s)", shape: "dot" }
                ].map(item => <span key={item.label} className="flex center-items font-size--smallest" style={{ gap: "0.25rem" }}>
                    {item.shape === "box"
                        ? <span style={{ width: "0.8rem", height: "0.45rem", backgroundColor: item.color, opacity: 0.35, border: `1px solid ${item.color}`, display: "inline-block" }} />
                        : <span style={{ width: "0.55rem", height: "0.55rem", borderRadius: "50%", backgroundColor: item.color, display: "inline-block" }} />}
                    {item.label}
                </span>)}
            </div>
        </div> : null}
    </div>
})

function exportDescriptionAsCSV({ entries, labels, suffixes, groupTag, rowByTag }) {
    const header = ["Annotation", "Tag", "Members in submission", "In selected list(s)", "Up", "Down", "Both directions",
        ...suffixes.flatMap(suffix => [`Median log2FC (${suffix})`])]
    const lines = [header.join("\t")]
    entries.forEach(entry => {
        lines.push([
            `"${(labels.get(entry.tag) ?? entry.tag).replace(/"/g, "")}"`,
            entry.tag,
            entry.total,
            entry.overlapCount,
            entry.up,
            entry.down,
            entry.both,
            ...suffixes.map(suffix => {
                const med = median(entry.memberTags
                    .map(tag => rowByTag.get(tag))
                    .map(row => _.isObject(row) ? row[log2FCFieldName(suffix)] : undefined))
                return _.isNumber(med) ? med.toFixed(4) : ""
            })
        ].join("\t"))
    })
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `annotation-description-${groupTag ?? "group"}.csv`
    link.click()
    URL.revokeObjectURL(url)
}

/**
 * @description Persisted multi-select state for the list options of the annotation description view.
 * Stored list keys are validated against the currently available options (falling back to fallbackKey),
 * so stale keys from other volcano contexts are dropped.
 */
export function usePersistedListKeys({ listOptions, storageKey, fallbackKey = "all" }) {
    const [selectedListKeys, setSelectedListKeys] = useState(() => {
        const { itemFound, itemValue } = getItemFromLocalStorage({ itemName: storageKey, parseJson: true })
        return itemFound && _.isArray(itemValue) && itemValue.length > 0 ? itemValue.filter(_.isString) : [fallbackKey]
    })
    useEffect(() => {
        if (_.isArray(selectedListKeys) && selectedListKeys.length > 0)
            saveInLocalStorage({ itemName: storageKey, itemValue: JSON.stringify(selectedListKeys) })
    }, [_.join(selectedListKeys, ";")])
    const validListKeys = useMemo(() => {
        const keys = (listOptions ?? []).map(option => option.key)
        const stored = selectedListKeys.filter(key => keys.includes(key))
        return stored.length > 0 ? stored : [fallbackKey]
    }, [listOptions, selectedListKeys, fallbackKey])
    const toggleListKey = useCallback((key) => setSelectedListKeys(validListKeys.includes(key)
        ? (validListKeys.length > 1 ? validListKeys.filter(k => k !== key) : validListKeys)
        : [...validListKeys, key]), [validListKeys])
    return { selectedListKeys: validListKeys, toggleListKey }
}

/**
 * @description Describes one or more selectable protein lists (default: all significant proteins of the
 * current direction) by the annotations of a chosen annotation group: per annotation, how many members
 * are in the list and in which direction, plus an expandable log2FC distribution against the volcano background.
 */
export function AnnotationDescriptionSection({ data, suffixes, direction, submission_tag, listOptions, selectedListKeys, onToggleListKey,
        markedProteinTags = [], onMarkProteinList, onLabelProteinList, proteinTagMap, setRequiredProteinTags }) {
    const [groupTag, setGroupTagState] = useState(() => {
        const { itemFound, itemValue } = getItemFromLocalStorage({ itemName: GROUP_STORAGE_KEY })
        return itemFound && _.isString(itemValue) && itemValue.length > 0 ? itemValue : undefined
    })
    const setGroupTag = (tag) => {
        setGroupTagState(tag)
        if (_.isString(tag) && tag.length > 0) saveInLocalStorage({ itemName: GROUP_STORAGE_KEY, itemValue: tag })
    }
    const [annotationLimit, setAnnotationLimit] = useState(ANNOTATION_LOAD_CHUNK)
    const [visibleRowCount, setVisibleRowCount] = useState(ROW_LIMIT)
    const [expandedTag, setExpandedTag] = useState(undefined)
    const [plotSuffix, setPlotSuffix] = useState(_.isArray(suffixes) ? suffixes[0] : undefined)
    const [sortMode, setSortMode] = useState("overlap")
    const [searchString, setSearchString] = useState("")

    useEffect(() => {
        setAnnotationLimit(ANNOTATION_LOAD_CHUNK)
        setVisibleRowCount(ROW_LIMIT)
        setExpandedTag(undefined)
    }, [groupTag])

    useEffect(() => {
        if (_.isArray(suffixes) && !suffixes.includes(plotSuffix)) setPlotSuffix(suffixes[0])
    }, [_.join(suffixes, ";")])

    const activePlotSuffix = _.isArray(suffixes) && suffixes.includes(plotSuffix) ? plotSuffix : suffixes?.[0]

    const handleToggleRow = useCallback((tag) => setExpandedTag(prev => prev === tag ? undefined : tag), [])

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
            .sort((a, b) => a - b)
    ])), [data, suffixes])

    const entries = useMemo(() => {
        if (!(selectedTags instanceof Set) || selectedTags.size === 0) return []
        return visibleAnnotationTags.map(tag => {
            const set = proteinTagsByAnnotation.get(tag)
            if (!(set instanceof Set) || set.size === 0) return null
            const overlapTags = selectedTags.size <= set.size
                ? [...selectedTags].filter(tag => set.has(tag))
                : [...set].filter(tag => selectedTags.has(tag))
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
            return { tag, total: set.size, overlapTags, overlapCount: overlapTags.length, up, down, both, memberTags: [...set], rows }
        }).filter(_.isObject)
    }, [visibleAnnotationTags, proteinTagsByAnnotation, selectedTags, rowByTag, suffixes])

    const sortedEntries = useMemo(() => {
        const fcName = log2FCFieldName(activePlotSuffix)
        const withStats = entries.map(entry => ({
            ...entry,
            med: median(entry.rows.map(row => row[fcName])),
            purity: (entry.up - entry.down) / Math.max(1, entry.up + entry.down + entry.both)
        }))
        if (sortMode === "coverage") withStats.sort((a, b) => (b.overlapCount / b.total) - (a.overlapCount / a.total) || b.overlapCount - a.overlapCount)
        else if (sortMode === "median") withStats.sort((a, b) => Math.abs(b.med ?? 0) - Math.abs(a.med ?? 0))
        else if (sortMode === "purity") withStats.sort((a, b) => b.purity - a.purity)
        else withStats.sort((a, b) => b.overlapCount - a.overlapCount || b.total - a.total)
        return withStats
    }, [entries, sortMode, activePlotSuffix])

    // annotations without any member in the selected list(s) are hidden from the rows
    const displayEntries = useMemo(() => sortedEntries.filter(entry => entry.overlapCount > 0), [sortedEntries])

    const filteredEntries = useMemo(() => {
        const query = searchString.trim().toLowerCase()
        if (query.length === 0) return displayEntries
        return displayEntries.filter(entry =>
            entry.tag.toLowerCase().includes(query) || (textByAnnotation.get(entry.tag) ?? "").toLowerCase().includes(query))
    }, [displayEntries, searchString, textByAnnotation])

    const hasAnyOverlap = useMemo(() => sortedEntries.some(entry => entry.overlapCount > 0), [sortedEntries])

    const visibleEntries = useMemo(() => filteredEntries.slice(0, visibleRowCount), [filteredEntries, visibleRowCount])

    const summary = useMemo(() => {
        const rows = [...selectedTags].map(tag => rowByTag.get(tag)).filter(_.isObject)
        let up = 0
        let down = 0
        let both = 0
        rows.forEach(row => {
            const info = rowDirectionInfo(row, suffixes)
            if (info.discordant) both++
            else if (info.hasUp) up++
            else if (info.hasDown) down++
        })
        const covered = entries.filter(entry => entry.overlapCount > 0)
        return {
            selected: selectedTags.size, up, down, both,
            coveredCount: covered.length,
            coveredThreePlus: covered.filter(entry => entry.overlapCount >= 3).length,
            groupCount: entries.length
        }
    }, [selectedTags, rowByTag, suffixes, entries])

    const searchIsActive = searchString.trim().length > 0

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
            Describing <strong>{summary.selected}</strong> {directionLabel(direction).toLowerCase()} proteins
            {suffixes.length > 1
                ? ` — ${summary.up} only up, ${summary.down} only down, ${summary.both} both directions across volcanos`
                : null}
            {_.isString(groupTag) && proteinSetsReady
                ? ` — covered by ${summary.coveredCount} of ${summary.groupCount} annotations of this group (${summary.coveredThreePlus} with 3+ members)`
                : null}.
        </div>
        {!_.isString(groupTag) ? <span className="font-size--small">Select an annotation group to see how the selected list(s) are covered by its annotations.</span> : null}
        {_.isString(groupTag) && groupsLoading ? <Spinner size={20} /> : null}
        {_.isString(groupTag) && !groupsLoading && allAnnotationTags.length === 0 ? <span className="font-size--small">No annotations found for this group.</span> : null}
        {_.isString(groupTag) && allAnnotationTags.length > 0 && !proteinSetsReady ? <Spinner size={20} /> : null}
        {_.isString(groupTag) && allAnnotationTags.length > 0 && proteinSetsReady ? <div>
            <div className="flex center-items flex--wrap margin-bottom--little" style={{ gap: "0.4rem" }}>
                <InputGroup small={true} leftIcon="search" placeholder="Filter annotations..."
                    value={searchString} onChange={e => setSearchString(e.target.value)} style={{ width: "200px" }} />
                <span className="font-size--smallest">Sort:</span>
                {SORT_MODES.map(mode => <OptionButton key={mode.key} isSelected={sortMode === mode.key} onClick={() => setSortMode(mode.key)}>{mode.label}</OptionButton>)}
                <button className="basic-button--small"
                    disabled={filteredEntries.length === 0}
                    onClick={() => exportDescriptionAsCSV({ entries: filteredEntries, labels: textByAnnotation, suffixes, groupTag, rowByTag })}>
                    Export CSV
                </button>
            </div>
            {filteredEntries.length === 0
                ? <span className="font-size--small">{!hasAnyOverlap
                    ? "No overlap between the selected list(s) and the annotations of this group."
                    : "No annotations match the filter."}</span>
                : <div className="flex flex-column">
                    <div className="flex center-items margin-bottom--little" style={{ gap: "0.4rem" }}>
                        <span className="font-size--smallest" style={{ width: "200px", flexShrink: 0 }}>Annotation</span>
                        <span className="font-size--smallest">bar fill = share of annotation members in list:</span>
                        {[
                            { color: directionBarColor("up"), label: "up" },
                            { color: directionBarColor("down"), label: "down" },
                            { color: DISCORDANT_COLOR, label: "both directions" },
                            { color: "#efefef", label: "not in list", border: "1px solid #d8d8d8" }
                        ].map(item => <span key={item.label} className="flex center-items font-size--smallest" style={{ gap: "0.2rem" }}>
                            <span style={{ width: "0.6rem", height: "0.6rem", backgroundColor: item.color, border: item.border ?? "none", display: "inline-block" }} />
                            {item.label}
                        </span>)}
                        <span className="font-size--smallest" style={{ width: "4.5rem", flexShrink: 0, textAlign: "right" }}>med. log2FC</span>
                    </div>
                    {visibleEntries.map(entry => <AnnotationRow
                        key={entry.tag}
                        entry={entry}
                        label={textByAnnotation.get(entry.tag) ?? entry.tag}
                        isExpanded={expandedTag === entry.tag}
                        onToggleRow={handleToggleRow}
                        plotSuffix={activePlotSuffix}
                        setPlotSuffix={setPlotSuffix}
                        suffixes={suffixes}
                        rowByTag={rowByTag}
                        backgroundValuesBySuffix={backgroundValuesBySuffix}
                        selectedTags={selectedTags}
                        listOptions={listOptions}
                        selectedListKeys={selectedListKeys}
                        markedProteinTags={markedProteinTags}
                        onMarkProteinList={onMarkProteinList}
                        onLabelProteinList={onLabelProteinList}
                        proteinTagMap={proteinTagMap} setRequiredProteinTags={setRequiredProteinTags} />)}
                </div>}
            {visibleEntries.length < filteredEntries.length
                ? <button className="basic-button--small margin-top--little"
                    onClick={() => setVisibleRowCount(visibleRowCount + ROW_LIMIT)}>
                    Show more ({Math.min(visibleRowCount, filteredEntries.length)} of {filteredEntries.length})
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
