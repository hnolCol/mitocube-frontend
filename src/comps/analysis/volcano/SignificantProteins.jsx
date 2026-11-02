import _ from "lodash"
import { useEffect, useMemo, useRef, useState } from "react"
import { Button, Drawer, HTMLTable, Tag } from "@blueprintjs/core"


function isSignificantValue(value) {
    if (_.isBoolean(value)) return value
    if (_.isNumber(value)) return value > 0
    if (_.isString(value)) return !["", "not significant", "none", "ns", "false"].includes(value.trim().toLowerCase())
    return false
}

function log2FCFieldName(suffix) {
    return `log2FC ${suffix}`
}

function significantFieldName(suffix) {
    return `Significant ${suffix}`
}

function formatFoldChange(log2fc) {
    if (!_.isNumber(log2fc)) return "-"
    const fc = Math.pow(2, log2fc)
    return fc >= 100 ? fc.toFixed(0) : fc >= 10 ? fc.toFixed(1) : fc.toFixed(2)
}

function formatLog2FC(log2fc) {
    return _.isNumber(log2fc) ? log2fc.toFixed(2) : "-"
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
 * @returns {{up: Object[], down: Object[]}} Rows sorted by absolute fold change. Each row has ```tag```, ```log2FC``` and ```names```.
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
        if (!_.isFunction(setRequiredProteinTags) || !_.isArray(rows)) return
        const missing = _.uniq(rows.flatMap(row => (_.isString(row.tag) ? row.tag.split(";") : [])))
            .filter(tag => !requestedTags.current.has(tag) && !(proteinTagMap instanceof Map && proteinTagMap.has(tag)))
        if (missing.length === 0) return
        missing.forEach(tag => requestedTags.current.add(tag))
        setRequiredProteinTags(prev => _.isArray(prev) ? _.uniq([...prev, ...missing]) : missing)
    }, [rows, proteinTagMap])
}


export function SignificantProteinTable({ rows, suffixes, proteinTagMap, direction }) {
    usePrefetchProteinNames(rows, proteinTagMap)
    if (!_.isArray(rows) || rows.length === 0) {
        return <span>No {direction === "up" ? "upregulated" : "downregulated"} significant proteins found.</span>
    }
    return <HTMLTable compact={true} striped={true} style={{ width: "100%" }}>
        <thead>
            <tr>
                <th>Protein</th>
                {suffixes.map(suffix => <th key={suffix}>{`log2FC ${suffix}`}</th>)}
                {suffixes.map(suffix => <th key={`fc-${suffix}`}>{`FC ${suffix}`}</th>)}
            </tr>
        </thead>
        <tbody>
            {rows.map(row => <tr key={row.tag}>
                <td>{displayNamesForRow(proteinTagMap, row)}</td>
                {suffixes.map(suffix => <td key={suffix}>{formatLog2FC(row[log2FCFieldName(suffix)])}</td>)}
                {suffixes.map(suffix => <td key={`fc-${suffix}`}>{formatFoldChange(row[log2FCFieldName(suffix)])}</td>)}
            </tr>)}
        </tbody>
    </HTMLTable>
}


export function VolcanoListButton({ data, suffix, proteinTagMap, setRequiredProteinTags }) {
    const [isOpen, setIsOpen] = useState(false)
    const { up, down } = useMemo(() => getSignificantRows(data, suffix), [data, suffix])
    usePrefetchProteinNames(isOpen ? up.concat(down) : [], proteinTagMap, setRequiredProteinTags)

    return <>
        <Button variant="minimal" icon="list" intent={up.length + down.length > 0 ? "primary" : "none"}
            onClick={() => setIsOpen(true)} />
        <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} title={`Significant proteins of volcano ${suffix}`} size="50%">
            <div className="padding--medium">
                <h4>Upregulated ({up.length})</h4>
                <SignificantProteinTable rows={up} suffixes={[suffix]} proteinTagMap={proteinTagMap} direction="up" />
                <h4 className="margin-top--medium">Downregulated ({down.length})</h4>
                <SignificantProteinTable rows={down} suffixes={[suffix]} proteinTagMap={proteinTagMap} direction="down" />
            </div>
        </Drawer>
    </>
}


const VENN_CIRCLE_RADIUS = 70
const VENN_CIRCLE_OFFSET = 55
const VENN_HEIGHT = 170

