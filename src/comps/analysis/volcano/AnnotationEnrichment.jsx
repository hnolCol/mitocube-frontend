
import _ from "lodash"
import { Fragment, useEffect, useMemo, useState } from "react"
import { useQueries } from "@tanstack/react-query"
import { Checkbox, HTMLTable, InputGroup, NonIdealState, Spinner, Tab, Tabs } from "@blueprintjs/core"
import { api } from "@/api"
import { apiClient } from "@/api/client"
import { Annotation } from "@/comps/core/base/annotations/Annotation"
import { OptionButton } from "@/comps/core/base/buttons/OptionButton"
import { Subsetboxplot } from "@/comps/core/charts/boxplot/Subsetboxplot"
import APIError from "@/comps/core/error/APIerror"
import useDebounce from "@/hooks/useDebounce"
import { log2FCFieldName, rowProteinTags } from "./compareUtils"

const FDR_THRESHOLD = 0.05
const MEMBER_TAG_FETCH_LIMIT = 100

/**
 * Fetches the member protein tags of the given annotations (without submission
 * scope, so it also works for cross-submission comparisons).
 */
function useAnnotationMemberTags(annotation_tags = []) {
    const uniqueTags = useMemo(
        () => _.uniq((annotation_tags ?? []).filter(_.isString)).slice(0, MEMBER_TAG_FETCH_LIMIT),
        [_.join(annotation_tags ?? [], ";")])
    const queries = useQueries({
        queries: uniqueTags.map(tag => ({
            queryKey: ["getAnnotationProteinsNoScope", tag],
            queryFn: () => apiClient.get(`/annotations/${tag}/proteins`).then(res => res.data),
            enabled: _.isString(tag) && tag.length > 0,
            staleTime: Infinity
        }))
    })
    return useMemo(() => {
        const map = new Map()
        uniqueTags.forEach((tag, idx) => {
            const data = queries[idx]?.data
            map.set(tag, _.isArray(data) ? new Set(data) : new Set())
        })
        return map
    }, [queries, uniqueTags])
}

function usePlotProteinTags(data) {
    return useMemo(() => {
        const set = new Set()
        ;(_.isArray(data) ? data : []).forEach(row => rowProteinTags(row).forEach(tag => set.add(tag)))
        return set
    }, [data])
}

/**
 * Mark/Unmark button: highlights the annotation's member proteins that are present
 * in the volcano plot data (markedProteinList is rendered highlighted in the plots).
 */
function MarkAnnotationButton({ annotationTag, memberTagsByAnnotation, plotTags, markedProteinTags, onMarkProteinList }) {
    const members = memberTagsByAnnotation.get(annotationTag)
    const overlapTags = useMemo(
        () => (members instanceof Set ? [...members].filter(tag => plotTags.has(tag)) : []),
        [members, plotTags])
    const isMarked = overlapTags.length > 0 && _.difference(overlapTags, markedProteinTags ?? []).length === 0
    if (!_.isFunction(onMarkProteinList)) return null
    return (
        <button
            className="basic-button--small"
            style={{ flexShrink: 0, fontWeight: isMarked ? "bold" : "normal" }}
            title={overlapTags.length > 0 ? `Highlight the ${overlapTags.length} member proteins in the volcano plot` : "No member proteins in the plotted data"}
            onClick={(e) => { e.stopPropagation(); onMarkProteinList(isMarked ? [] : overlapTags) }}>
            {isMarked ? "Unmark" : "Mark"}
        </button>
    )
}

function formatPValue(p) {
    if (!_.isNumber(p)) return "-"
    if (p < 1e-300) return p.toExponential(1)
    if (p < 0.0001) return p.toExponential(2)
    return p.toFixed(4)
}

function formatNumber(x, digits = 2) {
    if (!_.isNumber(x)) return "-"
    if (Math.abs(x) >= 1000) return x.toExponential(1)
    return x.toFixed(digits)
}

function formatOddsRatio(or) {
    if (!_.isNumber(or)) return "-"
    if (or >= 1000) return or.toExponential(1)
    return or >= 100 ? or.toFixed(0) : or.toFixed(2)
}

