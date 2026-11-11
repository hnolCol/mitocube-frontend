import { useMemo, useState } from "react";
import _ from "lodash";
import { api } from "@/api";
import { Loading } from "@/comps/core/base/states/Loading";
import SequenceViewer from "@/comps/analysis/precursors/SequenceViewer";

/**
 * Parses a PTM site tag of the form {protein_tag}_{position}_{MODIFICATION}
 * (e.g. P12345_S473_PHOSPHO) as derived by the backend. Returns null if the tag
 * does not belong to the given protein or cannot be parsed.
 */
function parsePTMSiteTag(ptm_site_tag, protein_tag) {
    if (!_.isString(ptm_site_tag) || !_.isString(protein_tag)) return null;
    const prefix = `${protein_tag}_`;
    if (!ptm_site_tag.startsWith(prefix)) return null;
    const match = ptm_site_tag.slice(prefix.length).match(/^(\d+)_(.+)$/);
    if (!match) return null;
    return { position: parseInt(match[1], 10), modification: match[2] };
}

/**
 * A single PTM site row. The details (residue, UniMod, quantification status,
 * supporting precursors) are fetched per site via GET /api/features/ptms/{ptm_site_tag}.
 */
function PTMSiteRow({ ptm_site_tag }) {
    const { data: ptm_site, isLoading } = api.features.ptms.useGetPTMSiteByTag(
        { tag: ptm_site_tag },
        { staleTime: Infinity }
    );

    if (isLoading) {
        return (
            <tr>
                <td colSpan={5} style={{ color: "#6c757d" }}>Loading {ptm_site_tag}…</td>
            </tr>
        );
    }
    if (!_.isObject(ptm_site)) {
        return (
            <tr>
                <td colSpan={5} style={{ color: "#6c757d" }}>{ptm_site_tag} (details unavailable)</td>
            </tr>
        );
    }

    return (
        <tr>
            <td style={{ fontFamily: "monospace" }}>{ptm_site.tag}</td>
            <td>{ptm_site.residue ?? "-"}</td>
            <td>
                {_.isNumber(ptm_site.unimod_id) || _.isString(ptm_site.unimod_name)
                    ? `${ptm_site.unimod_name ?? ""} (${ptm_site.unimod_id ?? "no accession"})`.trim()
                    : "-"}
            </td>
            <td>{ptm_site.quantified ? "yes" : "no"}</td>
            <td style={{ fontFamily: "monospace" }}>
                {_.isArray(ptm_site.precursor_tags) ? ptm_site.precursor_tags.join(", ") : "-"}
            </td>
        </tr>
    );
}

/**
 * PTM sites of a single protein on its sequence.
 *
 * Data sources:
 * - sequence: from GET /api/features/{tag}/sequence
 * - PTM site tags: from GET /api/features/ptms/q (searched with the protein tag,
 *   then filtered to tags derived from this protein)
 * - PTM site details: from GET /api/features/ptms/{ptm_site_tag} (per row)
 *
 * The sites are mapped onto the protein sequence with the SequenceViewer used in
 * the precursor analysis (submission/<submission_tag>/precursors): each PTM site
 * marks the modified residue.
 *
 * @param {Object} props
 * @param {string} props.protein_tag - The protein tag to display the PTMs for.
 * @returns {JSX.Element}
 */
