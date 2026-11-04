import _ from "lodash"
import { useEffect, useMemo, useRef, useState } from "react"
import { Button, Checkbox, Dialog, DialogBody, Drawer, HTMLTable, InputGroup, Tab, Tabs, Tag, Tooltip } from "@blueprintjs/core"
import { useNavigate } from "react-router"
import { api } from "@/api"
import useDebounce from "@/hooks/useDebounce"
import { AnnotationGroupSelectionMenu } from "../mitomap/AnnotationGroupSelection"
import { AnnotationSelectionMenu } from "@/comps/core/base/annotations/AnnotationSelectionMenu"
import { OptionButton } from "@/comps/core/base/buttons/OptionButton"
import { useAnnotationProteinSets } from "@/api/orchestrated/annotationProteins"
import { AnnotationDescriptionSection } from "./AnnotationDescription"
import { directionBarColor, directionLabel, directionTags, getSignificantRows, getSignatureEntries, isSignificantValue, log2FCFieldName, pValueFieldName, rowDirectionInfo, rowProteinTags, significantFieldName } from "./compareUtils"

export { getSignificantRows }


const PAGE_SIZE = 50



function formatLog2FC(log2fc) {
    return _.isNumber(log2fc) ? log2fc.toFixed(2) : "-"
}

function formatFoldChange(log2fc) {
    if (!_.isNumber(log2fc)) return "-"
    const fc = Math.pow(2, log2fc)
    return fc >= 100 ? fc.toFixed(0) : fc >= 10 ? fc.toFixed(1) : fc.toFixed(2)
}

function formatPValue(negLog10P) {
    return _.isNumber(negLog10P) ? negLog10P.toFixed(2) : "-"
}

function proteinNameByTag(proteinTagMap, tag) {
    const mapped = proteinTagMap instanceof Map ? proteinTagMap.get(tag) : undefined
    return _.isObject(mapped) && _.isString(mapped.text) && mapped.text.length > 0 ? mapped.text : tag
}

function displayNamesForRow(proteinTagMap, row) {
    const tags = _.isString(row.tag) ? row.tag.split(";") : []
    return tags.map(tag => proteinNameByTag(proteinTagMap, tag)).join(", ")
}

function RowDirectionBadge({ row, suffixes }) {
    const { hasUp, hasDown, discordant } = rowDirectionInfo(row, suffixes)
    if (discordant) return <Tooltip content="Significant in both directions across volcanos (up and down)." compact={true}>
        <span className="font-size--small font-weight--bold">{"\u2191\u2193"}</span>
    </Tooltip>
    if (hasUp) return <span className="font-size--small font-weight--bold">{"\u2191"}</span>
    if (hasDown) return <span className="font-size--small font-weight--bold">{"\u2193"}</span>
    return null
}

function rowDirectionBackgroundColor(row, suffixes) {
    const { hasUp, hasDown, discordant } = rowDirectionInfo(row, suffixes)
    if (discordant) return "#fdf3d7"
    if (hasUp) return "#eef7ee"
    if (hasDown) return "#f5eff9"
    return undefined
}

function sortRowsForTable(rows, sortState, suffixes, proteinTagMap) {
    if (!_.isObject(sortState) || !_.isString(sortState.key)) return rows
    const [columnType, suffix] = sortState.key.split("::")
    const valueOf = row => {
        if (columnType === "name") return displayNamesForRow(proteinTagMap, row).toLowerCase()
        if (!_.isString(suffix)) return undefined
        const log2fc = row[log2FCFieldName(suffix)]
        if (columnType === "fc") return _.isNumber(log2fc) ? Math.pow(2, log2fc) : undefined
        if (columnType === "p") return row[pValueFieldName(suffix)]
        return log2fc
    }
    const directionFactor = sortState.order === "asc" ? 1 : -1
    return [...rows].sort((a, b) => {
        const valueA = valueOf(a)
        const valueB = valueOf(b)
        if (valueA === valueB) return 0
        if (valueB === undefined) return -1
        if (valueA === undefined) return 1
        return (valueA < valueB ? -1 : 1) * directionFactor
    })
}

function SortableTh({ sortKey, sortState, onSortChange, children }) {
    const isActive = _.isObject(sortState) && sortState.key === sortKey
    const handleClick = () => onSortChange(isActive
        ? { key: sortKey, order: sortState.order === "asc" ? "desc" : "asc" }
        : { key: sortKey, order: "desc" })
    return <th style={{ cursor: "pointer", userSelect: "none" }} onClick={handleClick}>
        {children} <span className="font-size--smallest">{isActive ? (sortState.order === "asc" ? "\u25b2" : "\u25bc") : "\u21c5"}</span>
    </th>
}

function exportRowsAsCSV({ rows, suffixes, proteinTagMap, fileName }) {
    const header = ["Protein", "Tags", ...suffixes.flatMap(suffix => [`log2FC (${suffix})`, `-log10 p-value (${suffix})`, `Fold change (${suffix})`])]
    const lines = [header.join("\t")]
    _.forEach(rows, row => {
        lines.push([
            `"${displayNamesForRow(proteinTagMap, row)}"`,
            row.tag,
            ...suffixes.flatMap(suffix => [formatLog2FC(row[log2FCFieldName(suffix)]), formatPValue(row[pValueFieldName(suffix)]), formatFoldChange(row[log2FCFieldName(suffix)])])
        ].join("\t"))
    })
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = fileName
    link.click()
    URL.revokeObjectURL(url)
}