function AnnotationEnrichmentTable({ data, listOptions = [], selectedListKeys = [], submission_tags = [], proteome_tag = undefined, markedProteinTags = [], onMarkProteinList }) {
    const [searchInput, setSearchInput] = useState("")
    const searchString = useDebounce(searchInput, 300)
    const [onlySignificant, setOnlySignificant] = useState(false)
    const plotTags = usePlotProteinTags(data)

    const selectedTags = useMemo(() => {
        // list option tags are protein group tags (possibly "P1;P2") - expand to
        // individual protein tags, which is what the backend universe uses
        const set = new Set()
        ;(listOptions ?? []).filter(option => selectedListKeys.includes(option.key))
            .forEach(option => (option.tags ?? []).forEach(tag => rowProteinTags({ tag }).forEach(t => set.add(t))))
        return set
    }, [listOptions, selectedListKeys])

    const targetProteins = useMemo(() => [...selectedTags], [selectedTags])
    const universeIsSubmissions = _.isArray(submission_tags) && submission_tags.length > 0

    const { data: enrichment, isLoading, isFetching, isError, error } = api.annotations.queryAnnotations.useGetAnnotationEnrichment(
        {
            target_proteins: targetProteins.join(";"),
            submission_tags: universeIsSubmissions ? submission_tags.join(";") : undefined,
            proteome_tag: !universeIsSubmissions && _.isString(proteome_tag) ? proteome_tag : undefined,
            search_string: _.isString(searchString) && searchString.length > 0 ? searchString : undefined,
            min_overlap: 2,
            limit: 500
        },
        {
            enabled: targetProteins.length > 0 && (universeIsSubmissions || _.isString(proteome_tag)),
            staleTime: 60000
        }
    )

    const rows = useMemo(() => {
        if (!_.isArray(enrichment)) return []
        return onlySignificant ? enrichment.filter(r => _.isNumber(r.fdr) && r.fdr <= FDR_THRESHOLD) : enrichment
    }, [enrichment, onlySignificant])

    const memberTagsByAnnotation = useAnnotationMemberTags(useMemo(() => rows.map(r => r.annotation_tag), [rows]))

    if (targetProteins.length === 0) {
        return <NonIdealState icon="list-detail-view" title="No protein list selected"
            description="Select at least one protein list (e.g. 'All significant') above to compute the annotation enrichment for the defined list." />
    }

    return (
        <div>
            <div className="flex center-items" style={{ gap: "0.5rem", flexWrap: "wrap" }}>
                <InputGroup small={true} leftIcon="search" placeholder="Filter annotations..." value={searchInput} onChange={e => setSearchInput(e.target.value)} />
                <Checkbox label={`Only significant (FDR ≤ ${FDR_THRESHOLD})`} checked={onlySignificant} onChange={() => setOnlySignificant(prev => !prev)} />
            </div>
            <div className="font-size--small margin-top--little margin-bottom--little">
                Enrichment of the defined list of <strong>{targetProteins.length}</strong> protein(s) against the background universe of
                {universeIsSubmissions
                    ? <> the proteins quantified in <strong>{submission_tags.length}</strong> submission(s) ({submission_tags.join(", ")})</>
                    : <> the proteome <strong>{proteome_tag}</strong></>}.
                One-sided Fisher exact test per annotation, Benjamini-Hochberg FDR corrected.
                {isFetching ? <Spinner size={14} className="margin-left--little" /> : null}
            </div>
            {isError ? <div className="margin-bottom--little"><APIError error={error} /></div> : null}
            {isLoading ? <Spinner /> : null}
            {_.isArray(enrichment) && enrichment.length === 0 && !isLoading ?
                <NonIdealState icon="search" title="No annotations tested" description="No annotation overlaps the defined list with at least 2 proteins in the universe." /> : null}
            {rows.length > 0 ?
                <HTMLTable compact={true} striped={true} className="div--expand" style={{ maxHeight: "60vh", overflowY: "auto", display: "block" }}>
                    <thead>
                        <tr>
                            <th>Annotation</th>
                            <th>In list</th>
                            <th>List size</th>
                            <th>In universe</th>
                            <th>Universe size</th>
                            <th>Odds ratio</th>
                            <th>p-value</th>
                            <th>FDR</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(row => {
                            const significant = _.isNumber(row.fdr) && row.fdr <= FDR_THRESHOLD
                            return (
                                <tr key={row.annotation_tag} style={significant ? { backgroundColor: "#edf8b1" } : undefined}>
                                    <td><Annotation tag={row.annotation_tag} indicateNumberProteins={false} /> <span className="font-size--smallest" style={{ color: "grey" }}>({row.annotation_tag})</span></td>
                                    <td>{row.target_with_annotation}</td>
                                    <td>{row.target_total}</td>
                                    <td>{row.universe_with_annotation}</td>
                                    <td>{row.universe_total}</td>
                                    <td>{formatOddsRatio(row.odds_ratio)}</td>
                                    <td>{formatPValue(row.p_value)}</td>
                                    <td><strong>{formatPValue(row.fdr)}</strong></td>
                                    <td><MarkAnnotationButton annotationTag={row.annotation_tag} memberTagsByAnnotation={memberTagsByAnnotation} plotTags={plotTags} markedProteinTags={markedProteinTags} onMarkProteinList={onMarkProteinList} /></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </HTMLTable> : null}
        </div>
    )
}


function AnnotationShiftSection({ data, suffixes = [], submission_tags = [], proteome_tag = undefined, markedProteinTags = [], onMarkProteinList }) {
    const [plotSuffix, setPlotSuffix] = useState(_.isArray(suffixes) ? suffixes[0] : undefined)
    const [directionFilter, setDirectionFilter] = useState("all")
    const [onlySignificant, setOnlySignificant] = useState(false)
    const [searchInput, setSearchInput] = useState("")
    const searchString = useDebounce(searchInput, 300)
    const [expandedTag, setExpandedTag] = useState(undefined)
    const plotTags = usePlotProteinTags(data)

    useEffect(() => {
        if (_.isArray(suffixes) && !suffixes.includes(plotSuffix)) setPlotSuffix(suffixes[0])
    }, [_.join(suffixes, ";")])
    const activeSuffix = _.isArray(suffixes) && suffixes.includes(plotSuffix) ? plotSuffix : suffixes?.[0]

    const proteinValues = useMemo(() => {
        const values = {}
        if (!_.isArray(data) || !_.isString(activeSuffix)) return values
        const fcName = log2FCFieldName(activeSuffix)
        data.forEach(row => {
            const value = row[fcName]
            if (!_.isNumber(value)) return
            rowProteinTags(row).forEach(tag => {
                if (!(tag in values)) values[tag] = value
            })
        })
        return values
    }, [data, activeSuffix])
    const universeIsSubmissions = _.isArray(submission_tags) && submission_tags.length > 0
    const universeKey = universeIsSubmissions ? submission_tags.join(";") : proteome_tag

    const { mutate, data: shiftResult, isPending, isError, error } = api.annotations.queryAnnotations.usePostAnnotationShift()

    useEffect(() => {
        if (_.size(proteinValues) === 0) return
        if (!universeIsSubmissions && !_.isString(proteome_tag)) return
        mutate({
            protein_values: proteinValues,
            submission_tags: universeIsSubmissions ? submission_tags : undefined,
            proteome_tag: !universeIsSubmissions ? proteome_tag : undefined,
            search_string: _.isString(searchString) && searchString.length > 0 ? searchString : undefined,
            min_size: 3,
            limit: 500
        })
    }, [proteinValues, universeKey, searchString, mutate])

    const rows = useMemo(() => {
        if (!_.isArray(shiftResult)) return []
        return shiftResult
            .filter(r => directionFilter === "all" || r.direction === directionFilter)
            .filter(r => !onlySignificant || (_.isNumber(r.fdr) && r.fdr <= FDR_THRESHOLD))
    }, [shiftResult, directionFilter, onlySignificant])

    const memberTagsByAnnotation = useAnnotationMemberTags(useMemo(() => rows.map(r => r.annotation_tag), [rows]))

    // boxplot data for the expanded annotation: all plotted values, member indices as subset
    const boxData = useMemo(() => {
        if (!_.isString(expandedTag)) return null
        const members = memberTagsByAnnotation.get(expandedTag)
        if (!(members instanceof Set) || members.size === 0) return null
        const boxRows = Object.entries(proteinValues).map(([tag, v]) => ({ tag, v }))
        const memberIdx = boxRows.map((r, i) => i).filter(i => members.has(boxRows[i].tag))
        if (memberIdx.length === 0) return null
        return { boxRows, memberIdx }
    }, [expandedTag, memberTagsByAnnotation, proteinValues])

    return (
        <div>
            <div className="flex center-items" style={{ gap: "0.5rem", flexWrap: "wrap" }}>
                {_.isArray(suffixes) && suffixes.length > 1 ?
                    <>
                        <span className="font-size--small">1D value of plot:</span>
                        {suffixes.map(suffix => <OptionButton key={suffix} isSelected={suffix === activeSuffix} onClick={() => setPlotSuffix(suffix)}>{suffix}</OptionButton>)}
                    </> : null}
                <span className="font-size--small">Direction:</span>
                {["all", "up", "down"].map(dir => <OptionButton key={dir} isSelected={directionFilter === dir} onClick={() => setDirectionFilter(dir)}>{dir === "all" ? "All" : dir === "up" ? "↑ up" : "↓ down"}</OptionButton>)}
                <InputGroup small={true} leftIcon="search" placeholder="Filter annotations..." value={searchInput} onChange={e => setSearchInput(e.target.value)} />
                <Checkbox label={`Only significant (FDR ≤ ${FDR_THRESHOLD})`} checked={onlySignificant} onChange={() => setOnlySignificant(prev => !prev)} />
            </div>
            <div className="font-size--small margin-top--little margin-bottom--little">
                Systematic shift of annotations in the <strong>{activeSuffix ?? "selected"}</strong> plot: for each annotation a two-sided
                Mann-Whitney U test compares the log2FC of its member proteins against all other proteins of the background universe of
                {universeIsSubmissions
                    ? <> the proteins quantified in <strong>{submission_tags.length}</strong> submission(s) ({submission_tags.join(", ")})</>
                    : <> the proteome <strong>{proteome_tag}</strong></>}
                . Benjamini-Hochberg FDR corrected. {_.size(proteinValues)} protein(s) with a value.
                Note: <em>n out</em> = universe proteins with a value minus the annotation's own members, so it differs per annotation.
                {isPending ? <Spinner size={14} className="margin-left--little" /> : null}
            </div>
            {isError ? <div className="margin-bottom--little"><APIError error={error} /></div> : null}
            {isPending ? <Spinner /> : null}
            {_.isArray(shiftResult) && shiftResult.length === 0 && !isPending ?
                <NonIdealState icon="search" title="No annotations tested" description="No annotation has enough member and non-member proteins with values in the universe." /> : null}
            {rows.length > 0 ?
                <HTMLTable compact={true} striped={true} className="div--expand" style={{ maxHeight: "60vh", overflowY: "auto", display: "block" }}>
                    <thead>
                        <tr>
                            <th>Annotation</th>
                            <th>n in</th>
                            <th>n out</th>
                            <th>Mean in</th>
                            <th>Mean out</th>
                            <th>Shift</th>
                            <th>Direction</th>
                            <th>p-value</th>
                            <th>FDR</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(row => {
                            const significant = _.isNumber(row.fdr) && row.fdr <= FDR_THRESHOLD
                            const expanded = expandedTag === row.annotation_tag
                            return (
                                <Fragment key={row.annotation_tag}>
                                    <tr style={significant ? { backgroundColor: "#edf8b1" } : undefined}>
                                        <td>
                                            <span
                                                style={{ cursor: "pointer", textDecoration: expanded ? "underline" : "none" }}
                                                title="Click to show the boxplot of member vs. background values"
                                                onClick={() => setExpandedTag(prev => prev === row.annotation_tag ? undefined : row.annotation_tag)}>
                                                <Annotation tag={row.annotation_tag} indicateNumberProteins={false} />
                                            </span> <span className="font-size--smallest" style={{ color: "grey" }}>({row.annotation_tag})</span>
                                        </td>
                                        <td>{row.n_in}</td>
                                        <td>{row.n_out}</td>
                                        <td>{formatNumber(row.mean_in)}</td>
                                        <td>{formatNumber(row.mean_out)}</td>
                                        <td>{formatNumber(row.shift)}</td>
                                        <td>{row.direction === "up" ? "↑ up" : "↓ down"}</td>
                                        <td>{formatPValue(row.p_value)}</td>
                                        <td><strong>{formatPValue(row.fdr)}</strong></td>
                                        <td className="flex center-items" style={{ gap: "0.2rem" }}>
                                            <MarkAnnotationButton annotationTag={row.annotation_tag} memberTagsByAnnotation={memberTagsByAnnotation} plotTags={plotTags} markedProteinTags={markedProteinTags} onMarkProteinList={onMarkProteinList} />
                                        </td>
                                    </tr>
                                    {expanded && boxData ?
                                        <tr key={`${row.annotation_tag}-box`}>
                                            <td colSpan={10}>
                                                <div className="flex center-items" style={{ gap: "0.5rem" }}>
                                                    <span className="font-size--smallest">Boxplot of log2FC ({activeSuffix}): grey = all plotted proteins, red = members of this annotation</span>
                                                    <Subsetboxplot data={boxData.boxRows} yaxisName="v" subsetIndices={[boxData.memberIdx]} subsetNames={["In annotation"]} width={260} height={130} />
                                                </div>
                                            </td>
                                        </tr> : null}
                                </Fragment>
                            )
                        })}
                    </tbody>
                </HTMLTable> : null}
        </div>
    )
}


/**
 * @description "Enriched annotations" tab of the volcano drawers with two analyses on the
 * volcano plot data:
 * - "Overrepresentation (Fisher)": enrichment of the defined list (the protein lists selected
 *   in the drawer) - one-sided Fisher exact test + BH FDR (backend /annotations/analysis/enrichment)
 * - "Systematic shift (U-test)": 1D shift test per annotation - two-sided Mann-Whitney U comparing
 *   the log2FC of the annotation's member proteins against all other proteins of the universe
 *   (backend /annotations/analysis/shift)
 * The background universe is the proteins quantified in the given submission(s) (submission-wide
 * volcano plots) or all proteins of a proteome (cross-submission comparisons of the same proteome).
 *
 * @param {Object} props
 * @param {Object[]} props.data The merged volcano data rows (per protein group, with per-suffix log2FC columns).
 * @param {String[]} props.suffixes The volcano plot suffixes.
 * @param {Object[]} props.listOptions List options of the drawer (each with key and tags).
 * @param {String[]} props.selectedListKeys Keys of the selected list options - their union is the defined list.
 * @param {String[]} [props.submission_tags] Submissions defining the universe (submission-wide / compare).
 * @param {String} [props.proteome_tag] Proteome defining the universe (alternative to submission_tags).
 */
export function AnnotationEnrichmentSection({ data, suffixes = [], listOptions = [], selectedListKeys = [], submission_tags = [], proteome_tag = undefined, markedProteinTags = [], onMarkProteinList }) {
    const [subTab, setSubTab] = useState("fisher")

    return (
        <div>
            <Tabs id="annotation-enrichment-tabs" selectedTabId={subTab} onChange={setSubTab} renderActiveTabPanelOnly={true}>
                <Tab id="fisher" title="Overrepresentation (Fisher)" panel={
                    <AnnotationEnrichmentTable
                        data={data}
                        listOptions={listOptions} selectedListKeys={selectedListKeys}
                        submission_tags={submission_tags} proteome_tag={proteome_tag}
                        markedProteinTags={markedProteinTags} onMarkProteinList={onMarkProteinList} /> } />
                <Tab id="shift" title="Systematic shift (U-test)" panel={
                    <AnnotationShiftSection
                        data={data} suffixes={suffixes}
                        submission_tags={submission_tags} proteome_tag={proteome_tag}
                        markedProteinTags={markedProteinTags} onMarkProteinList={onMarkProteinList} /> } />
            </Tabs>
        </div>
    )
}
