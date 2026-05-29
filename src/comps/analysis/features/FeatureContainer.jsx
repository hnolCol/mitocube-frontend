

import hooks from "@mitocube/api-hooks"
import _, { set } from "lodash"
import { Protein, ProteinGroup } from "../../core/base/protein/Protein";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
export function PeptideFeatureItem({ peptide_tag }) {
    return <div>{peptide_tag}</div>
}
import { api } from "@/api";
import { HIGHLIGHT_COLOR } from "@mitocube/viz/src/colors/palette";



/**
 * 
 * @param {Object} props 
 * @param {string} props.search_string - The search string to query features.
 * @param {string} props.submission_tag - The submission tag to filter features.
 * @param {number} props.limit - The maximum number of features to return.
 * @param {Function} props.onClickFeature - Callback function when a feature is clicked. Receives the feature object as an argument. This is an object of tag (protein group), protein_tags (array of protein tags), peptide_tags (array of peptide tags), and
 * if the protein matches the search string or if only the peptide sequences matched. Example: {tag: "H7C835;Q9UF56", pg_match: true, protein_tags: ["H7C835", "Q9UF56"], peptide_match: false, peptide_tags: []}
 * @param {string[]} props.selected_feature_tags - Array of currently selected feature tags. Used to highlight selected features in the list.
 * @param {string[]} props.annotation_tags - Array of annotation tags to filter features.
 * @returns 
 */
export function FeatureContainer({ search_string, submission_tag, limit, onClickFeature, sort_by_stat = undefined, annotation_tags = [], selected_feature_tags = [], show_selected_first = true }) {
    const [savedData, setSavedData] = useState([]);
  
    const { data: query_features, isLoading, isFetching, isSuccess } = api.features.info.useGetFeaturesByQuery(
        { search_string, limit, submission_tag, include_types : "protein_groups", sort_by_stat : _.isString(sort_by_stat) ? sort_by_stat : undefined, annotation_tags : _.isArray(annotation_tags) && annotation_tags.length > 0 ? _.join(annotation_tags, ";") : undefined },
        {
            staleTime: 60000,
            placeholderData: savedData
        }
    );    

    useEffect(() => {
        if (isSuccess && _.isArray(query_features)) {
            setSavedData(query_features)
        }
    }, [isSuccess]);  

    const displayedFeatures = isLoading ? savedData : _.isArray(query_features) ? query_features : savedData;

    return <div>
        <div className="font-size--smallest">Showing |  {_.isArray(displayedFeatures) ? displayedFeatures.length : 0}</div>
        <div className="flex flex-column bg--lightgrey" style={{ height: "78vh", overflow: "scroll", padding: "10px", borderRadius: "5px", marginTop: "3px", gap: "0px", width: "100%" }}>
            <div className="font-size--smallest">{_.isArray(query_features) && query_features.length === 0 && !isLoading && !isFetching ? <span>No results found..</span> : isLoading || isFetching ? <span>Searching ...</span> : null }</div>
            {_.isArray(displayedFeatures) ? displayedFeatures.map((search_result, idx) => {
                const selected = _.includes(selected_feature_tags, search_result.tag)
                // console.log("selected", selected, search_result.tag, search_result.protein_tags, selected_feature_tags, search_result)
                return <motion.div key={`${search_result.tag}-${idx}-result`}
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
                    >
                    
                    <div className="flex center-items" style={{ gap: "10px" }}>
                        <div>{selected  ?  
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
                            </span> : null}</div>
                        <div className="flex div--expand">
                            {
                                search_result.pg_match ? <ProteinGroup
                                    tag={search_result.tag}
                                    redirect_to_protein_site={false}
                                    onClick={(tag) => onClickFeature(tag)} highlight={selected} fill /> : null
                            }
                        </div>
                    </div>
                    {_.isArray(search_result.peptide_tags) && search_result.peptide_tags.length > 0 ? <div>
                        <div className="flex">
                            {_.isArray(search_result.peptide_tags) ? search_result.peptide_tags.map(peptide_tag =>
                                <PeptideFeatureItem key={peptide_tag} peptide_tag={peptide_tag} />) : null}
                        </div>
                    </div> : null}
                    
                </motion.div>
            } ) : null}

        </div>
    </div>
}
    