function usePrefetchProteinNames(rows, proteinTagMap, setRequiredProteinTags) {
    const requestedTags = useRef(new Set())
    useEffect(() => {
        if (!_.isFunction(setRequiredProteinTags) || !_.isArray(rows) || rows.length === 0) return
        const missing = _.uniq(rows.flatMap(row => rowProteinTags(row)))
            .filter(tag => !requestedTags.current.has(tag) && !(proteinTagMap instanceof Map && proteinTagMap.has(tag)))
        if (missing.length === 0) return
        missing.forEach(tag => requestedTags.current.add(tag))
        setRequiredProteinTags(prev => _.isArray(prev) ? _.uniq([...prev, ...missing]) : missing)
    }, [rows, proteinTagMap])
}


/**
 * @description Table of significant proteins. Search string and pagination are controlled by the parent
 * (so they survive closing the drawer); rows can be ticked to label the proteins in the volcano plot.
 */
export function SignificantProteinTable({ rows, suffixes, proteinTagMap, setRequiredProteinTags, direction, submission_tag,
        searchString, onSearchStringChange, visibleCount, onVisibleCountChange, selectedProteinTags = [], onToggleProteinLabel, onLabelProteinList,
        markedProteinTags = [], onMarkProteinList, onRemoveAllLabels, sortState, onSortChange,
        annotationFilterTags = [], onAnnotationFilterTagsChange }) {
    const navigate = useNavigate()
    const debouncedSearchString = useDebounce(searchString, 300)

    const { proteinTagsByAnnotation } = useAnnotationProteinSets({
        submission_tag,
        annotation_tags: annotationFilterTags
    })

    const searchIsInactive = !_.isString(searchString) || searchString.trim().length === 0

    // server-side gene name search, same search as the volcano plot protein search
    const { data: searchResults, isLoading: searchIsLoading } = api.features.proteinsQuery.useGetProteinFeatureByQuery(
        { search_string: debouncedSearchString, limit: 100000, submission_tags: [submission_tag] },
        { staleTime: 60000, enabled: !searchIsInactive && debouncedSearchString.trim().length > 1 && _.isString(submission_tag) })

    const filteredRows = useMemo(() => {
        if (!_.isArray(rows)) return []
        let result = rows
        if (!searchIsInactive) {
            const query = debouncedSearchString.trim().toLowerCase()
            const matchedTags = _.isArray(searchResults) ? new Set(searchResults) : undefined
            result = result.filter(row => {
                if (_.isString(row.tag) && row.tag.toLowerCase().includes(query)) return true
                const tags = rowProteinTags(row)
                if (matchedTags) return tags.some(tag => matchedTags.has(tag))
                return displayNamesForRow(proteinTagMap, row).toLowerCase().includes(query)
            })
        }
        const activeAnnotationSets = annotationFilterTags
            .map(tag => proteinTagsByAnnotation.get(tag))
            .filter(set => set instanceof Set)
        if (activeAnnotationSets.length > 0) {
            result = result.filter(row => {
                const tags = rowProteinTags(row)
                return activeAnnotationSets.every(set => tags.some(tag => set.has(tag)))
            })
        }
        return result
    }, [rows, debouncedSearchString, searchResults, searchIsInactive, proteinTagMap, annotationFilterTags, proteinTagsByAnnotation])

    const sortedFilteredRows = useMemo(() => sortRowsForTable(filteredRows, sortState, suffixes, proteinTagMap), [filteredRows, sortState, suffixes, proteinTagMap])

    const visibleRows = useMemo(() => sortedFilteredRows.slice(0, visibleCount), [sortedFilteredRows, visibleCount])

    const filteredProteinTags = useMemo(() => _.uniq(filteredRows.flatMap(row => rowProteinTags(row))), [filteredRows])
    const listIsMarked = useMemo(() => filteredProteinTags.length > 0
        && _.difference(filteredProteinTags, markedProteinTags).length === 0, [filteredProteinTags, markedProteinTags])

    // without an active search, protein names are only fetched for the visible rows
    usePrefetchProteinNames(searchIsInactive ? visibleRows : filteredRows, proteinTagMap, setRequiredProteinTags)

    const handleToggleLabel = (row) => {
        if (!_.isFunction(onToggleProteinLabel)) return
        const tags = rowProteinTags(row)
        const allSelected = tags.every(tag => selectedProteinTags.includes(tag))
        tags.forEach(tag => {
            if (allSelected || !selectedProteinTags.includes(tag)) onToggleProteinLabel(tag)
        })
    }

    if (!_.isArray(rows) || rows.length === 0) {
        return <span>No {directionLabel(direction).toLowerCase()} proteins found.</span>
    }

    return <div>
        <div className="flex center-items margin-bottom--little" style={{ gap: "0.3rem" }}>
            <InputGroup
                style={{ flex: 1 }}
                small={true}
                leftIcon="search"
                placeholder="Filter proteins by gene name or tag..."
                value={searchString}
                onChange={e => onSearchStringChange(e.target.value)}
                rightElement={searchIsInactive ? undefined :
                    <Button small={true} variant="minimal" icon={searchIsLoading ? "refresh" : "cross"} onClick={() => onSearchStringChange("")} />} />
            {_.isFunction(onLabelProteinList) ? <button className="basic-button--small"
                disabled={filteredRows.length === 0}
                onClick={() => onLabelProteinList(_.uniq(filteredRows.flatMap(row => rowProteinTags(row))))}>
                Label list
            </button> : null}
            {_.isFunction(onMarkProteinList) ? <button className="basic-button--small"
                style={listIsMarked ? { fontWeight: "bold", border: "1px solid #f5b301" } : {}}
                disabled={filteredRows.length === 0}
                onClick={() => onMarkProteinList(listIsMarked ? [] : filteredProteinTags)}>
                {listIsMarked ? "Unmark list" : "Mark list"}
            </button> : null}
            {_.isFunction(onRemoveAllLabels) ? <button className="basic-button--small"
                disabled={(selectedProteinTags ?? []).length === 0}
                onClick={onRemoveAllLabels}>
                Remove all labels
            </button> : null}
            {_.isString(submission_tag) ? <SaveAsAnnotationButton rows={filteredRows} submission_tag={submission_tag} /> : null}
            <button className="basic-button--small"
                disabled={filteredRows.length === 0}
                onClick={() => exportRowsAsCSV({ rows: filteredRows, suffixes, proteinTagMap, fileName: `significant-proteins-${direction}.csv` })}>
                Export CSV
            </button>
        </div>
        {_.isFunction(onAnnotationFilterTagsChange) ? <div className="flex center-items flex--wrap margin-bottom--little" style={{ gap: "0.3rem" }}>
            <AnnotationSelectionMenu
                placeholder="Filter by annotation"
                onSelection={(e, tag) => {
                    if (!_.isString(tag) || annotationFilterTags.includes(tag)) return
                    onAnnotationFilterTagsChange([...annotationFilterTags, tag])
                }}
                selected_tags={annotationFilterTags}
                showTags={false}
                submission_tags={[submission_tag]} />
            {annotationFilterTags.map(tag => <Tag key={tag} minimal={true} onRemove={() => onAnnotationFilterTagsChange(annotationFilterTags.filter(t => t !== tag))}>{tag}</Tag>)}
        </div> : null}
        <div style={{ maxHeight: "40vh", overflowY: "auto", overflowX: "auto" }}>
            <HTMLTable compact={true} striped={true} style={{ width: "100%" }}>
                <thead style={{ position: "sticky", top: 0, backgroundColor: "#ffffff", zIndex: 1, boxShadow: "0 1px 0 rgba(0,0,0,0.2)" }}>
                    <tr>
                        {_.isFunction(onToggleProteinLabel) ? <th>Label</th> : null}
                        <SortableTh sortKey="name" sortState={sortState} onSortChange={onSortChange}>Protein</SortableTh>
                        {direction === "all" ? <th>Direction</th> : null}
                        {suffixes.map(suffix => <SortableTh key={`log2fc-${suffix}`} sortKey={`log2FC::${suffix}`} sortState={sortState} onSortChange={onSortChange}>{`log2FC (${suffix})`}</SortableTh>)}
                        {suffixes.map(suffix => <SortableTh key={`p-${suffix}`} sortKey={`p::${suffix}`} sortState={sortState} onSortChange={onSortChange}>{`-log10 p-value (${suffix})`}</SortableTh>)}
                        {suffixes.map(suffix => <SortableTh key={`fc-${suffix}`} sortKey={`fc::${suffix}`} sortState={sortState} onSortChange={onSortChange}>{`Fold change (${suffix})`}</SortableTh>)}
                    </tr>
                </thead>
                <tbody>
                    {visibleRows.map(row => {
                        const tags = rowProteinTags(row)
                        const selectedTagCount = tags.filter(tag => selectedProteinTags.includes(tag)).length
                        const rowBackgroundColor = direction === "all" ? rowDirectionBackgroundColor(row, suffixes) : undefined
                        return <tr key={row.tag} style={{ backgroundColor: rowBackgroundColor }}>
                            {_.isFunction(onToggleProteinLabel) ? <td><Checkbox
                                checked={selectedTagCount > 0}
                                indeterminate={selectedTagCount > 0 && selectedTagCount < tags.length}
                                onChange={() => handleToggleLabel(row)} /></td> : null}
                            <td>
                                {tags.length === 1
                                    ? <span style={{ cursor: "pointer", textDecoration: "underline" }}
                                        onClick={() => navigate(`/protein/${tags[0]}`)}>
                                        {displayNamesForRow(proteinTagMap, row)}
                                    </span>
                                    : displayNamesForRow(proteinTagMap, row)}
                            </td>
                            {direction === "all" ? <td><RowDirectionBadge row={row} suffixes={suffixes} /></td> : null}
                            {suffixes.map(suffix => <td key={`log2fc-${suffix}`}>{formatLog2FC(row[log2FCFieldName(suffix)])}</td>)}
                            {suffixes.map(suffix => <td key={`p-${suffix}`}>{formatPValue(row[pValueFieldName(suffix)])}</td>)}
                            {suffixes.map(suffix => <td key={`fc-${suffix}`}>{formatFoldChange(row[log2FCFieldName(suffix)])}</td>)}
                        </tr>
                    })}
                </tbody>
            </HTMLTable>
        </div>
        {visibleCount < filteredRows.length
            ? <button className="basic-button--small margin-top--little"
                onClick={() => onVisibleCountChange(visibleCount + PAGE_SIZE)}>
                Show more ({Math.min(visibleCount, filteredRows.length)} of {filteredRows.length})
            </button>
            : <span className="font-size--smallest">
                {filteredRows.length < rows.length
                    ? `Showing ${filteredRows.length} of ${rows.length} proteins (filtered).`
                    : `Showing all ${rows.length} proteins.`}
            </span>}
    </div>
}


