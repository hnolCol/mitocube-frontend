import _ from "lodash"
import { useEffect, useMemo, useRef, useState } from "react"
import { Button, ButtonGroup, Drawer, HTMLTable } from "@blueprintjs/core"


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

/**
 * @description Extracts the significant up- and downregulated proteins of a volcano from the merged volcano data.
 * @param {Object[]} data The merged volcano data rows.
 * @param {String} suffix The volcano suffix.
 * @returns {{up: Object[], down: Object[]}} Rows sorted by fold change. Each row has ```tag``` and the volcano field names.
 */
export function getSignificantRows(data, suffix) {
    if (!_.isArray(data) || !_.isString(suffix)) return { up: [], down: [] }
    const fcName = log2FCFieldName(suffix)
    const sigName = significantFieldName(suffix)
    const significant = data.filter(row => isSignificantValue(row[sigName]) && _.isNumber(row[fcName]))
    return {
        up: significant.filter(row => row[fcName] > 0).sort((a, b) => b[fcName] - a[fcName]),
        down: significant.filter(row => row[fcName] < 0).sort((a, b) => a[fcName] - b[fcName])
    }
}


function usePrefetchProteinNames(rows, proteinTagMap, setRequiredProteinTags) {
    const requestedTags = useRef(new Set())
    useEffect(() => {
        if (!_.isFunction(setRequiredProteinTags) || !_.isArray(rows) || rows.length === 0) return
        const missing = _.uniq(rows.flatMap(row => (_.isString(row.tag) ? row.tag.split(";") : [])))
            .filter(tag => !requestedTags.current.has(tag) && !(proteinTagMap instanceof Map && proteinTagMap.has(tag)))
        if (missing.length === 0) return
        missing.forEach(tag => requestedTags.current.add(tag))
        setRequiredProteinTags(prev => _.isArray(prev) ? _.uniq([...prev, ...missing]) : missing)
    }, [rows, proteinTagMap])
}


