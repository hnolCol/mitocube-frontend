import _ from "lodash"
import { useEffect, useMemo, useRef, useState } from "react"
import { Button, ButtonGroup, Checkbox, Dialog, DialogBody, Drawer, HTMLTable, InputGroup, Tab, Tabs } from "@blueprintjs/core"
import { api } from "@/api"
import useDebounce from "@/hooks/useDebounce"
import { AnnotationGroupSelectionMenu } from "../mitomap/AnnotationGroupSelection"


const PAGE_SIZE = 50


function log2FCFieldName(suffix) {
    return `log2FC ${suffix}`
}

function significantFieldName(suffix) {
    return `Significant ${suffix}`
}

function pValueFieldName(suffix) {
    return `-log10 p-value ${suffix}`
}

function isSignificantValue(value) {
    if (_.isBoolean(value)) return value
    if (_.isNumber(value)) return value > 0
    if (_.isString(value)) return !["", "not significant", "none", "ns", "false"].includes(value.trim().toLowerCase())
    return false
}

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

function rowProteinTags(row) {
    return _.isString(row.tag) ? row.tag.split(";") : []
}

function directionLabel(direction) {
    return direction === "up" ? "Upregulated" : direction === "down" ? "Downregulated" : "Significant"
}

function directionBarColor(direction) {
    return direction === "up" ? "#7fbf7b" : direction === "down" ? "#af8dc3" : "#80b1d3"
}

function directionTags(set, direction) {
    if (!_.isObject(set)) return []
    if (direction === "all") return [...(set.up || []), ...(set.down || [])]
    return _.isArray(set[direction]) ? set[direction] : []
}

/**
 * @description Extracts the significant up- and downregulated proteins of a volcano from the merged volcano data.
 * @param {Object[]} data The merged volcano data rows.
 * @param {String} suffix The volcano suffix.
 * @returns {{up: Object[], down: Object[], all: Object[]}} Rows sorted by fold change. Each row has ```tag``` and the volcano field names.
 */