function SaveAsAnnotationButton({ rows, submission_tag }) {
    const [isOpen, setIsOpen] = useState(false)
    const [annotationText, setAnnotationText] = useState("")
    const [groupTag, setGroupTag] = useState(undefined)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const { mutate: postAnnotation, isLoading } = api.annotations.modifyAnnotations.usePostAnnotations()

    const proteinTags = _.uniq((_.isArray(rows) ? rows : []).flatMap(row => rowProteinTags(row)))

    const handleSave = () => {
        if (!_.isString(annotationText) || annotationText.trim().length === 0) return
        if (!_.isString(groupTag)) return
        postAnnotation({
            text: annotationText.trim(),
            description: "Created from volcano plot significant protein list.",
            group_tag: groupTag,
            protein_tags: proteinTags,
            submission_tags: [submission_tag]
        }, { onSuccess: () => { setIsOpen(false); setAnnotationText(""); setGroupTag(undefined); setSaveSuccess(true) } })
    }

    return <>
        <button className="basic-button--small"
            disabled={proteinTags.length === 0} onClick={() => { setSaveSuccess(false); setIsOpen(true) }}>
            Save as annotation
        </button>
        {saveSuccess ? <span className="font-size--smallest margin-left--little">Annotation created. It is now available under Quick Select {"\u2192"} Annotations.</span> : null}
        <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} title="Save protein list as annotation">
            <DialogBody>
                <p className="font-size--small">A new annotation will be created and assigned to the {proteinTags.length} proteins of this list. After saving, it is available under <strong>Quick Select {"\u2192"} Annotations</strong> and can be selected there to highlight all proteins of this list in the volcano plots.</p>
                <div className="margin-bottom--little">
                    <span className="font-size--small">Annotation name</span>
                    <InputGroup small={true} placeholder="Annotation name..." value={annotationText}
                        onChange={e => setAnnotationText(e.target.value)} />
                </div>
                <div className="margin-bottom--little">
                    <span className="font-size--small">Annotation group (required)</span>
                    <AnnotationGroupSelectionMenu
                        selected_tags={_.isString(groupTag) ? [groupTag] : []}
                        onSelection={(e, tags) => {
                            const tag = _.isArray(tags) ? tags[0] : tags
                            setGroupTag(_.isString(tag) ? tag : undefined)
                        }} />
                </div>
                <div className="margin-top--little">
                    <button className="basic-button--small" disabled={isLoading || annotationText.trim().length === 0 || !_.isString(groupTag)} onClick={handleSave}>
                        {isLoading ? "Saving..." : "Save"}
                    </button>
                </div>
            </DialogBody>
        </Dialog>
    </>
}