function VennDiagram({ leftLabel, rightLabel, leftOnlyCount, sharedCount, rightOnlyCount, onSelect }) {

    const circleStyle = { fillOpacity: 0.35, cursor: "pointer" }

    return <svg width={VENN_CIRCLE_OFFSET * 2 + VENN_CIRCLE_RADIUS * 2 + 40} height={VENN_HEIGHT}>
        <circle cx={VENN_CIRCLE_OFFSET + VENN_CIRCLE_RADIUS} cy={VENN_HEIGHT / 2} r={VENN_CIRCLE_RADIUS}
            style={{ ...circleStyle, fill: "#7fbf7b" }} onClick={() => onSelect("leftOnly")} />
        <circle cx={VENN_CIRCLE_OFFSET * 3 + VENN_CIRCLE_RADIUS} cy={VENN_HEIGHT / 2} r={VENN_CIRCLE_RADIUS}
            style={{ ...circleStyle, fill: "#af8dc3" }} onClick={() => onSelect("rightOnly")} />
        <text x={VENN_CIRCLE_OFFSET + 10} y={20} fontSize="11">{leftLabel}</text>
        <text x={VENN_CIRCLE_OFFSET * 3 + VENN_CIRCLE_RADIUS * 2 - 10} y={20} fontSize="11" textAnchor="end">{rightLabel}</text>
        <text x={VENN_CIRCLE_OFFSET - 12} y={VENN_HEIGHT / 2 + 5} fontSize="14" fontWeight="bold" style={{ cursor: "pointer" }}
            onClick={() => onSelect("leftOnly")}>{leftOnlyCount}</text>
        <text x={VENN_CIRCLE_OFFSET * 2 + VENN_CIRCLE_RADIUS} y={VENN_HEIGHT / 2 + 5} fontSize="14" fontWeight="bold" textAnchor="middle"
            style={{ cursor: "pointer" }} onClick={() => onSelect("shared")}>{sharedCount}</text>
        <text x={VENN_CIRCLE_OFFSET * 3 + VENN_CIRCLE_RADIUS * 2 + 12} y={VENN_HEIGHT / 2 + 5} fontSize="14" fontWeight="bold" textAnchor="end"
            style={{ cursor: "pointer" }} onClick={() => onSelect("rightOnly")}>{rightOnlyCount}</text>
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

    const selectedRows = selectedSegment === "leftOnly" ? leftOnly
        : selectedSegment === "shared" ? shared
        : selectedSegment === "rightOnly" ? rightOnly : []

    const rows = selectedRows
        .map(tag => _.find(leftSet.rows.concat(rightSet.rows), row => row.tag === tag))
        .filter(_.isObject)
        .sort((a, b) => Math.abs(b[log2FCFieldName(leftSuffix)]) - Math.abs(a[log2FCFieldName(leftSuffix)]))

    return <div className="margin-top--medium">
        <h4>{direction === "up" ? "Upregulated" : "Downregulated"} proteins</h4>
        <VennDiagram
            leftLabel={leftSuffix}
            rightLabel={rightSuffix}
            leftOnlyCount={leftOnly.length}
            sharedCount={shared.length}
            rightOnlyCount={rightOnly.length}
            onSelect={(segment) => setSelectedSegment(prev => prev === segment ? undefined : segment)} />
        {selectedSegment ? <div className="margin-top--little">
            <span className="font-size--small">
                {selectedSegment === "leftOnly" ? `Only in ${leftSuffix} (${leftOnly.length})`
                : selectedSegment === "shared" ? `Shared between ${leftSuffix} and ${rightSuffix} (${shared.length})`
                : `Only in ${rightSuffix} (${rightOnly.length})`}
            </span>
            <SignificantProteinTable rows={rows} suffixes={[leftSuffix, rightSuffix]} proteinTagMap={proteinTagMap} direction={direction} />
        </div> : null}
    </div>
}


export function VolcanoCompareButton({ data, suffixes, proteinTagMap, setRequiredProteinTags }) {
    const [isOpen, setIsOpen] = useState(false)
    const [leftSuffix, setLeftSuffix] = useState(suffixes[0])
    const [rightSuffix, setRightSuffix] = useState(suffixes[1])

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

    usePrefetchProteinNames(isOpen ? _.flatMap(sets, set => set.rows) : [], proteinTagMap, setRequiredProteinTags)

    if (!_.isArray(suffixes) || suffixes.length < 2) return null

    return <>
        <Button icon="comparison" text="Compare significant proteins" variant="minimal" intent="primary" onClick={() => setIsOpen(true)} />
        <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} title="Compare significant proteins between volcano plots" size="60%">
            <div className="padding--medium">
                <div className="flex center-items" style={{ gap: "0.5rem" }}>
                    <Tag intent="primary">Left volcano</Tag>
                    {suffixes.map(suffix => <Button key={suffix} small={true}
                        intent={suffix === leftSuffix ? "primary" : "none"}
                        variant={suffix === leftSuffix ? "default" : "minimal"}
                        onClick={() => suffix !== rightSuffix && setLeftSuffix(suffix)}>{suffix}</Button>)}
                    <Tag intent="primary">Right volcano</Tag>
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