export function getSignificantRows(data, suffix) {
    if (!_.isArray(data) || !_.isString(suffix)) return { up: [], down: [], all: [] }
    const fcName = log2FCFieldName(suffix)
    const sigName = significantFieldName(suffix)
    const significant = data.filter(row => isSignificantValue(row[sigName]) && _.isNumber(row[fcName]))
    return {
        up: significant.filter(row => row[fcName] > 0).sort((a, b) => b[fcName] - a[fcName]),
        down: significant.filter(row => row[fcName] < 0).sort((a, b) => a[fcName] - b[fcName]),
        all: [...significant].sort((a, b) => Math.abs(b[fcName]) - Math.abs(a[fcName]))
    }
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
        searchString, onSearchStringChange, visibleCount, onVisibleCountChange, selectedProteinTags = [], onToggleProteinLabel, onLabelProteinList }) {
    const debouncedSearchString = useDebounce(searchString, 300)

    const searchIsInactive = !_.isString(searchString) || searchString.trim().length === 0

    // server-side gene name search, same search as the volcano plot protein search
    const { data: searchResults, isLoading: searchIsLoading } = api.features.proteinsQuery.useGetProteinFeatureByQuery(
        { search_string: debouncedSearchString, limit: 100000, submission_tags: [submission_tag] },
        { staleTime: 60000, enabled: !searchIsInactive && debouncedSearchString.trim().length > 1 && _.isString(submission_tag) })

    const filteredRows = useMemo(() => {
        if (!_.isArray(rows)) return []
        if (searchIsInactive) return rows
        const query = debouncedSearchString.trim().toLowerCase()
        const matchedTags = _.isArray(searchResults) ? new Set(searchResults) : undefined
        return rows.filter(row => {
            if (_.isString(row.tag) && row.tag.toLowerCase().includes(query)) return true
            const tags = rowProteinTags(row)
            if (matchedTags) return tags.some(tag => matchedTags.has(tag))
            return displayNamesForRow(proteinTagMap, row).toLowerCase().includes(query)
        })
    }, [rows, debouncedSearchString, searchResults, searchIsInactive, proteinTagMap])

    const visibleRows = useMemo(() => filteredRows.slice(0, visibleCount), [filteredRows, visibleCount])

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
            {_.isFunction(onLabelProteinList) ? <Button small={true} variant="minimal" icon="label" text="Label list"
                disabled={filteredRows.length === 0}
                onClick={() => onLabelProteinList(_.uniq(filteredRows.flatMap(row => rowProteinTags(row))))} /> : null}
            {_.isString(submission_tag) ? <SaveAsAnnotationButton rows={filteredRows} submission_tag={submission_tag} /> : null}
        </div>
        <div style={{ maxHeight: "40vh", overflowY: "auto", overflowX: "auto" }}>
            <HTMLTable compact={true} striped={true} style={{ width: "100%" }}>
                <thead style={{ position: "sticky", top: 0, backgroundColor: "#ffffff", zIndex: 1, boxShadow: "0 1px 0 rgba(0,0,0,0.2)" }}>
                    <tr>
                        {_.isFunction(onToggleProteinLabel) ? <th>Label</th> : null}
                        <th>Protein</th>
                        {suffixes.map(suffix => <th key={`log2fc-${suffix}`}>{`log2FC (${suffix})`}</th>)}
                        {suffixes.map(suffix => <th key={`p-${suffix}`}>{`-log10 p-value (${suffix})`}</th>)}
                        {suffixes.map(suffix => <th key={`fc-${suffix}`}>{`Fold change (${suffix})`}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {visibleRows.map(row => {
                        const tags = rowProteinTags(row)
                        const selectedTagCount = tags.filter(tag => selectedProteinTags.includes(tag)).length
                        return <tr key={row.tag}>
                            {_.isFunction(onToggleProteinLabel) ? <td><Checkbox
                                checked={selectedTagCount > 0}
                                indeterminate={selectedTagCount > 0 && selectedTagCount < tags.length}
                                onChange={() => handleToggleLabel(row)} /></td> : null}
                            <td>{displayNamesForRow(proteinTagMap, row)}</td>
                            {suffixes.map(suffix => <td key={`log2fc-${suffix}`}>{formatLog2FC(row[log2FCFieldName(suffix)])}</td>)}
                            {suffixes.map(suffix => <td key={`p-${suffix}`}>{formatPValue(row[pValueFieldName(suffix)])}</td>)}
                            {suffixes.map(suffix => <td key={`fc-${suffix}`}>{formatFoldChange(row[log2FCFieldName(suffix)])}</td>)}
                        </tr>
                    })}
                </tbody>
            </HTMLTable>
        </div>
        {visibleCount < filteredRows.length
            ? <Button small={true} variant="minimal" intent="primary" className="margin-top--little"
                onClick={() => onVisibleCountChange(visibleCount + PAGE_SIZE)}>
                Show more ({Math.min(visibleCount, filteredRows.length)} of {filteredRows.length})
            </Button>
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
        }, { onSuccess: () => { setIsOpen(false); setAnnotationText(""); setGroupTag(undefined) } })
    }

    return <>
        <Button small={true} variant="minimal" icon="star-empty" text="Save as annotation"
            disabled={proteinTags.length === 0} onClick={() => setIsOpen(true)} />
        <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} title="Save protein list as annotation">
            <DialogBody>
                <p className="font-size--small">A new annotation will be created and assigned to the {proteinTags.length} proteins of this list. It is then available in the Annotations quick select and can be used to highlight the proteins in the volcano plots.</p>
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
                    <Button text="Save" intent="primary" loading={isLoading}
                        disabled={annotationText.trim().length === 0 || !_.isString(groupTag)} onClick={handleSave} />
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
    return <ButtonGroup className="margin-bottom--little">
        {options.map(option => <Button key={option.id} small={true}
            intent={direction === option.id ? "primary" : "none"}
            variant={direction === option.id ? "default" : "minimal"}
            onClick={() => onChange(option.id)}>{option.label}</Button>)}
    </ButtonGroup>
}