function DirectionToggle({ direction, onChange, counts }) {
    const options = [
        { id: "up", label: `Upregulated (${counts.up})` },
        { id: "down", label: `Downregulated (${counts.down})` },
        { id: "all", label: `All significant (${counts.all})` }]
    return <div className="flex center-items margin-bottom--little" style={{ gap: "0.3rem" }}>
        {options.map(option => <OptionButton key={option.id} isSelected={direction === option.id}
            onClick={() => onChange(option.id)}>{option.label}</OptionButton>)}
    </div>
}


const VOLCANO_LIST_ICON_SIZE = 25

function VolcanoListSVG({ size = VOLCANO_LIST_ICON_SIZE, color = "#000", significant = false }) {
    const rowSpacing = size / 4
    const firstRowY = size / 2 - rowSpacing
    const circleX = size * 0.22
    const circleR = size * 0.088
    const lineStart = size * 0.44
    const lineEnd = size * 0.86
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
            {[0, 1, 2].map(idx => {
                const rowY = firstRowY + idx * rowSpacing
                return <g key={idx}>
                    <circle cx={circleX} cy={rowY} r={circleR} fill={color} />
                    <line
                        x1={lineStart}
                        x2={lineEnd}
                        y1={rowY}
                        y2={rowY}
                        stroke={color}
                        strokeWidth={1.5} />
                </g>
            })}
        </svg>
    )
}

export function VolcanoListButton({ data, suffix, proteinTagMap, setRequiredProteinTags, submission_tag, favoriteProteinSelection, onToggleProteinLabel, onLabelProteinList, markedProteinTags, onMarkProteinList, onRemoveAllLabels }) {
    const [isOpen, setIsOpen] = useState(false)
    const [direction, setDirection] = useState("up")
    const [searchString, setSearchString] = useState("")
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
    const [sortState, setSortState] = useState(undefined)
    const [annotationFilterTags, setAnnotationFilterTags] = useState([])
    const { up, down, all } = useMemo(() => getSignificantRows(data, suffix), [data, suffix])

    const selectedRows = direction === "up" ? up : direction === "down" ? down : all

    const handleDirectionChange = (newDirection) => {
        setDirection(newDirection)
        setSearchString("")
        setVisibleCount(PAGE_SIZE)
        setSortState(undefined)
        setAnnotationFilterTags([])
    }

    const hasSignificant = up.length + down.length > 0

    return <>
        <button
            title={hasSignificant ? "Show significant proteins" : "No significant proteins"}
            className="flex margin--very-little icon__container center-items"
            style={{ outline: "none", border: "none", width: VOLCANO_LIST_ICON_SIZE, height: VOLCANO_LIST_ICON_SIZE, padding: "0px", cursor: hasSignificant ? "pointer" : "default" }}
            onMouseDown={e => e.stopPropagation()}
            onClick={() => hasSignificant && setIsOpen(prev => !prev)}>
            <VolcanoListSVG significant={hasSignificant} color={hasSignificant ? "#2e528b" : "#999999"} />
        </button>
        <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} title={`Significant proteins of volcano ${suffix}`} size="50%" style={{ height: "95vh" }}>
            <div className="padding--medium">
                <DirectionToggle direction={direction} onChange={handleDirectionChange} counts={{ up: up.length, down: down.length, all: all.length }} />
                <SignificantProteinTable
                    rows={selectedRows} suffixes={[suffix]} submission_tag={submission_tag}
                    proteinTagMap={proteinTagMap} setRequiredProteinTags={setRequiredProteinTags} direction={direction}
                    searchString={searchString} onSearchStringChange={setSearchString}
                    visibleCount={visibleCount} onVisibleCountChange={setVisibleCount}
                    sortState={sortState} onSortChange={setSortState}
                    annotationFilterTags={annotationFilterTags} onAnnotationFilterTagsChange={setAnnotationFilterTags}
                    selectedProteinTags={favoriteProteinSelection?.values ?? []} onToggleProteinLabel={onToggleProteinLabel}
                    onLabelProteinList={onLabelProteinList}
                    markedProteinTags={markedProteinTags} onMarkProteinList={onMarkProteinList} onRemoveAllLabels={onRemoveAllLabels} />
            </div>
        </Drawer>
    </>
}


