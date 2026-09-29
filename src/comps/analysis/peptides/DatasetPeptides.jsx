import { useOutletContext } from "react-router";
import { useSearchParams } from "react-router";
import { addStringToArrayOrRemove } from "../../../services/arrays/transforms";
import _ from "lodash";
import { api } from "@/api";

import { ProteinSelector } from "./ProteinSelector";
import PeptidesLoad from "./PeptidesLoad";

// Use a separator that won't conflict with ";" in tags
const TAGS_SEPARATOR = "|";

/**
 * Main peptides analysis component for dataset view.
 * 
 * This is the entry point for the peptides analysis tab.
 * It uses the submission_tag from the outlet context and manages protein selection.
 * 
 * Features:
 * - Searchable protein list (ProteinSelector)
 * - Multiple protein tabs can be opened
 * - URL-based state management for protein selection
 * 
 * @returns {JSX.Element}
 */
function DatasetPeptides() {
    const { submission_tag } = useOutletContext();
    const [searchParams, setSearchParams] = useSearchParams();

    // Get values from URL or fallback to defaults
    const searchString = searchParams.get("search") || "";
    const selectedLimit = 50; // Default limit for protein search
    
    // Parse protein_tags from URL
    const proteinTagsString = searchParams.get("protein_tags") || "";
    const selectedProteinTags = proteinTagsString
        ? proteinTagsString.split(TAGS_SEPARATOR).filter(Boolean)
        : [];

    // Handler for updating protein_tags
    const updateProteinTags = (tags) => {
        const value = tags.length > 0 ? tags.join(TAGS_SEPARATOR) : "";
        const newParams = new URLSearchParams(searchParams);
        if (value === "") {
            newParams.delete("protein_tags");
        } else {
            newParams.set("protein_tags", value);
        }
        setSearchParams(newParams, { replace: true });
    };

    // Handler for updating search string
    const updateSearch = (value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value === "") {
            newParams.delete("search");
        } else {
            newParams.set("search", value);
        }
        setSearchParams(newParams, { replace: true });
    };

    // Handler for clicking a protein in the selector
    const handleProteinClick = (protein_tag) => {
        updateProteinTags(addStringToArrayOrRemove({ array: selectedProteinTags, string: protein_tag }));
    };

    // Handler for removing a protein tab
    const handleRemoveProtein = (protein_tag) => {
        updateProteinTags(selectedProteinTags.filter(t => t !== protein_tag));
    };

    return (
        <div>
            <h2>Peptides</h2>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "450px 1fr",
                    gridTemplateRows: "auto 1fr",
                    gap: "2rem",
                }}
            >
                {/* Column 1: Protein Selector */}
                <div className="flex flex-column padding-medium" style={{ width: "100%" }}>
                    <div className="margin--tiny">
                        <input
                            type="text"
                            className="search-input margin-right--little"
                            placeholder="Search for protein..."
                            style={{ width: "100%" }}
                            value={searchString}
                            onChange={(e) => updateSearch(e.target.value)}
                        />
                    </div>
                    
                    <ProteinSelector
                        search_string={searchString}
                        submission_tag={submission_tag}
                        limit={selectedLimit}
                        selected_protein_tags={selectedProteinTags}
                        onClickProtein={handleProteinClick}
                    />
                </div>

                {/* Column 2: Peptides Load for each selected protein */}
                <div style={{ marginLeft: "2rem" }}>
                    {selectedProteinTags.length === 0 ? (
                        <div style={{
                            padding: "2rem",
                            textAlign: "center",
                            color: "#666",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "5px",
                            border: "1px solid #e9ecef"
                        }}>
                            <p>Select a protein from the left panel to view peptide analysis.</p>
                        </div>
                    ) : (
                        selectedProteinTags.map((protein_tag, index) => (
                            <div 
                                key={protein_tag}
                                style={{
                                    marginBottom: "1rem",
                                    border: "1px solid #e9ecef",
                                    borderRadius: "5px",
                                    padding: "10px",
                                    backgroundColor: "#fff"
                                }}
                            >
                                <div 
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: "10px",
                                        paddingBottom: "10px",
                                        borderBottom: "1px solid #e9ecef"
                                    }}
                                >
                                    <span style={{ fontFamily: "monospace", fontWeight: "bold" }}>
                                        {protein_tag}
                                    </span>
                                    <button
                                        onClick={() => handleRemoveProtein(protein_tag)}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            color: "#dc3545",
                                            fontSize: "1.2em",
                                            padding: "0 5px"
                                        }}
                                        title="Close this protein tab"
                                    >
                                        \u00d7
                                    </button>
                                </div>
                                <PeptidesLoad 
                                    submission_tag={submission_tag}
                                    protein_tag={protein_tag}
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default DatasetPeptides;

import { useState } from "react";