function ProteinPTMSection({ protein_tag }) {
    const [searchTerm, setSearchTerm] = useState("");

    const { data: sequenceData, isLoading: sequenceLoading, isError: sequenceError } = api.features.sequence.useGetSequenceByFeatureKey(
        { tag: protein_tag },
        { enabled: _.isString(protein_tag), staleTime: Infinity }
    );

    const { data: siteTags, isLoading: sitesLoading, isError: sitesError } = api.features.ptms.useGetPTMSitesByQuery(
        { search_string: protein_tag, limit: 500 },
        { enabled: _.isString(protein_tag), staleTime: Infinity }
    );

    const sequence = _.isString(sequenceData?.sequence) ? sequenceData.sequence : "";

    const sites = useMemo(() => {
        if (!_.isArray(siteTags) || sequence.length === 0) return [];
        return siteTags
            .map((ptm_site_tag) => {
                const parsed = parsePTMSiteTag(ptm_site_tag, protein_tag);
                return parsed && parsed.position >= 1 && parsed.position <= sequence.length
                    ? { tag: ptm_site_tag, ...parsed }
                    : null;
            })
            .filter(Boolean)
            .sort((a, b) => a.position - b.position);
    }, [siteTags, protein_tag, sequence]);

    const filteredSites = useMemo(() => {
        if (searchTerm === "") return sites;
        const lowerSearch = searchTerm.toLowerCase();
        return sites.filter((site) => site.tag.toLowerCase().includes(lowerSearch));
    }, [sites, searchTerm]);

    const sequenceMarkers = useMemo(() => {
        return filteredSites.map((site) => ({
            tag: site.tag,
            sequence: site.modification,
            start: site.position,
            end: site.position
        }));
    }, [filteredSites]);

    if (sequenceLoading || sitesLoading) return <Loading />;
    if (sequenceError) return <div>The sequence of {protein_tag} could not be retrieved.</div>;
    if (sitesError) return <div>The PTM sites of {protein_tag} could not be retrieved.</div>;
    if (sequence.length === 0) return <div>No sequence available for {protein_tag}.</div>;

    return (
        <div style={{ paddingBottom: "1rem" }}>
            <h3 style={{ marginBottom: "0.25rem" }}>{protein_tag}</h3>
            <div className="font-size--smallest">
                {sites.length} PTM {sites.length === 1 ? "site" : "sites"} annotated on this protein.
                PTM precursor quantification is done at the precursor level; site markers show the modified residue.
            </div>
            <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Filter PTM sites, e.g. PHOSPHO or a position"
                style={{ padding: "0.4rem", margin: "0.5rem 0", width: "320px" }}
            />
            {sites.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "#666", backgroundColor: "#f8f9fa", borderRadius: "5px", border: "1px solid #e9ecef" }}>
                    <p>No PTM sites annotated for this protein.</p>
                </div>
            ) : (
                <>
                    <SequenceViewer
                        sequence={sequence}
                        precursors={sequenceMarkers}
                        searchTerm={searchTerm}
                    />
                    <table style={{ borderCollapse: "collapse", marginTop: "1rem", fontSize: "0.85rem" }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: "left", padding: "0.25rem 1rem 0.25rem 0" }}>PTM site</th>
                                <th style={{ textAlign: "left", padding: "0.25rem 1rem 0.25rem 0" }}>Residue</th>
                                <th style={{ textAlign: "left", padding: "0.25rem 1rem 0.25rem 0" }}>UniMod</th>
                                <th style={{ textAlign: "left", padding: "0.25rem 1rem 0.25rem 0" }}>Quantified</th>
                                <th style={{ textAlign: "left", padding: "0.25rem 1rem 0.25rem 0" }}>Supporting precursors</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSites.map((site) => (
                                <PTMSiteRow key={site.tag} ptm_site_tag={site.tag} />
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
}

/**
 * PTM tab of the protein view. Displays the PTM sites per protein on the protein
 * sequence, using the precursor sequence visualization. Feature tags that are
 * protein group tags (";""-separated) get one section per protein.
 *
 * @param {Object} props
 * @param {string} props.feature_tag - The protein (or protein group) tag.
 * @returns {JSX.Element}
 */
export function ProteinPTMs({ feature_tag }) {
    const protein_tags = useMemo(() => {
        return _.isString(feature_tag) ? feature_tag.split(";").filter((tag) => tag !== "") : [];
    }, [feature_tag]);

    if (protein_tags.length === 0) {
        return <div style={{ padding: "1rem" }}>No protein selected.</div>;
    }

    return (
        <div style={{ padding: "0.5rem", overflowY: "auto", height: "100%" }}>
            {protein_tags.map((protein_tag) => (
                <ProteinPTMSection key={protein_tag} protein_tag={protein_tag} />
            ))}
        </div>
    );
}
