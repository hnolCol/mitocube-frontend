import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import _ from "lodash";
import { HIGHLIGHT_COLOR } from "@mitocube/viz/src/colors/palette";
import { api } from "@/api";

/**
 * ProteinSelector component for selecting proteins in the precursors analysis.
 *
 * Displays a searchable, scrollable list of protein groups with selection state.
 *
 * @param {Object} props
 * @param {string} props.search_string - The search string to query protein groups.
 * @param {string} props.submission_tag - The submission tag to filter protein groups.
 * @param {number} props.limit - The maximum number of protein groups to return.
 * @param {Function} props.onClickProtein - Callback function when a protein group is clicked. Receives the protein group tag.
 * @param {string[]} props.selected_protein_tags - Array of currently selected protein group tags. Used to highlight selected entries.
 * @returns {JSX.Element}
 */
export function ProteinSelector({
    search_string,
    submission_tag,
    limit = 50,
    onClickProtein,
    selected_protein_tags = []
}) {
    const [savedData, setSavedData] = useState([]);

    const { data: query_proteins, isLoading, isFetching, isSuccess } = api.features.info.useGetFeaturesByQuery(
        { search_string, limit, submission_tag, include_types: "protein_groups" },
        {
            staleTime: 60000,
            placeholderData: savedData,
            enabled: _.isString(submission_tag)
        }
    );

    useEffect(() => {
        if (isSuccess && _.isArray(query_proteins)) {
            setSavedData(query_proteins);
        }
    }, [isSuccess, query_proteins]);

    const displayedProteins = isLoading ? savedData : _.isArray(query_proteins) ? query_proteins : savedData;

    return (
        <div>
            <div className="font-size--smallest">
                Showing | {_.isArray(displayedProteins) ? displayedProteins.length : 0} proteins
            </div>
            <div
                className="flex flex-column bg--lightgrey"
                style={{
                    height: "78vh",
                    overflow: "scroll",
                    padding: "10px",
                    borderRadius: "5px",
                    marginTop: "3px",
                    gap: "0px",
                    width: "100%"
                }}
            >
                <div className="font-size--smallest">
                    {_.isArray(query_proteins) && query_proteins.length === 0 && !isLoading && !isFetching
                        ? <span>No results found..</span>
                        : isLoading || isFetching
                            ? <span>Searching ...</span>
                            : null
                    }
                </div>
                {_.isArray(displayedProteins) ? displayedProteins.map((protein, idx) => {
                    const selected = _.includes(selected_protein_tags, protein.tag);
                    return (
                        <motion.div
                            key={`${protein.tag}-${idx}-result`}
                            whileHover={{ backgroundColor: "#f0f0f0" }}
                            className="flex flex-column"
                            style={{
                                padding: "4px",
                                border: "none",
                                backgroundColor: idx % 2 === 0 ? "#ffffff" : "#fafafafd",
                                textAlign: "left",
                                cursor: "pointer",
                                borderRadius: "5px"
                            }}
                            onClick={() => onClickProtein(protein.tag)}
                        >
                            <div className="flex center-items" style={{ gap: "10px" }}>
                                <div>
                                    {selected ?
                                        <span
                                            aria-label="Selected"
                                            title="Selected"
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                width: 16,
                                                height: 16,
                                                borderRadius: 999,
                                                background: HIGHLIGHT_COLOR,
                                                color: "#fff",
                                                fontSize: 12,
                                                lineHeight: 1,
                                                fontWeight: 700,
                                            }}
                                        >
                                            ✓
                                        </span>
                                        : null}
                                </div>
                                <div className="flex div--expand">
                                    <div style={{ fontWeight: selected ? 700 : 400 }}>
                                        <span style={{ fontFamily: "monospace" }}>{protein.tag}</span>
                                    </div>
                                    <div style={{ fontSize: "0.8em", color: "#888" }}>
                                        {_.isArray(protein.protein_tags) ? protein.protein_tags.length : 0} proteins
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                }) : null}
            </div>
        </div>
    );
}
