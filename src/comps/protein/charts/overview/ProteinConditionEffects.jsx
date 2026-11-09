import { Spinner } from "@blueprintjs/core";
import _ from "lodash"
import { api } from "@/api";
import { Attribute } from "@/comps/core/base/attributes/Attribute";

function ConditionApplicationText({ tag }) {
    const { data: text } = api.condition_applications.useGetConditionApplicationText({ tag }, { enabled: _.isString(tag), staleTime: 300000 })
    return <span>{_.isString(text) ? text : tag}</span>
}

function EffectValue({ value }) {
    const color = value > 0 ? "#C8765B" : "#5B8AC8"
    return <strong style={{ color }}>{value > 0 ? "+" : ""}{value.toFixed(2)}</strong>
}

function DriverLoadings({ driver, variance_explained }) {
    if (!_.isObject(driver) || !_.isArray(driver.components)) return null
    return (
        <div className="flex flex--wrap" style={{ gap: "0.5rem" }}>
            {driver.components.map((loading, idx) =>
                <div key={idx} className="container--shadow padding--little" style={{ minWidth: "6rem" }}>
                    <div style={{ fontSize: 11, color: "var(--gray3)" }}>PC{idx + 1}{_.isArray(variance_explained) && _.isNumber(variance_explained[idx]) ? ` (${(variance_explained[idx] * 100).toFixed(1)}%)` : null}</div>
                    <div style={{ fontFamily: "monospace" }}>{loading.toFixed(3)}</div>
                </div>
            )}
        </div>
    )
}

function ProteinGroupConditionEffects({ proteome_tag, protein_group_tag }) {
    const { data, isLoading, isError, error } = api.stats.proteomeProjection.useGetProteomeProjectionDriver(
        { proteome_tag, protein_tag: protein_group_tag, n_components: 4 },
        { enabled: _.isString(proteome_tag) && _.isString(protein_group_tag), staleTime: 50000 }
    )

    if (isLoading) return <Spinner size={16} />
    if (isError) {
        const status = error?.response?.status
        if (status === 404) return null
        return <div style={{ color: "var(--gray3)" }}>Failed to load condition effects.</div>
    }
    if (!_.isObject(data)) return null

    const attributeEffects = _.isArray(data.attribute_effects) ? data.attribute_effects : []
    const conditionAssociations = _.isArray(data.condition_associations) ? data.condition_associations : []

    return (
        <div className="flex flex-column" style={{ gap: "0.75rem" }}>
            <div style={{ fontSize: 12, color: "var(--gray3)" }}>
                Based on {data.n_submissions} accessible submission{data.n_submissions === 1 ? "" : "s"} of this proteome.
            </div>
            {attributeEffects.length > 0 && (
                <div>
                    <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Strongest condition effects on this protein</div>
                    <div style={{ color: "var(--gray3)", fontSize: 12, marginBottom: "0.5rem" }}>
                        Mean z-score in samples with the condition minus mean z-score in all other samples, ranked by absolute effect.
                    </div>
                    <div className="flex flex-column" style={{ gap: "0.25rem" }}>
                        {attributeEffects.map((effect, idx) =>
                            <div key={`${effect.attribute_tag}-${effect.ca_tag}-${idx}`} className="flex flex--wrap align-center" style={{ gap: "0.5rem" }}>
                                <span style={{ minWidth: "10rem" }}><Attribute attribute_tag={effect.attribute_tag} /></span>
                                <span style={{ minWidth: "14rem" }}><ConditionApplicationText tag={effect.ca_tag} /></span>
                                <EffectValue value={effect.effect} />
                                <span style={{ fontSize: 12, color: "var(--gray3)" }}>
                                    z<sub>in</sub> {effect.mean_z_in.toFixed(2)} / z<sub>out</sub> {effect.mean_z_out.toFixed(2)} ({effect.n_in} vs {effect.n_out} samples)
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {conditionAssociations.length > 0 && (
                <div>
                    <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Condition associations</div>
                    <div className="flex flex--wrap" style={{ gap: "0.5rem" }}>
                        {_.orderBy(conditionAssociations, [ca => Math.abs(ca.mean_z)], ["desc"]).slice(0, 10).map((ca, idx) =>
                            <div key={`${ca.condition_application_tag}-${idx}`} className="container--shadow padding--little flex align-center" style={{ gap: "0.4rem" }}>
                                <ConditionApplicationText tag={ca.condition_application_tag} />
                                <EffectValue value={ca.mean_z} />
                                <span style={{ fontSize: 11, color: "var(--gray3)" }}>({ca.n_samples})</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <div>
                <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>PCA driver loadings</div>
                <DriverLoadings driver={data.driver} variance_explained={data.variance_explained} />
            </div>
        </div>
    )
}

/**
 * @description Displays the pooled proteome projection view of a protein group: the
 * attributes/condition applications with the strongest quantitative effect on the
 * protein, its per-condition associations and its PCA driver loadings.
 * @param {Object} props
 * @param {String} props.proteinTag The protein (feature) tag.
 */
export function ProteinConditionEffects({ proteinTag }) {
    const { data: feature, isSuccess } = api.features.proteinsQuery.useGetProteinByTag({ tag: proteinTag }, { enabled: _.isString(proteinTag), staleTime: Infinity })
    const { data: groups, isLoading: groupsLoading } = api.features.ranking.useGetProteinGroupsByProteinTag(
        { protein_tag: proteinTag },
        { enabled: _.isString(proteinTag), staleTime: Infinity }
    )

    const proteome_tag = isSuccess ? feature?.proteome_tag : null
    const hasData = _.isString(proteome_tag) && _.isArray(groups) && groups.length > 0

    return (
        <div className="container--shadow padding--little margin-top--little" style={{ textAlign: "left" }}>
            <h4>Condition &amp; Attribute Effects</h4>
            {groupsLoading || !isSuccess ? <Spinner size={16} /> :
                hasData ? groups.map(group_tag =>
                    <div key={group_tag}>
                        {groups.length > 1 ? <div style={{ fontFamily: "monospace", fontSize: 12, color: "var(--gray3)" }}>{group_tag}</div> : null}
                        <ProteinGroupConditionEffects proteome_tag={proteome_tag} protein_group_tag={group_tag} />
                    </div>
                ) :
                    <div style={{ color: "var(--gray3)" }}>No protein group with sufficient quantification data.</div>}
        </div>
    )
}
