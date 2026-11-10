import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import _ from "lodash";
import { api } from "@/api";
import { Loading } from "@/comps/core/base/states/Loading";
import PTMSiteAbundancePlot from "./PTMSiteAbundancePlot";

/**
 * Searchable list of PTM sites matching the search string.
 *
 * Backed by GET /api/features/ptms/q which returns PTM site tags
 * (e.g. P12345_S473_PHOSPHO).
 *
 * @param {Object} props
 * @param {string} props.search_string - The search string to match against the PTM site tags.
 * @param {string} props.selected_tag - The currently selected PTM site tag.
 * @param {Function} props.onClickPTMSite - Callback when a PTM site is clicked. Receives the PTM site tag.
 * @returns {JSX.Element}
 */
function PTMSiteSelector({ search_string, selected_tag, onClickPTMSite }) {
    const [savedData, setSavedData] = useState([]);

    const { data: query_ptm_sites, isLoading, isFetching, isSuccess } = api.features.ptms.useGetPTMSitesByQuery(
        { search_string, limit: 50 },
        {
            staleTime: 60000,
            placeholderData: savedData,
            enabled: _.isString(search_string) && search_string.length >= 2
        }
    );

    useEffect(() => {
        if (isSuccess && _.isArray(query_ptm_sites)) {
            setSavedData(query_ptm_sites);
        }
    }, [isSuccess, query_ptm_sites]);

    const displayedSites = isLoading ? savedData : _.isArray(query_ptm_sites) ? query_ptm_sites : savedData;

    return (
        <div>
            <div className="font-size--smallest">
                Showing | {_.isArray(displayedSites) ? displayedSites.length : 0} PTM sites
            </div>
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {_.isArray(displayedSites) ? displayedSites.map(ptm_site_tag => (
                    <div
                        key={ptm_site_tag}
                        onClick={() => onClickPTMSite(ptm_site_tag)}
                        style={{
                            padding: "0.4rem 0.6rem",
                            cursor: "pointer",
                            borderRadius: "4px",
                            backgroundColor: selected_tag === ptm_site_tag ? "#e7f1ff" : "transparent",
                            fontWeight: selected_tag === ptm_site_tag ? "bold" : "normal"
                        }}
                    >
                        {ptm_site_tag}
                    </div>
                )) : null}
            </div>
        </div>
    );
}

/**
 * Detail view of a PTM site with its abundance across samples.
 *
 * Data sources:
 * - site: from GET /api/features/ptms/{ptm_site_tag}
 * - abundance: from GET /api/features/ptms/{ptm_site_tag}/abundance
 *
 * @param {Object} props
 * @param {string} props.ptm_site_tag - The tag of the PTM site to display.
 * @returns {JSX.Element}
 */
function PTMSiteDetail({ ptm_site_tag }) {
    const { data: ptm_site, isLoading: siteLoading, isError: siteError } = api.features.ptms.useGetPTMSiteByTag(
        { tag: ptm_site_tag },
        { enabled: _.isString(ptm_site_tag) }
    );
    const { data: abundanceData, isLoading: abundanceLoading, isFetching: abundanceFetching } = api.features.ptms.useGetPTMSiteAbundance(
        { tag: ptm_site_tag },
        { enabled: _.isString(ptm_site_tag) }
    );

    if (siteLoading) return <Loading />;
    if (siteError) return <div>The PTM site {ptm_site_tag} could not be retrieved.</div>;
    if (!_.isObject(ptm_site)) return null;

    return (
        <div>
            <h3>{ptm_site.tag}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "max-content max-content", columnGap: "1rem", rowGap: "0.25rem", fontSize: "0.9rem" }}>
                <div>Protein group</div><div>{ptm_site.protein_group_tag}</div>
                <div>Protein</div><div>{ptm_site.protein_tag ?? "group-level identification"}</div>
                <div>Position</div><div>{ptm_site.position}</div>
                <div>Modification</div><div>{ptm_site.modification}</div>
                <div>Residue</div><div>{ptm_site.residue ?? "-"}</div>
                <div>Quantified</div><div>{ptm_site.quantified ? "yes" : "no"}</div>
                <div>Supporting precursors</div>
                <div>{_.isArray(ptm_site.precursor_tags) ? ptm_site.precursor_tags.length : 0}</div>
            </div>
            {_.isString(ptm_site.sequence_window) ? (
                <div style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
                    <div>Sequence window</div>
                    <div style={{ fontFamily: "monospace" }}>{ptm_site.sequence_window}</div>
                </div>
            ) : null}
            {_.isArray(ptm_site.precursor_tags) && ptm_site.precursor_tags.length > 0 ? (
                <div style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
                    <div>Precursors</div>
                    <div style={{ fontFamily: "monospace" }}>{ptm_site.precursor_tags.join(", ")}</div>
                </div>
            ) : null}
            <div style={{ marginTop: "1.5rem" }}>
                <h4>Abundance across samples {abundanceFetching ? <span className="font-size--smallest">(updating)</span> : null}</h4>
                {abundanceLoading ? <Loading /> : <PTMSiteAbundancePlot abundanceData={_.isArray(abundanceData) ? abundanceData : []} />}
            </div>
        </div>
    );
}

/**
 * PTM exploration page. Search PTM sites (protein or protein group tag, position,
 * modification) and inspect a site's quantification across samples.
 */
function PTM({}) {
    const [searchParams, setSearchParams] = useSearchParams();
    const searchString = searchParams.get("search") || "";
    const selectedTag = searchParams.get("ptm_site_tag") || "";

    const updateSearch = (value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value === "") {
            newParams.delete("search");
        } else {
            newParams.set("search", value);
        }
        setSearchParams(newParams, { replace: true });
    };

    const onClickPTMSite = (ptm_site_tag) => {
        const newParams = new URLSearchParams(searchParams);
        if (selectedTag === ptm_site_tag) {
            newParams.delete("ptm_site_tag");
        } else {
            newParams.set("ptm_site_tag", ptm_site_tag);
        }
        setSearchParams(newParams, { replace: true });
    };

    return (
        <div style={{ padding: "1rem 2rem" }}>
            <h2>Post translational modifications</h2>
            <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
                <div style={{ minWidth: "300px" }}>
                    <input
                        type="text"
                        value={searchString}
                        onChange={event => updateSearch(event.target.value)}
                        placeholder="Search PTM sites, e.g. P12345_S473_PHOSPHO"
                        style={{ width: "100%", padding: "0.4rem", marginBottom: "0.5rem" }}
                    />
                    <PTMSiteSelector {...{ search_string: searchString, selected_tag: selectedTag, onClickPTMSite }} />
                </div>
                <div style={{ flex: 1 }}>
                    {_.isString(selectedTag) && selectedTag !== "" ? (
                        <PTMSiteDetail ptm_site_tag={selectedTag} />
                    ) : (
                        <div style={{ padding: "2rem", textAlign: "center", color: "#666", backgroundColor: "#f8f9fa", borderRadius: "5px", border: "1px solid #e9ecef" }}>
                            <p>Select a PTM site to view its details and abundance across samples.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PTM;
