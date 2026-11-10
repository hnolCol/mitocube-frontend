import { Spinner } from "@blueprintjs/core";
import _ from "lodash";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { api } from "@/api";
import { Loading } from "@/comps/core/base/states/Loading";
import { AttributeInput } from "@/comps/core/input/api/AttributeInput";
import { OptionButton } from "@/comps/core/base/buttons/OptionButton";
import { ProteinGroup } from "@/comps/core/base/protein/Protein";
import { Attribute } from "@/comps/core/base/attributes/Attribute";
import { AnnotationSelectionMenu } from "@/comps/core/base/annotations/AnnotationSelectionMenu";
import { ProteomeSelection } from "./ProteomeSelection";

const SORT_OPTIONS = [
    { value: "effect", label: "Sort: pooled effect" },
    { value: "max_abs_ca_effect", label: "Sort: max CA effect" }
]

const HELP_TEXT = <div className="container--shadow padding--little" style={{ maxWidth: "60rem", textAlign: "left", marginBottom: "1rem" }}>
    <p>All values are <strong>z-scores (sample-wise)</strong>: the abundance of a protein in a sample, standardized against the mean and
        standard deviation of that sample. Because z-scores are computed within each dataset, they are comparable across submissions.</p>
    <p><strong>Effect</strong> is the difference between the mean z-score of samples that carry any condition application of the selected
        attribute and the mean z-score of samples that carry none of them, pooled over all your accessible submissions of this proteome.
        A positive effect means the protein is on average more abundant in samples with the attribute, a negative effect means less abundant.</p>
    <p><strong>Max CA effect</strong> is the largest per-condition-application deviation from the attribute-level baseline. It highlights proteins
        that respond strongly to a single condition application even when their pooled effect cancels out across several of them.</p>
    <p>The columns show the mean z-score of the samples carrying each condition application. Values from few samples or few submissions
        should be interpreted with caution — a condition application measured in a single submission may reflect dataset-specific
        (batch) effects rather than a general trend.</p>
    <p>Click a protein to inspect its full abundance distribution per condition application in the protein abundance view.</p>
</div>

function AttributeSelection({ attribute_tag, setAttributeTag }) {
    const { data: attribute } = api.attributes.queryAttributes.useGetAttribute(
        { tag: attribute_tag }, { enabled: _.isString(attribute_tag) && attribute_tag.length > 0, staleTime: 300000 })

    return (
        <div className="flex align-center" style={{ gap: "0.5rem" }}>
            <span>Attribute</span>
            <AttributeInput
                text={_.isObject(attribute) ? attribute.text : "Select an attribute..."}
                onItemSelect={tag => setAttributeTag(tag)} />
        </div>
    )
}

function ConditionApplicationText({ tag }) {
    const { data: text } = api.condition_applications.useGetConditionApplicationText({ tag }, { enabled: _.isString(tag), staleTime: 300000 })
    return <span>{_.isString(text) ? text : tag}</span>
}

function MeanZCell({ entry }) {
    const hasValue = _.isObject(entry) && _.isNumber(entry.mean_z)
    const counts = hasValue ? `${entry.n_samples} sample${entry.n_samples === 1 ? "" : "s"} from ${entry.n_submissions} submission${entry.n_submissions === 1 ? "" : "s"}` : null
    return <td title={counts} style={{ textAlign: "center", fontFamily: "monospace", color: hasValue ? (entry.mean_z > 0 ? "#C8765B" : "#5B8AC8") : "var(--gray3)" }}>
        {hasValue ? (entry.mean_z > 0 ? "+" : "") + entry.mean_z.toFixed(2) : "—"}
    </td>
}

function ProteinEffectRow({ protein, caTags, onSelect }) {
    const conditionsByTag = _.keyBy(_.isArray(protein.conditions) ? protein.conditions : [], "ca_tag")
    return <tr onClick={() => onSelect(protein.tag)} style={{ cursor: "pointer" }}>
        <td style={{ color: "var(--gray3)" }}>{protein.rank}</td>
        <td><ProteinGroup tag={protein.tag} redirect_to_protein_site={false} onClick={() => onSelect(protein.tag)} /></td>
        <td style={{ textAlign: "center", fontFamily: "monospace" }}>
            {_.isNumber(protein.effect) ? protein.effect.toFixed(3) : "—"}
        </td>
        <td style={{ textAlign: "center", fontFamily: "monospace" }}>
            {_.isNumber(protein.max_abs_ca_effect) ? protein.max_abs_ca_effect.toFixed(3) : "—"}
        </td>
        {caTags.map(caTag => <MeanZCell key={caTag} entry={conditionsByTag[caTag]} />)}
    </tr>
}

/**
 * Attribute-level protein ranking: for the given attribute, the proteins with the
 * strongest z_score_sample differences between its condition applications across
 * all accessible submissions of the proteome. Each protein links to its abundance
 * view (/protein/:tag?view=abundance) for per-condition-application boxplots.
 * Backend: GET /api/stats/proteomes/{proteome_tag}/attributes/{attribute_tag}/protein_effects
 * (optional annotation_tag restricts the ranking to the annotation's protein groups)
 */
