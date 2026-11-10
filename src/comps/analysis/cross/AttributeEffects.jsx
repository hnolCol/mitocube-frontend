import { Spinner } from "@blueprintjs/core";
import _ from "lodash";
import { useState } from "react";
import { api } from "@/api";
import { Loading } from "@/comps/core/base/states/Loading";
import { AttributeInput } from "@/comps/core/input/api/AttributeInput";
import { Protein } from "@/comps/core/base/protein/Protein";
import { Attribute } from "@/comps/core/base/attributes/Attribute";
import { ProteomeSelection } from "./ProteomeSelection";

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

function ConditionRow({ condition }) {
    const [isExpanded, setIsExpanded] = useState(false)
    const effects = _.isArray(condition.effects) ? condition.effects : []

    return (
        <div className="container--shadow padding--little" style={{ minWidth: "34rem" }}>
            <div className="flex align-center" style={{ gap: "0.75rem" }}>
                <strong><ConditionApplicationText tag={condition.ca_tag} /></strong>
                <span style={{ fontFamily: "monospace" }}>separation {_.isNumber(condition.separation) ? condition.separation.toFixed(3) : "—"}</span>
                <span style={{ fontSize: 12, color: "var(--gray3)" }}>
                    {condition.n_in} vs {condition.n_out} samples
                </span>
                {effects.length > 0 ? (
                    <button
                        style={{ border: "none", backgroundColor: "transparent", color: "#466688", cursor: "pointer" }}
                        onClick={() => setIsExpanded(!isExpanded)}>
                        {isExpanded ? "Hide" : "Show"} top affected proteins
                    </button>
                ) : null}
            </div>
            {isExpanded ? (
                <div className="flex flex-column" style={{ gap: "0.25rem", marginTop: "0.5rem" }}>
                    {effects.map((effect, idx) =>
                        <div key={`${effect.tag}-${idx}`} className="flex align-center" style={{ gap: "0.5rem" }}>
                            <span style={{ fontSize: 12, color: "var(--gray3)", minWidth: "1.2rem" }}>{idx + 1}.</span>
                            <Protein minimal tag={effect.tag} />
                            <span style={{
                                fontFamily: "monospace",
                                color: _.isNumber(effect.effect) ? (effect.effect > 0 ? "#C8765B" : "#5B8AC8") : undefined
                            }}>
                                {_.isNumber(effect.effect) ? (effect.effect > 0 ? "+" : "") + effect.effect.toFixed(2) : "—"}
                            </span>
                            <span style={{ fontSize: 12, color: "var(--gray3)" }}>
                                z<sub>in</sub> {_.isNumber(effect.mean_z_in) ? effect.mean_z_in.toFixed(2) : "—"} / z<sub>out</sub> {_.isNumber(effect.mean_z_out) ? effect.mean_z_out.toFixed(2) : "—"}
                            </span>
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    )
}

/**
 * Attribute-level view of condition effects: for every condition application value
 * of the given attribute, the separation on the pooled projection and the top
 * affected proteins (backend: GET /api/stats/proteomes/{proteome_tag}/projection/effects/attribute/{attribute_tag}).
 */
export function AttributeEffects() {
    const [proteome_tag, setProteomeTag] = useState(null)
    const [attribute_tag, setAttributeTag] = useState(null)

    const { data, isLoading, isError, error } = api.stats.proteomeProjection.useGetProteomeProjectionAttributeEffects(
        { proteome_tag, attribute_tag, n_components: 4, top_proteins: 10 },
        { enabled: _.isString(proteome_tag) && proteome_tag.length > 0 && _.isString(attribute_tag) && attribute_tag.length > 0, staleTime: 50000 }
    )

    return (
        <div className="div--expand" style={{ overflowY: "scroll", height: "90vh" }}>
            <h2>Attribute Effects</h2>
            <div className="flex flex--wrap" style={{ gap: "2rem", marginBottom: "1rem" }}>
                <ProteomeSelection proteome_tag={proteome_tag} setProteomeTag={setProteomeTag} />
                <AttributeSelection attribute_tag={attribute_tag} setAttributeTag={setAttributeTag} />
            </div>
            {!_.isString(proteome_tag) || !_.isString(attribute_tag) ?
                <div>Select a proteome and an attribute to compare how strongly its condition applications separate the pooled samples.</div> :
                isLoading ? <Loading /> :
                    isError ? <div style={{ color: "var(--gray3)" }}>
                        {error?.response?.status === 404
                            ? "No condition applications of this attribute found among the samples of your accessible submissions of this proteome."
                            : "Failed to load the attribute effects."}
                    </div> :
                        _.isObject(data) ? (
                            <div className="flex flex-column" style={{ gap: "0.75rem" }}>
                                <div>
                                    <Attribute attribute_tag={data.attribute_tag} /> — {data.conditions.length} condition application{data.conditions.length === 1 ? "" : "s"},
                                    sorted by separation on the pooled projection ({data.n_submissions} submission{data.n_submissions === 1 ? "" : "s"}).
                                </div>
                                {data.conditions.map(condition =>
                                    <ConditionRow key={condition.ca_tag} condition={condition} />
                                )}
                            </div>
                        ) : <Spinner size={16} />}
        </div>
    )
}