const VENN_CIRCLE_RADIUS = 110
const VENN_CENTER_DISTANCE = 140
const VENN_MARGIN = 30
const VENN_WIDTH = VENN_CIRCLE_RADIUS * 2 + VENN_CENTER_DISTANCE + VENN_MARGIN * 2
const VENN_HEIGHT = VENN_CIRCLE_RADIUS * 2 + VENN_MARGIN * 2 + 20


function truncateLabel(label, maxLength = 28) {
    return label.length > maxLength ? `${label.slice(0, maxLength - 3)}...` : label
}

function VennDiagram({ leftLabel, rightLabel, leftOnlyCount, sharedCount, rightOnlyCount, onSelect }) {

    const leftCenterX = VENN_MARGIN + VENN_CIRCLE_RADIUS
    const rightCenterX = leftCenterX + VENN_CENTER_DISTANCE
    const circleStyle = { fillOpacity: 0.35, cursor: "pointer" }
    const numberStyle = { cursor: "pointer", fontWeight: "bold" }

    return <svg width={VENN_WIDTH} height={VENN_HEIGHT}>
        <text x={leftCenterX} y={16} fontSize="11" textAnchor="middle">{truncateLabel(leftLabel)}</text>
        <text x={rightCenterX} y={16} fontSize="11" textAnchor="middle">{truncateLabel(rightLabel)}</text>
        <circle cx={leftCenterX} cy={VENN_HEIGHT / 2 + 10} r={VENN_CIRCLE_RADIUS}
            style={{ ...circleStyle, fill: "#7fbf7b" }} onClick={() => onSelect("leftOnly")} />
        <circle cx={rightCenterX} cy={VENN_HEIGHT / 2 + 10} r={VENN_CIRCLE_RADIUS}
            style={{ ...circleStyle, fill: "#af8dc3" }} onClick={() => onSelect("rightOnly")} />
        <text x={leftCenterX - VENN_CENTER_DISTANCE / 4} y={VENN_HEIGHT / 2 + 15} fontSize="15"
            textAnchor="middle" style={numberStyle} onClick={() => onSelect("leftOnly")}>{leftOnlyCount}</text>
        <text x={(leftCenterX + rightCenterX) / 2} y={VENN_HEIGHT / 2 + 15} fontSize="15"
            textAnchor="middle" style={numberStyle} onClick={() => onSelect("shared")}>{sharedCount}</text>
        <text x={rightCenterX + VENN_CENTER_DISTANCE / 4} y={VENN_HEIGHT / 2 + 15} fontSize="15"
            textAnchor="middle" style={numberStyle} onClick={() => onSelect("rightOnly")}>{rightOnlyCount}</text>
    </svg>
}