export function VolcanoListButton({ data, suffix, proteinTagMap, setRequiredProteinTags, submission_tag, favoriteProteinSelection, onToggleProteinLabel, onLabelProteinList }) {
    const [isOpen, setIsOpen] = useState(false)
    const [direction, setDirection] = useState("up")
    const [searchString, setSearchString] = useState("")
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
    const { up, down, all } = useMemo(() => getSignificantRows(data, suffix), [data, suffix])

    const selectedRows = direction === "up" ? up : direction === "down" ? down : all

    const handleDirectionChange = (newDirection) => {
        setDirection(newDirection)
        setSearchString("")
        setVisibleCount(PAGE_SIZE)
    }

    return <>
        <Button variant="minimal" icon="list" intent={up.length + down.length > 0 ? "primary" : "none"}
            onClick={() => setIsOpen(prev => !prev)} />
        <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} title={`Significant proteins of volcano ${suffix}`} size="50%" style={{ height: "95vh" }}>
            <div className="padding--medium">
                <DirectionToggle direction={direction} onChange={handleDirectionChange} counts={{ up: up.length, down: down.length, all: all.length }} />
                <SignificantProteinTable
                    rows={selectedRows} suffixes={[suffix]} submission_tag={submission_tag}
                    proteinTagMap={proteinTagMap} setRequiredProteinTags={setRequiredProteinTags} direction={direction}
                    searchString={searchString} onSearchStringChange={setSearchString}
                    visibleCount={visibleCount} onVisibleCountChange={setVisibleCount}
                    selectedProteinTags={favoriteProteinSelection?.values ?? []} onToggleProteinLabel={onToggleProteinLabel}
                    onLabelProteinList={onLabelProteinList} />
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
        selectionState, onSelectionStateChange, favoriteProteinSelection, onToggleProteinLabel, onLabelProteinList }) {

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
                ? { segment: undefined, searchString: "", visibleCount: PAGE_SIZE }
                : { segment: newSegment, searchString: "", visibleCount: PAGE_SIZE })} />
        {segmentTitle ? <div className="margin-top--little">
            <span className="font-size--small">{segmentTitle}</span>
            <SignificantProteinTable
                rows={rows} suffixes={[leftSuffix, rightSuffix]} submission_tag={submission_tag}
                proteinTagMap={proteinTagMap} setRequiredProteinTags={setRequiredProteinTags} direction={direction}
                searchString={selectionState.searchString ?? ""} onSearchStringChange={searchString => updateState({ searchString })}
                visibleCount={selectionState.visibleCount ?? PAGE_SIZE} onVisibleCountChange={visibleCount => updateState({ visibleCount })}
                selectedProteinTags={favoriteProteinSelection?.values ?? []} onToggleProteinLabel={onToggleProteinLabel}
                onLabelProteinList={onLabelProteinList} />
        </div> : null}
    </div>
}


const UPSET_MAX_ROWS = 20
const VOLCANO_COLORS = ["#7fbf7b", "#af8dc3", "#fdbf6b", "#80b1d3", "#fb8072", "#8dd3c7", "#bebada", "#ffffb3"]


function volcanoColor(suffixes, suffix) {
    const idx = suffixes.indexOf(suffix)
    return VOLCANO_COLORS[idx % VOLCANO_COLORS.length]
}


function UpSetSection({ direction, sets, suffixes, data, proteinTagMap, setRequiredProteinTags, submission_tag,
        selectionState, onSelectionStateChange, favoriteProteinSelection, onToggleProteinLabel, onLabelProteinList }) {

    const signatureEntries = useMemo(() => {
        const membershipByTag = new Map()
        suffixes.forEach(suffix => {
            directionTags(sets[suffix], direction).forEach(tag => {
                if (!membershipByTag.has(tag)) membershipByTag.set(tag, new Set())
                membershipByTag.get(tag).add(suffix)
            })
        })
        const groups = new Map()
        membershipByTag.forEach((memberSuffixes, tag) => {
            const key = suffixes.filter(suffix => memberSuffixes.has(suffix)).join(" | ")
            if (!groups.has(key)) groups.set(key, { key, suffixes: [...memberSuffixes], tags: [] })
            groups.get(key).tags.push(tag)
        })
        return _.orderBy([...groups.values()], entry => entry.tags.length, "desc")
    }, [sets, suffixes, direction])

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
                return <div key={entry.key} className="flex center-items"
                    style={{ gap: "0.3rem", cursor: "pointer", backgroundColor: isSelected ? "#efefef" : "white" }}
                    onClick={() => updateState(entry.key === selectedSignatureKey
                        ? { signatureKey: undefined, searchString: "", visibleCount: PAGE_SIZE }
                        : { signatureKey: entry.key, searchString: "", visibleCount: PAGE_SIZE })}>
                    <div className="flex center-items" style={{ gap: "0.5rem" }}>
                        {suffixes.map(suffix => {
                            const isMember = entry.suffixes.includes(suffix)
                            return <span key={suffix} style={{
                                width: "0.65rem", height: "0.65rem", borderRadius: "50%", display: "inline-block",
                                backgroundColor: isMember ? volcanoColor(suffixes, suffix) : "transparent",
                                border: `1px solid ${volcanoColor(suffixes, suffix)}`
                            }} />
                        })}
                    </div>
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
                selectedProteinTags={favoriteProteinSelection?.values ?? []} onToggleProteinLabel={onToggleProteinLabel}
                onLabelProteinList={onLabelProteinList} />
        </div> : null}
    </div>
}


