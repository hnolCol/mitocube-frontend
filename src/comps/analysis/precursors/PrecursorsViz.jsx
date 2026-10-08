import { useMemo, useState } from "react";
import _ from "lodash";
import { Loading } from "@/comps/core/base/states/Loading";
import SequenceViewer from "./SequenceViewer";
import PrecursorIntensityPlot from "./PrecursorIntensityPlot";
import PrecursorCorrelationMatrix from "./PrecursorCorrelationMatrix";
import PositionCorrelationProfile from "./PositionCorrelationProfile";
import WithPrecursorIntensities from "./WithPrecursorIntensities";
import { mapPrecursorsToSequence, computeCorrelationMatrix } from "./precursorUtils";

function CorrelationViews({ precursor_tags, submission_tag, children }) {
    return (
        <WithPrecursorIntensities
            Component={({ intensityData }) => {
                const correlationData = computeCorrelationMatrix(precursor_tags, intensityData);
                if (!correlationData || correlationData.precursor_tags.length < 2) {
                    return (
                        <div style={{ padding: "2rem", textAlign: "center", color: "#666", backgroundColor: "#f8f9fa", borderRadius: "5px", border: "1px solid #e9ecef" }}>
                            <p>Not enough quantified precursors to compute correlations.</p>
                        </div>
                    );
                }
                return children({ correlationData });
            }}
            submission_tag={submission_tag}
            precursor_tags={precursor_tags}
        />
    );
}

/**
 * Main precursors visualization component.
 * Displays a protein sequence with mapped precursors and intensity profiles.
 *
 * Data sources:
 * - precursors: from GET /features/precursors/protein_groups/{protein_group_tag} (filtered by submission)
 * - sequence: from GET /features/{tag}/sequence
 * - intensities: from GET /features/precursors/{precursor_tag}/abundance (via WithPrecursorIntensities)
 * - correlation matrix: computed from the abundance data
 *
 * @param {Object} props
 * @param {string} props.submission_tag - Current submission tag
 * @param {string} props.selectedProteinTag - Currently selected protein tag
 * @param {Object[]} props.precursors - Precursor response objects ({ tag, sequence, charge, mz, im, protein_group_tag, ... })
 * @param {Object} props.sequenceData - Sequence response ({ feature_tag, sequence })
 * @param {string[]} props.ca_tags - Condition application tags
 * @param {string[]} props.attribute_tags - Attribute tags
 * @param {Map} props.caTagMap - Condition application tag map
 * @param {Map} props.attributeTagMap - Attribute tag map
 * @param {Map} props.proteinTagMap - Protein tag map
 * @returns {JSX.Element}
 */