function VennSection({ direction, sets, leftSuffix, rightSuffix, proteinTagMap, setRequiredProteinTags, submission_tag,
        selectionState, onSelectionStateChange, favoriteProteinSelection, onToggleProteinLabel, onLabelProteinList,
        markedProteinTags, onMarkProteinList, onRemoveAllLabels }) {

    const leftSet = sets[leftSuffix]
    const rightSet = sets[rightSuffix]
    if (!leftSet || !rightSet) return null

    const segment = selectionState.segment
    const updateState = (patch) => onSelectionStateChange({ ...selectionState, ...patch })

    const leftTags = directionTags(leftSet, direction)
    const rightTags = directionTags(rightSet, direction)
    const leftOnly = leftTags.filter(tag => !rightTags.includes(tag))
    const shared = leftTags.filter(tag => rightTags.includes(tag))
    const rightOnly = rightTags.filter(tag => !leftTags.includes(tag))

    const selectedTags = segment === "leftOnly" ? leftOnly
        : segment === "shared" ? shared
        : segment === "rightOnly" ? rightOnly : []

    const rows = selectedTags
        .map(tag => _.find(leftSet.rows.concat(rightSet.rows), row => row.tag === tag))
        .filter(_.isObject)
        .sort((a, b) => Math.abs(b[log2FCFieldName(leftSuffix)]) - Math.abs(a[log2FCFieldName(leftSuffix)]))

    const segmentTitle = segment === "leftOnly" ? `Only in ${leftSuffix} (${leftOnly.length})`
        : segment === "shared" ? `Shared between ${leftSuffix} and ${rightSuffix} (${shared.length})`
        : segment === "rightOnly" ? `Only in ${rightSuffix} (${rightOnly.length})` : undefined

    return <div className="margin-top--medium">
        <h4>{directionLabel(direction)} proteins</h4>
        <VennDiagram
            leftLabel={leftSuffix}
            rightLabel={rightSuffix}
            leftOnlyCount={leftOnly.length}
            sharedCount={shared.length}
            rightOnlyCount={rightOnly.length}
            onSelect={(newSegment) => updateState(newSegment === segment
                ? { segment: undefined, searchString: "", visibleCount: PAGE_SIZE, sortState: undefined, annotationFilterTags: [] }
                : { segment: newSegment, searchString: "", visibleCount: PAGE_SIZE, sortState: undefined, annotationFilterTags: [] })} />
        {segmentTitle ? <div className="margin-top--little">
            <span className="font-size--small">{segmentTitle}</span>
            <SignificantProteinTable
                rows={rows} suffixes={[leftSuffix, rightSuffix]} submission_tag={submission_tag}
                proteinTagMap={proteinTagMap} setRequiredProteinTags={setRequiredProteinTags} direction={direction}
                searchString={selectionState.searchString ?? ""} onSearchStringChange={searchString => updateState({ searchString })}
                visibleCount={selectionState.visibleCount ?? PAGE_SIZE} onVisibleCountChange={visibleCount => updateState({ visibleCount })}
                sortState={selectionState.sortState} onSortChange={sortState => updateState({ sortState })}
                annotationFilterTags={selectionState.annotationFilterTags ?? []} onAnnotationFilterTagsChange={annotationFilterTags => updateState({ annotationFilterTags })}
                selectedProteinTags={favoriteProteinSelection?.values ?? []} onToggleProteinLabel={onToggleProteinLabel}
                onLabelProteinList={onLabelProteinList}
                markedProteinTags={markedProteinTags} onMarkProteinList={onMarkProteinList} onRemoveAllLabels={onRemoveAllLabels} />
        </div> : null}
    </div>
}


const UPSET_MAX_ROWS = 20
const VOLCANO_COLORS = ["#7fbf7b", "#af8dc3", "#fdbf6b", "#80b1d3", "#fb8072", "#8dd3c7", "#bebada", "#ffffb3"]


function volcanoColor(suffixes, suffix) {
    const idx = suffixes.indexOf(suffix)
    return VOLCANO_COLORS[idx % VOLCANO_COLORS.length]
}


const UPSET_DOT_SPACING = 18
const UPSET_DOT_RADIUS = 5

function UpSetDots({ suffixes, memberSuffixes }) {
    const width = suffixes.length * UPSET_DOT_SPACING + 4
    const height = 16
    const centerY = height / 2
    const memberCenters = suffixes
        .map((suffix, idx) => ({ idx, suffix, cx: idx * UPSET_DOT_SPACING + UPSET_DOT_SPACING / 2 + 2 }))
        .filter(({ suffix }) => memberSuffixes.includes(suffix))
    return <svg width={width} height={height} style={{ flexShrink: 0 }}>
        {memberCenters.length > 1
            ? <polyline
                points={memberCenters.map(({ cx }) => `${cx},${centerY}`).join(" ")}
                stroke="#8a8a8a"
                strokeWidth={2}
                fill="none" />
            : null}
        {suffixes.map((suffix, idx) => {
            const isMember = memberSuffixes.includes(suffix)
            const cx = idx * UPSET_DOT_SPACING + UPSET_DOT_SPACING / 2 + 2
            return <g key={suffix}>
                {/* opaque background so the connector line is not visible through non-member circles */}
                <circle cx={cx} cy={centerY} r={UPSET_DOT_RADIUS + 1} fill="#ffffff" />
                <circle cx={cx} cy={centerY} r={UPSET_DOT_RADIUS}
                    fill={isMember ? volcanoColor(suffixes, suffix) : "#ffffff"}
                    stroke={volcanoColor(suffixes, suffix)} />
            </g>
        })}
    </svg>
}