export function SignificantProteinTable({ rows, suffixes, proteinTagMap, setRequiredProteinTags, direction }) {
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
    const visibleRows = useMemo(() => (_.isArray(rows) ? rows.slice(0, visibleCount) : []), [rows, visibleCount])
    usePrefetchProteinNames(visibleRows, proteinTagMap, setRequiredProteinTags)

    if (!_.isArray(rows) || rows.length === 0) {
        return <span>No {direction === "up" ? "upregulated" : "downregulated"} significant proteins found.</span>
    }

    return <div>
        <div style={{ maxHeight: "40vh", overflowY: "auto", overflowX: "hidden" }}>
            <HTMLTable compact={true} striped={true} style={{ width: "100%" }}>
                <thead>
                    <tr>
                        <th>Protein</th>
                        {suffixes.map(suffix => <th key={`log2fc-${suffix}`}>{`log2FC (${suffix})`}</th>)}
                        {suffixes.map(suffix => <th key={`p-${suffix}`}>{`-log10 p-value (${suffix})`}</th>)}
                        {suffixes.map(suffix => <th key={`fc-${suffix}`}>{`Fold change (${suffix})`}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {visibleRows.map(row => <tr key={row.tag}>
                        <td>{displayNamesForRow(proteinTagMap, row)}</td>
                        {suffixes.map(suffix => <td key={`log2fc-${suffix}`}>{formatLog2FC(row[log2FCFieldName(suffix)])}</td>)}
                        {suffixes.map(suffix => <td key={`p-${suffix}`}>{formatPValue(row[pValueFieldName(suffix)])}</td>)}
                        {suffixes.map(suffix => <td key={`fc-${suffix}`}>{formatFoldChange(row[log2FCFieldName(suffix)])}</td>)}
                    </tr>)}
                </tbody>
            </HTMLTable>
        </div>
        {visibleCount < rows.length
            ? <Button small={true} variant="minimal" intent="primary" className="margin-top--little"
                onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}>
                Show more ({visibleCount} of {rows.length})
            </Button>
            : <span className="font-size--smallest">{`Showing all ${rows.length} proteins.`}</span>}
    </div>
}


export function VolcanoListButton({ data, suffix, proteinTagMap, setRequiredProteinTags }) {
    const [isOpen, setIsOpen] = useState(false)
    const [direction, setDirection] = useState("up")
    const { up, down } = useMemo(() => getSignificantRows(data, suffix), [data, suffix])

    const selectedRows = direction === "up" ? up : down

    return <>
        <Button variant="minimal" icon="list" intent={up.length + down.length > 0 ? "primary" : "none"}
            onClick={() => setIsOpen(true)} />
        <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} title={`Significant proteins of volcano ${suffix}`} size="50%">
            <div className="padding--medium">
                <ButtonGroup className="margin-bottom--little">
                    <Button small={true} intent={direction === "up" ? "primary" : "none"}
                        variant={direction === "up" ? "default" : "minimal"}
                        onClick={() => setDirection("up")}>{`Upregulated (${up.length})`}</Button>
                    <Button small={true} intent={direction === "down" ? "primary" : "none"}
                        variant={direction === "down" ? "default" : "minimal"}
                        onClick={() => setDirection("down")}>{`Downregulated (${down.length})`}</Button>
                </ButtonGroup>
                <SignificantProteinTable key={direction} rows={selectedRows} suffixes={[suffix]}
                    proteinTagMap={proteinTagMap} setRequiredProteinTags={setRequiredProteinTags} direction={direction} />
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


function VennSection({ direction, sets, leftSuffix, rightSuffix, proteinTagMap, setRequiredProteinTags }) {
    const [selectedSegment, setSelectedSegment] = useState(undefined)

    const leftSet = sets[leftSuffix]
    const rightSet = sets[rightSuffix]
    if (!leftSet || !rightSet) return null

    const leftTags = leftSet[direction]
    const rightTags = rightSet[direction]
    const leftOnly = leftTags.filter(tag => !rightTags.includes(tag))
    const shared = leftTags.filter(tag => rightTags.includes(tag))
    const rightOnly = rightTags.filter(tag => !leftTags.includes(tag))

    const selectedTags = selectedSegment === "leftOnly" ? leftOnly
        : selectedSegment === "shared" ? shared
        : selectedSegment === "rightOnly" ? rightOnly : []

    const rows = selectedTags
        .map(tag => _.find(leftSet.rows.concat(rightSet.rows), row => row.tag === tag))
        .filter(_.isObject)
        .sort((a, b) => Math.abs(b[log2FCFieldName(leftSuffix)]) - Math.abs(a[log2FCFieldName(leftSuffix)]))

    const segmentTitle = selectedSegment === "leftOnly" ? `Only in ${leftSuffix} (${leftOnly.length})`
        : selectedSegment === "shared" ? `Shared between ${leftSuffix} and ${rightSuffix} (${shared.length})`
        : selectedSegment === "rightOnly" ? `Only in ${rightSuffix} (${rightOnly.length})` : undefined

    return <div className="margin-top--medium">
        <h4>{direction === "up" ? "Upregulated" : "Downregulated"} proteins</h4>
        <VennDiagram
            leftLabel={leftSuffix}
            rightLabel={rightSuffix}
            leftOnlyCount={leftOnly.length}
            sharedCount={shared.length}
            rightOnlyCount={rightOnly.length}
            onSelect={(segment) => setSelectedSegment(prev => prev === segment ? undefined : segment)} />
        {segmentTitle ? <div className="margin-top--little">
            <span className="font-size--small">{segmentTitle}</span>
            <SignificantProteinTable key={`${selectedSegment}-${direction}`} rows={rows} suffixes={[leftSuffix, rightSuffix]}
                proteinTagMap={proteinTagMap} setRequiredProteinTags={setRequiredProteinTags} direction={direction} />
        </div> : null}
    </div>
}


export function VolcanoCompareButton({ data, suffixes, proteinTagMap, setRequiredProteinTags }) {
    const [isOpen, setIsOpen] = useState(false)
    const [leftSuffix, setLeftSuffix] = useState(_.isArray(suffixes) ? suffixes[0] : undefined)
    const [rightSuffix, setRightSuffix] = useState(_.isArray(suffixes) ? suffixes[1] : undefined)

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

    if (!_.isArray(suffixes) || suffixes.length < 2) return null

    return <>
        <Button icon="comparison" text="Compare significant proteins" variant="minimal" intent="primary" onClick={() => setIsOpen(true)} />
        <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} title="Compare significant proteins between volcano plots" size="60%">
            <div className="padding--medium" style={{ overflowY: "auto", maxHeight: "80vh" }}>
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
                <VennSection direction="up" sets={sets} leftSuffix={leftSuffix} rightSuffix={rightSuffix}
                    proteinTagMap={proteinTagMap} setRequiredProteinTags={setRequiredProteinTags} />
                <VennSection direction="down" sets={sets} leftSuffix={leftSuffix} rightSuffix={rightSuffix}
                    proteinTagMap={proteinTagMap} setRequiredProteinTags={setRequiredProteinTags} />
            </div>
        </Drawer>
    </>
}