export function VolcanoCompareButton({ data, suffixes, proteinTagMap, setRequiredProteinTags, submission_tag, favoriteProteinSelection, onToggleProteinLabel, onLabelProteinList }) {
    const [isOpen, setIsOpen] = useState(false)
    const [activeTab, setActiveTab] = useState("pairwise")
    const [direction, setDirection] = useState("up")
    const [leftSuffix, setLeftSuffix] = useState(_.isArray(suffixes) ? suffixes[0] : undefined)
    const [rightSuffix, setRightSuffix] = useState(_.isArray(suffixes) ? suffixes[1] : undefined)
    const [vennSelectionStates, setVennSelectionStates] = useState({})
    const [upsetSelectionStates, setUpsetSelectionStates] = useState({})

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
            (sets[suffix]?.up || []).forEach(tag => upTags.add(tag))
            (sets[suffix]?.down || []).forEach(tag => downTags.add(tag))
        })
        return { up: upTags.size, down: downTags.size, all: new Set([...upTags, ...downTags]).size }
    }, [sets, suffixes])

    const vennSelectionState = vennSelectionStates[direction] ?? {}
    const upsetSelectionState = upsetSelectionStates[direction] ?? {}

    if (!_.isArray(suffixes) || suffixes.length < 2) return null

    return <>
        <Button icon="comparison" text="Compare significant proteins" variant="minimal" intent="primary" onClick={() => setIsOpen(prev => !prev)} />
        <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} title="Compare significant proteins between volcano plots" size="75%" style={{ height: "95vh" }}>
            <div className="padding--medium" style={{ height: "100%", overflowY: "auto" }}>
                <DirectionToggle direction={direction} onChange={setDirection} counts={counts} />
                <Tabs id="volcano-compare-tabs" selectedTabId={activeTab} onChange={setActiveTab} renderActiveTabPanelOnly={true}>
                    <Tab id="pairwise" title="Pairwise (Venn)" panel={
                        <div>
                            <div className="flex center-items" style={{ gap: "0.5rem", flexWrap: "wrap" }}>
                                <span className="font-weight--bold">Left volcano:</span>
                                {suffixes.map(suffix => <Button key={suffix} small={true}
                                    intent={suffix === leftSuffix ? "primary" : "none"}
                                    variant={suffix === leftSuffix ? "default" : "minimal"}
                                    onClick={() => suffix !== rightSuffix && setLeftSuffix(suffix)}>{suffix}</Button>)}
                                <span className="font-weight--bold margin-left--little">Right volcano:</span>
                                {suffixes.map(suffix => <Button key={suffix} small={true}
                                    intent={suffix === rightSuffix ? "primary" : "none"}
                                    variant={suffix === rightSuffix ? "default" : "minimal"}
                                    onClick={() => suffix !== leftSuffix && setRightSuffix(suffix)}>{suffix}</Button>)}
                            </div>
                            <VennSection direction={direction} sets={sets} leftSuffix={leftSuffix} rightSuffix={rightSuffix} submission_tag={submission_tag}
                                selectionState={vennSelectionState}
                                onSelectionStateChange={next => setVennSelectionStates(prev => ({ ...prev, [direction]: next }))}
                                favoriteProteinSelection={favoriteProteinSelection} onToggleProteinLabel={onToggleProteinLabel} onLabelProteinList={onLabelProteinList}
                                proteinTagMap={proteinTagMap} setRequiredProteinTags={setRequiredProteinTags} />
                        </div>} />
                    <Tab id="all" title={`Compare all (${suffixes.length})`} panel={
                        <div>
                            <UpSetSection direction={direction} sets={sets} suffixes={suffixes} data={data} submission_tag={submission_tag}
                                selectionState={upsetSelectionState}
                                onSelectionStateChange={next => setUpsetSelectionStates(prev => ({ ...prev, [direction]: next }))}
                                favoriteProteinSelection={favoriteProteinSelection} onToggleProteinLabel={onToggleProteinLabel} onLabelProteinList={onLabelProteinList}
                                proteinTagMap={proteinTagMap} setRequiredProteinTags={setRequiredProteinTags} />
                        </div>} />
                </Tabs>
            </div>
        </Drawer>
    </>
}