function UpSetSection({ direction, sets, suffixes, data, proteinTagMap, setRequiredProteinTags, submission_tag,
        selectionState, onSelectionStateChange, favoriteProteinSelection, onToggleProteinLabel, onLabelProteinList,
        markedProteinTags, onMarkProteinList, onRemoveAllLabels }) {

    const signatureEntries = useMemo(() => getSignatureEntries(sets, suffixes, direction), [sets, suffixes, direction])

    const maxCount = _.max(signatureEntries.map(entry => entry.tags.length)) || 1
    const visibleEntries = signatureEntries.slice(0, UPSET_MAX_ROWS)

    const selectedSignatureKey = selectionState.signatureKey
    const updateState = (patch) => onSelectionStateChange({ ...selectionState, ...patch })

    const selectedEntry = selectedSignatureKey ? signatureEntries.find(entry => entry.key === selectedSignatureKey) : undefined

    const rowByTag = useMemo(() => (_.isArray(data) ? new Map(data.map(row => [row.tag, row])) : new Map()), [data])
    const selectedRows = useMemo(() => {
        if (!selectedEntry) return []
        return selectedEntry.tags.map(tag => rowByTag.get(tag)).filter(_.isObject)
            .sort((a, b) => Math.max(...suffixes.map(s => Math.abs(b[log2FCFieldName(s)] || 0)))
                - Math.max(...suffixes.map(s => Math.abs(a[log2FCFieldName(s)] || 0))))
    }, [selectedEntry, rowByTag, suffixes])

    return <div className="margin-top--medium">
        <h4>{directionLabel(direction)} proteins across {suffixes.length} volcanos</h4>
        <div className="flex flex--wrap center-items margin-bottom--little" style={{ gap: "0.5rem" }}>
            {suffixes.map(suffix => <span key={suffix} className="flex center-items font-size--smallest" style={{ gap: "0.2rem" }}>
                <span style={{ width: "0.6rem", height: "0.6rem", borderRadius: "50%", backgroundColor: volcanoColor(suffixes, suffix), display: "inline-block" }} />
                {truncateLabel(suffix, 25)}
            </span>)}
        </div>
        <div className="flex flex-column" style={{ gap: "0.2rem" }}>
            {visibleEntries.map(entry => {
                const isSelected = selectedSignatureKey === entry.key
                return <Tooltip key={entry.key} compact={true}
                    content={`${entry.tags.length} proteins significant in: ${entry.key}`}>
                    <div className="flex center-items"
                    style={{ gap: "0.3rem", cursor: "pointer", backgroundColor: isSelected ? "#efefef" : "white" }}
                    onClick={() => updateState(entry.key === selectedSignatureKey
                        ? { signatureKey: undefined, searchString: "", visibleCount: PAGE_SIZE, sortState: undefined, annotationFilterTags: [] }
                        : { signatureKey: entry.key, searchString: "", visibleCount: PAGE_SIZE, sortState: undefined, annotationFilterTags: [] })}>
                    <UpSetDots suffixes={suffixes} memberSuffixes={entry.suffixes} />
                    <div style={{ width: "200px", flexShrink: 0 }}>
                        <div style={{
                            width: `${(entry.tags.length / maxCount) * 100}%`,
                            minWidth: "2px", height: "0.9rem",
                            backgroundColor: directionBarColor(direction)
                        }} />
                    </div>
                    <span className="font-size--small font-weight--bold">{entry.tags.length}</span>
                    <span className="font-size--smallest">in {entry.suffixes.length} of {suffixes.length} volcanos</span>
                </div>
                </Tooltip>
            })}
        </div>
        {signatureEntries.length > visibleEntries.length
            ? <span className="font-size--smallest">Showing the top {visibleEntries.length} of {signatureEntries.length} combinations.</span>
            : null}
        {selectedEntry ? <div className="margin-top--little">
            <span className="font-size--small">{`${selectedEntry.tags.length} proteins significant in: ${selectedEntry.key}`}</span>
            <SignificantProteinTable
                rows={selectedRows} suffixes={suffixes} submission_tag={submission_tag}
                proteinTagMap={proteinTagMap} setRequiredProteinTags={setRequiredProteinTags} direction={direction}
                searchString={selectionState.searchString ?? ""} onSearchStringChange={searchString => updateState({ searchString })}
                visibleCount={selectionState.visibleCount ?? PAGE_SIZE} onVisibleCountChange={visibleCount => updateState({ visibleCount })}
                sortState={selectionState.sortState} onSortChange={sortState => updateState({ sortState })}
                annotationFilterTags={selectionState.annotationFilterTags ?? []} onAnnotationFilterTagsChange={annotationFilterTags => updateState({ annotationFilterTags })}
                selectedProteinTags={favoriteProteinSelection?.values ?? []} onToggleProteinLabel={onToggleProteinLabel}
                onLabelProteinList={onLabelProteinList}
                markedProteinTags={markedProteinTags} onMarkProteinList={onMarkProteinList} onRemoveAllLabels={onRemoveAllLabels} />
        </div> : null}
    </div>
}


