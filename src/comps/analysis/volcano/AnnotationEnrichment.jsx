
import _ from "lodash"
import { useMemo, useState } from "react"
import { Checkbox, HTMLTable, InputGroup, NonIdealState, Spinner } from "@blueprintjs/core"
import { api } from "@/api"
import { Annotation } from "@/comps/core/base/annotations/Annotation"
import APIError from "@/comps/core/error/APIerror"
import useDebounce from "@/hooks/useDebounce"

const FDR_THRESHOLD = 0.05

function formatPValue(p) {
    if (!_.isNumber(p)) return "-"
    if (p < 1e-300) return p.toExponential(1)
    if (p < 0.0001) return p.toExponential(2)
    return p.toFixed(4)
}

function formatOddsRatio(or) {
    if (!_.isNumber(or)) return "-"
    if (or >= 1000) return or.toExponential(1)
    return or >= 100 ? or.toFixed(0) : or.toFixed(2)
}

/**
 * @description "Enriched annotations" tab: runs an enrichment analysis (one-sided Fisher exact
 * test + Benjamini-Hochberg FDR, backend endpoint /annotations/analysis/enrichment) on the
 * currently selected protein list (the defined list of the volcano plot drawer) against a
 * background universe - the union of the proteins quantified in the given submission(s)
 * (submission-wide volcano plots) or all proteins of a proteome (cross-submission compare).
 *
 * @param {Object} props
 * @param {Object[]} props.listOptions List options of the drawer (each with key and tags).
 * @param {String[]} props.selectedListKeys Keys of the selected list options - their union is the defined list.
 * @param {String[]} [props.submission_tags] Submissions defining the universe (submission-wide / compare).
 * @param {String} [props.proteome_tag] Proteome defining the universe (alternative to submission_tags).
 */
export function AnnotationEnrichmentSection({ listOptions = [], selectedListKeys = [], submission_tags = [], proteome_tag = undefined }) {
    const [searchInput, setSearchInput] = useState("")
    const searchString = useDebounce(searchInput, 300)
    const [onlySignificant, setOnlySignificant] = useState(false)

    const selectedTags = useMemo(() => {
        const set = new Set()
        ;(listOptions ?? []).filter(option => selectedListKeys.includes(option.key))
            .forEach(option => (option.tags ?? []).forEach(tag => set.add(tag)))
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
                                </tr>
                            )
                        })}
                    </tbody>
                </HTMLTable> : null}
        </div>
    )
}
