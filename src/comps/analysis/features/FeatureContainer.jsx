

import hooks from "@mitocube/api-hooks"
import _ from "lodash"
import { Protein } from "../../core/base/protein/Protein";
import { motion } from "framer-motion";
import { useState } from "react";
export function PeptideFeatureItem({ peptide_tag }) {
    return <div>{peptide_tag}</div>
}


/**
 * 
 * @param {Object} props 
 * @param {string} props.search_string - The search string to query features.
 * @param {string} props.submission_tag - The submission tag to filter features.
 * @param {number} props.limit - The maximum number of features to return.
 * @param {Function} props.onClickFeature - Callback function when a feature is clicked. Receives the feature object as an argument. This is an object of tag (protein group), protein_tags (array of protein tags), peptide_tags (array of peptide tags), and
 * if the protein matches the search string or if only the peptide sequences matched. Example: {tag: "H7C835;Q9UF56", pg_match: true, protein_tags: ["H7C835", "Q9UF56"], peptide_match: false, peptide_tags: []}
 * @param {string[]} props.selected_feature_tags - Array of currently selected feature tags. Used to highlight selected features in the list.
 * @returns 
 */
export function FeatureContainer({ search_string, submission_tag, limit, onClickFeature, selected_feature_tags = [], show_selected_first = true }) {
   
    const [savedData, setSavedData] = useState([]);

    const { data: query_features, isLoading } = hooks.features.useGetFeaturesByQuery(
        { search_string, limit, submission_tag },
        {
            staleTime: 60000,
            placeholderData: savedData,
            onSuccess: (data) => _.isArray(data) && setSavedData(data),
        }
    );
    
    const displayedFeatures = isLoading ? savedData : _.isArray(query_features) ? query_features : savedData;

    return <div>
        <div className="font-size--smallest">Showing |  {_.isArray(displayedFeatures) ? displayedFeatures.length : 0}</div>
        <div className="flex flex-column bg--lightgrey" style={{ height: "78vh", overflow: "scroll", padding: "10px", borderRadius: "5px", marginTop: "3px", gap: "0px", width: "100%" }}>
            <div className="font-size--smallest">{_.isArray(query_features) && query_features.length === 0 ? <span>No results found..</span> : isLoading ? <span>Searching ...</span> : null }</div>
            {_.isArray(displayedFeatures) ? displayedFeatures.map((search_result, idx) => {
                const selected = _.includes(selected_feature_tags, search_result.tag)
                return <motion.button key={`${search_result.tag}-${idx}-result`}
                    whileHover={{ backgroundColor: "#f0f0f0" }}
                    className="flex flex-column"
                    style={{
                        padding: "10px",
                        border: "none",
                        backgroundColor: idx % 2 === 0 ? "#ffffff" : "#fafafafd",
                        textAlign: "left",
                        cursor: "pointer",
                        borderRadius: "5px"
                    }}
                    onClick={(() => { onClickFeature(search_result) })}>
                    
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
                                background: "#22c55e",
                                color: "#fff",
                                fontSize: 12,
                                lineHeight: 1,
                                fontWeight: 700,
                            }}
                        >
                            ✓
                            </span> : null}</div>
                        <div className="flex">
                        {
                            search_result.protein_tags.map(protein_tag =>
                                <Protein
                                    key={protein_tag}
                                    tag={protein_tag}
                                    popoverPosition="right"
                                    redirect_to_protein_site={false}
                                    />)
                        }
                        </div>
                    </div>
                    {_.isArray(search_result.peptide_tags) && search_result.peptide_tags.length > 0 ? <div>
                        <div className="flex">
                            {_.isArray(search_result.peptide_tags) ? search_result.peptide_tags.map(peptide_tag =>
                                <PeptideFeatureItem key={peptide_tag} peptide_tag={peptide_tag} />) : null}
                        </div>
                    </div> : null}
                    
                </motion.button>
            } ) : null}

        </div>
    </div>
}
    