function PrecursorsViz({
    submission_tag,
    selectedProteinTag,
    precursors = [],
    sequenceData = null,
    caTagMap,
    attributeTagMap,
    proteinTagMap,
    ca_tags,
    attribute_tags
}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPrecursorTags, setSelectedPrecursorTags] = useState([]);
    const [hoverPrecursorTag, setHoverPrecursorTag] = useState(null);
    const [activeView, setActiveView] = useState("sequence");

    const sequence = _.isString(sequenceData?.sequence) ? sequenceData.sequence : "";

    // Map precursors to positions on the protein sequence
    const mappedPrecursors = useMemo(() => mapPrecursorsToSequence(precursors, sequence), [precursors, sequence]);

    const allPrecursorTags = useMemo(() => mappedPrecursors.map(p => p.tag), [mappedPrecursors]);

    const handlePrecursorSelect = (precursorTag) => {
        setSelectedPrecursorTags(prev => {
            if (prev.includes(precursorTag)) {
                return prev.filter(t => t !== precursorTag);
            }
            return [...prev, precursorTag];
        });
    };

    const handlePrecursorHover = (precursorTag) => {
        setHoverPrecursorTag(precursorTag);
    };

    const handleSequencePrecursorClick = (precursor) => {
        handlePrecursorSelect(precursor.tag);
    };

    if (!sequence) {
        return <Loading />;
    }

    // No precursors quantified for this protein in the submission
    if (precursors.length === 0) {
        return (
            <div style={{ padding: "2rem", textAlign: "center", color: "#666", backgroundColor: "#f8f9fa", borderRadius: "5px", border: "1px solid #e9ecef" }}>
                <p>No precursors quantified for protein {selectedProteinTag} in submission {submission_tag}.</p>
            </div>
        );
    }

    const viewOptions = [
        { value: "sequence", label: "Sequence View" },
        { value: "correlation", label: "Correlation Matrix" },
        { value: "position", label: "Position Profile" }
    ];

    return (
        <div className="div--expand" style={{ overflowY: "auto", height: "90vh", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h3>Precursor Mapping &amp; Analysis</h3>
            <div
                style={{
                    padding: "10px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "4px",
                    border: "1px solid #e9ecef"
                }}
            >
                <div><strong>Protein:</strong> {selectedProteinTag}</div>
                <div><strong>Length:</strong> {sequence.length} amino acids</div>
                <div><strong>Precursors:</strong> {precursors.length}</div>
                <div><strong>Mapped to sequence:</strong> {mappedPrecursors.length}</div>
                <div><strong>Selected:</strong> {selectedPrecursorTags.length} precursors for intensity analysis</div>
            </div>
            <div style={{ maxWidth: "600px" }}>
                <input
                    type="text"
                    placeholder="Search precursors by tag, sequence or charge..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                    style={{ width: "100%", padding: "8px", fontSize: "14px" }}
                />
            </div>
            <div style={{ display: "flex", gap: "1rem", minHeight: "400px" }}>
                <div style={{ flex: 2, minWidth: "400px" }}>
                    <SequenceViewer
                        sequence={sequence}
                        precursors={mappedPrecursors}
                        charactersPerLine={60}
                        searchTerm={searchTerm}
                        onPrecursorClick={handleSequencePrecursorClick}
                        onPrecursorHover={handlePrecursorHover}
                    />
                </div>
                <div style={{ flex: 1, minWidth: "300px" }}>
                    <div style={{ marginBottom: "0.5rem", fontWeight: "bold" }}>
                        Precursor Intensities Across Samples
                    </div>
                    <WithPrecursorIntensities
                        Component={PrecursorIntensityPlot}
                        submission_tag={submission_tag}
                        precursor_tags={selectedPrecursorTags.length > 0 ? selectedPrecursorTags : allPrecursorTags}
                        selectedPrecursorTags={selectedPrecursorTags}
                        hoverPrecursorTag={hoverPrecursorTag}
                        width="100%"
                        height={350}
                        onPrecursorHover={handlePrecursorHover}
                    />
                    {selectedPrecursorTags.length > 0 && (
                        <div
                            style={{
                                marginTop: "1rem",
                                padding: "10px",
                                backgroundColor: "#f8f9fa",
                                borderRadius: "4px",
                                border: "1px solid #e9ecef"
                            }}
                        >
                            <div style={{ fontWeight: "bold", marginBottom: "0.5rem", fontSize: "13px" }}>
                                Selected Precursors ({selectedPrecursorTags.length}):
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                                {selectedPrecursorTags.map(precursorTag => (
                                    <div
                                        key={precursorTag}
                                        style={{
                                            padding: "2px 8px",
                                            backgroundColor: "#fff",
                                            border: "1px solid #dee2e6",
                                            borderRadius: "3px",
                                            fontSize: "12px",
                                            fontFamily: "monospace",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "4px"
                                        }}
                                    >
                                        {precursorTag}
                                        <span
                                            onClick={() => handlePrecursorSelect(precursorTag)}
                                            style={{ cursor: "pointer", color: "#dc3545", fontWeight: "bold" }}
                                            title="Deselect precursor"
                                        >
                                            ×
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div
                style={{
                    borderTop: "1px solid #e9ecef",
                    paddingTop: "1rem"
                }}
            >
                <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <span style={{ fontWeight: "bold", marginRight: "0.5rem" }}>View:</span>
                    {viewOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => setActiveView(option.value)}
                            style={{
                                padding: "6px 12px",
                                border: "1px solid #dee2e6",
                                borderRadius: "4px",
                                backgroundColor: activeView === option.value ? "#4285f4" : "white",
                                color: activeView === option.value ? "white" : "#212529",
                                cursor: "pointer",
                                fontSize: "13px"
                            }}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
                <div style={{ minHeight: "400px" }}>
                    {activeView === "sequence" && (
                        <div style={{ padding: "1rem", backgroundColor: "#f8f9fa", borderRadius: "4px", border: "1px solid #e9ecef" }}>
                            <p>Sequence view is shown in the top row. Use the search and selection tools above.</p>
                        </div>
                    )}
                    {activeView === "correlation" && (
                        <CorrelationViews
                            precursor_tags={allPrecursorTags}
                            submission_tag={submission_tag}
                        >
                            {({ correlationData }) => (
                                <PrecursorCorrelationMatrix
                                    precursor_tags={allPrecursorTags}
                                    correlationData={correlationData}
                                    hoverPrecursorTag={hoverPrecursorTag}
                                    width="100%"
                                    height={400}
                                    onPrecursorHover={handlePrecursorHover}
                                />
                            )}
                        </CorrelationViews>
                    )}
                    {activeView === "position" && (
                        <CorrelationViews
                            precursor_tags={allPrecursorTags}
                            submission_tag={submission_tag}
                        >
                            {({ correlationData }) => (
                                <PositionCorrelationProfile
                                    precursor_tags={allPrecursorTags}
                                    correlationData={correlationData}
                                    hoverPrecursorTag={hoverPrecursorTag}
                                    sequence={sequence}
                                    width="100%"
                                    height={400}
                                    onPrecursorHover={handlePrecursorHover}
                                />
                            )}
                        </CorrelationViews>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PrecursorsViz;