export function VolcanoCompareButton({ data, suffixes, proteinTagMap, setRequiredProteinTags, submission_tag, favoriteProteinSelection, onToggleProteinLabel, onLabelProteinList, markedProteinTags, onMarkProteinList, onRemoveAllLabels }) {
    const [isOpen, setIsOpen] = useState(false)
    const [activeTab, setActiveTab] = useState("pairwise")
    const [direction, setDirection] = useState("up")
    const [leftSuffix, setLeftSuffix] = useState(_.isArray(suffixes) ? suffixes[0] : undefined)
    const [rightSuffix, setRightSuffix] = useState(_.isArray(suffixes) ? suffixes[1] : undefined)
    const [vennSelectionStates, setVennSelectionStates] = useState({})
    const [upsetSelectionStates, setUpsetSelectionStates] = useState({})
    const [selectedListKeys, setSelectedListKeys] = useState(["all"])

    useEffect(() => {
        if (!_.isArray(suffixes) || suffixes.length < 2) return
        const validLeft = suffixes.includes(leftSuffix) ? leftSuffix : suffixes[0]
        const validRight = suffixes.includes(rightSuffix) && rightSuffix !== validLeft
            ? rightSuffix
            : suffixes.find(s => s !== validLeft) ?? suffixes[1]
        setLeftSuffix(validLeft)
        setRightSuffix(validRight)
    }, [_.join(suffixes, ";")])

    const sets = useMemo(() => _.fromPairs(suffixes.map(suffix => {
        const { up, down } = getSignificantRows(data, suffix)
        return [suffix, { up: up.map(row => row.tag), down: down.map(row => row.tag), rows: up.concat(down) }]
    })), [data, suffixes])

    const counts = useMemo(() => {
        const upTags = new Set()
        const downTags = new Set()
        suffixes.forEach(suffix => {
            ;(sets[suffix]?.up || []).forEach(tag => upTags.add(tag))
            ;(sets[suffix]?.down || []).forEach(tag => downTags.add(tag))
        })
        return { up: upTags.size, down: downTags.size, all: new Set([...upTags, ...downTags]).size }
    }, [sets, suffixes])

    const listOptions = useMemo(() => {
        const options = [{ key: "all", label: `All significant (${directionLabel(direction).toLowerCase()})`, tags: _.uniq(suffixes.flatMap(suffix => directionTags(sets[suffix], direction))) }]
        suffixes.forEach(suffix => options.push({ key: `suffix::${suffix}`, label: `${directionLabel(direction)} in ${suffix}`, tags: directionTags(sets[suffix], direction) }))
        const leftSet = sets[leftSuffix]
        const rightSet = sets[rightSuffix]
        if (leftSet && rightSet) {
            const leftTags = directionTags(leftSet, direction)
            const rightTags = directionTags(rightSet, direction)
            options.push({ key: "venn::leftOnly", label: `Only in ${leftSuffix}`, tags: leftTags.filter(tag => !rightTags.includes(tag)) })
            options.push({ key: "venn::shared", label: `Shared ${leftSuffix} & ${rightSuffix}`, tags: leftTags.filter(tag => rightTags.includes(tag)) })
            options.push({ key: "venn::rightOnly", label: `Only in ${rightSuffix}`, tags: rightTags.filter(tag => !leftTags.includes(tag)) })
        }
        getSignatureEntries(sets, suffixes, direction).slice(0, UPSET_MAX_ROWS)
            .forEach(entry => options.push({ key: `upset::${entry.key}`, label: `Significant in: ${entry.key}`, tags: entry.tags }))
        return options
    }, [sets, suffixes, direction, leftSuffix, rightSuffix])

    const vennSelectionState = vennSelectionStates[direction] ?? {}
    const upsetSelectionState = upsetSelectionStates[direction] ?? {}

    if (!_.isArray(suffixes) || suffixes.length < 2) return null

    return <>
        <button className="basic-button--small" onClick={() => setIsOpen(prev => !prev)}>Compare significant proteins</button>
        <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} title="Compare significant proteins between volcano plots" size="75%" style={{ height: "95vh" }}>
            <div className="padding--medium" style={{ height: "100%", overflowY: "auto" }}>
                <DirectionToggle direction={direction} onChange={setDirection} counts={counts} />
                <Tabs id="volcano-compare-tabs" selectedTabId={activeTab} onChange={setActiveTab} renderActiveTabPanelOnly={true}>
                    <Tab id="pairwise" title="Pairwise (Venn)" panel={
                        <div>
                            <div className="flex center-items" style={{ gap: "0.5rem", flexWrap: "wrap" }}>
                                <span className="font-weight--bold">Left volcano:</span>
                                {suffixes.map(suffix => <OptionButton key={suffix} isSelected={suffix === leftSuffix}
                                    onClick={() => suffix !== rightSuffix && setLeftSuffix(suffix)}>{suffix}</OptionButton>)}
                                <span className="font-weight--bold margin-left--little">Right volcano:</span>
                                {suffixes.map(suffix => <OptionButton key={suffix} isSelected={suffix === rightSuffix}
                                    onClick={() => suffix !== leftSuffix && setRightSuffix(suffix)}>{suffix}</OptionButton>)}
                            </div>
                            <VennSection direction={direction} sets={sets} leftSuffix={leftSuffix} rightSuffix={rightSuffix} submission_tag={submission_tag}
                                selectionState={vennSelectionState}
                                onSelectionStateChange={next => setVennSelectionStates(prev => ({ ...prev, [direction]: next }))}
                                favoriteProteinSelection={favoriteProteinSelection} onToggleProteinLabel={onToggleProteinLabel} onLabelProteinList={onLabelProteinList}
                                markedProteinTags={markedProteinTags} onMarkProteinList={onMarkProteinList} onRemoveAllLabels={onRemoveAllLabels}
                                proteinTagMap={proteinTagMap} setRequiredProteinTags={setRequiredProteinTags} />
                        </div>} />
                    <Tab id="all" title={`Compare all (${suffixes.length})`} panel={
                        <div>
                            <UpSetSection direction={direction} sets={sets} suffixes={suffixes} data={data} submission_tag={submission_tag}
                                selectionState={upsetSelectionState}
                                onSelectionStateChange={next => setUpsetSelectionStates(prev => ({ ...prev, [direction]: next }))}
                                favoriteProteinSelection={favoriteProteinSelection} onToggleProteinLabel={onToggleProteinLabel} onLabelProteinList={onLabelProteinList}
                                markedProteinTags={markedProteinTags} onMarkProteinList={onMarkProteinList} onRemoveAllLabels={onRemoveAllLabels}
                                proteinTagMap={proteinTagMap} setRequiredProteinTags={setRequiredProteinTags} />
                        </div>} />
                    <Tab id="annotations" title="Describe by annotation" panel={
                        <AnnotationDescriptionSection
                            data={data} suffixes={suffixes} direction={direction} submission_tag={submission_tag}
                            listOptions={listOptions} selectedListKeys={selectedListKeys}
                            onToggleListKey={key => setSelectedListKeys(prev => prev.includes(key)
                                ? (prev.length > 1 ? prev.filter(k => k !== key) : prev)
                                : [...prev, key])} />
                    } />
                </Tabs>
            </div>
        </Drawer>
    </>
}