export function AttributeProteinEffects() {
    const [proteome_tag, setProteomeTag] = useState(null)
    const [attribute_tag, setAttributeTag] = useState(null)
    const [annotation_tag, setAnnotationTag] = useState(null)
    const [sortBy, setSortBy] = useState("effect")
    const [isHelpOpen, setIsHelpOpen] = useState(false)
    const redirect = useNavigate()

    const { data, isLoading, isError, error } = api.stats.proteomeProjection.useGetProteomeAttributeProteinEffects(
        { proteome_tag, attribute_tag, annotation_tag: _.isString(annotation_tag) ? annotation_tag : undefined, limit: 50 },
        { enabled: _.isString(proteome_tag) && proteome_tag.length > 0 && _.isString(attribute_tag) && attribute_tag.length > 0, staleTime: 50000 }
    )

    const caTags = _.isObject(data) && _.isArray(data.ca_tags) ? data.ca_tags : []
    const proteins = useMemo(() => {
        const allProteins = _.isObject(data) && _.isArray(data.proteins) ? data.proteins : []
        if (sortBy === "max_abs_ca_effect") {
            return [...allProteins].sort((a, b) => (_.isNumber(b.max_abs_ca_effect) ? b.max_abs_ca_effect : 0) - (_.isNumber(a.max_abs_ca_effect) ? a.max_abs_ca_effect : 0))
        }
        return allProteins
    }, [data, sortBy])

    const handleProteinSelect = (protein_tag) => {
        if (_.isString(protein_tag) && protein_tag.length > 0) redirect(`/protein/${protein_tag}?view=abundance`)
    }

    const handleAnnotationSelect = (e, tag) => {
        setAnnotationTag(_.isString(tag) && tag.length > 0 ? tag : null)
    }

    return (
        <div className="div--expand" style={{ overflowY: "scroll", height: "90vh" }}>
            <h2>Attribute Proteins</h2>
            <div className="flex flex--wrap" style={{ gap: "2rem", marginBottom: "1rem" }}>
                <ProteomeSelection proteome_tag={proteome_tag} setProteomeTag={setProteomeTag} />
                <AttributeSelection attribute_tag={attribute_tag} setAttributeTag={setAttributeTag} />
                <div className="flex align-center" style={{ gap: "0.5rem" }}>
                    <span>Annotation</span>
                    <AnnotationSelectionMenu
                        placeholder="Protein scope..."
                        onSelection={handleAnnotationSelect}
                        onRemove={handleAnnotationSelect}
                        selected_tags={_.isString(annotation_tag) ? [annotation_tag] : []}
                        minimal={true} />
                </div>
                <div className="flex align-center" style={{ gap: "0.5rem" }}>
                    {SORT_OPTIONS.map(option => <OptionButton
                        key={option.value}
                        isSelected={sortBy === option.value}
                        onClick={() => setSortBy(option.value)}
                        children={<span>{option.label}</span>} />)}
                </div>
                <button
                    style={{ border: "none", backgroundColor: "transparent", color: "#466688", cursor: "pointer" }}
                    onClick={() => setIsHelpOpen(!isHelpOpen)}>
                    {isHelpOpen ? "Hide" : "Show"} interpretation help
                </button>
            </div>
            {isHelpOpen ? HELP_TEXT : null}
            {!_.isString(proteome_tag) || !_.isString(attribute_tag) ?
                <div>Select a proteome and an attribute to see the proteins with the strongest abundance changes between its condition applications.</div> :
                isLoading ? <Loading /> :
                    isError ? <div style={{ color: "var(--gray3)" }}>
                        {error?.response?.status === 404
                            ? "No condition applications of this attribute found among the samples of your accessible submissions of this proteome."
                            : "Failed to load the attribute protein effects."}
                    </div> :
                        _.isObject(data) ? (
                            <div className="flex flex-column" style={{ gap: "0.75rem" }}>
                                <div>
                                    <Attribute attribute_tag={data.attribute_tag} /> — {proteins.length} protein{proteins.length === 1 ? "" : "s"} ranked by effect across
                                    {" "}{caTags.length} condition application{caTags.length === 1 ? "" : "s"}, pooled over {data.n_submissions} submission{data.n_submissions === 1 ? "" : "s"}
                                    {_.isString(annotation_tag) ? ", scoped to the selected annotation" : ""}.
                                    Click a protein to inspect its abundance distribution per condition application.
                                </div>
                                <table style={{ borderCollapse: "collapse", minWidth: "34rem" }}>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Protein</th>
                                            <th style={{ textAlign: "center" }}>Effect</th>
                                            <th style={{ textAlign: "center" }}>Max CA Effect</th>
                                            {caTags.map(caTag => <th key={caTag} style={{ textAlign: "center" }}><ConditionApplicationText tag={caTag} /></th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {proteins.map(protein =>
                                            <ProteinEffectRow key={protein.tag} protein={protein} caTags={caTags} onSelect={handleProteinSelect} />)}
                                    </tbody>
                                </table>
                            </div>
                        ) : <Spinner size={16} />}
        </div>
    )
}
