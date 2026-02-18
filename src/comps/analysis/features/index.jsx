import { OptionButton } from "../../core/base/buttons/OptionButton";
import { FeatureContainer } from "./FeatureContainer";
import { useOutletContext } from "react-router";
import { useSearchParams } from "react-router-dom";
import { FeatureDataView } from "./DataView";
import { addStringToArrayOrRemove } from "../../../services/arrays/transforms";
const OPTIONS = ["All", "Protein Groups", "Precursors"];
const LIMITS = [20, 100, 200, 500];
// Use a separator that won't conflict with ";" in tags, e.g. "|"
const TAGS_SEPARATOR = "|";


export function DeselectAllButton({ onClick, selectedItems }) {
    const selectedItemsCount = selectedItems.length
    return <OptionButton
        isSelected={false}
        onClick={() => {
            if (selectedItemsCount === 0) return;
            onClick([]);
        }}
    >
                    
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span
                style={{
                    fontWeight: 700,
                    color: selectedItemsCount ? "#B42318" : "#667085",
                }}
            >
                Deselect
            </span>

            <span
                style={{
                    fontSize: "0.75rem",
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: selectedItemsCount ? "#FEE4E2" : "#F2F4F7",
                    color: selectedItemsCount ? "#B42318" : "#667085",
                    fontWeight: 700,
                    lineHeight: 1.2,
                    userSelect: "none",
                }}
                title={selectedItemsCount ? "Clear selected tags" : "Nothing selected"}
            >
                {selectedItemsCount}
            </span>
        </span>
    </OptionButton>
}


export function DatasetFeatureView() {
    const { submission_tag } = useOutletContext();

    const [searchParams, setSearchParams] = useSearchParams();
    // Get values from URL or fallback to defaults
    const searchString = searchParams.get("search") || "";
    const selectedOption = OPTIONS.includes(searchParams.get("option")) ? searchParams.get("option") : OPTIONS[0];
    const selectedLimit = LIMITS.includes(Number(searchParams.get("limit"))) ? Number(searchParams.get("limit")) : LIMITS[0];

    // Parse protein_group_tags from URL
    const proteinGroupTagsString = searchParams.get("protein_group_tags") || "";
    const proteinGroupTags = proteinGroupTagsString
        ? proteinGroupTagsString.split(TAGS_SEPARATOR).filter(Boolean)
        : [];
    // Handlers to update URL params
    const updateParam = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value === "" || value === undefined || value === null) {
            newParams.delete(key);
        } else {
            newParams.set(key, value);
        }
        setSearchParams(newParams, { replace: true });
    };

    // Handler for updating protein_group_tags
    const updateProteinGroupTags = (tags) => {
        const value = tags.length > 0 ? tags.join(TAGS_SEPARATOR) : "";
        updateParam("protein_group_tags", value);
    };

    return (
        <div>
            <h2>Dataset Features</h2>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "450px 1fr",
                    gridTemplateRows: "auto 1fr",
                    gap: "2rem",
                }}
            >
            <div className="flex flex-column padding-medium" style={{width : "100%"}}>
                <div className="margin--tiny">
                    <input
                        type="text"
                        className="search-input margin-right--little"
                        placeholder="Search for feature..."
                        style={{ width: "100%" }}
                        value={searchString}
                        onChange={(e) => updateParam("search", e.target.value)}
                    />
                </div>
                <div className="flex margin-top--little center-items" style={{ gap: "5px", width: "100%" }}>
                    <span>Features | </span>
                    {OPTIONS.map(option => (
                        <OptionButton
                            key={option}
                            isSelected={option === selectedOption}
                            onClick={() => updateParam("option", option)}
                        >
                            <span>{option}</span>
                        </OptionButton>
                    ))}
                
                <span>|</span>
                <DeselectAllButton onClick={() => updateProteinGroupTags([])} selectedItems={proteinGroupTags} />
                        
                </div>
                <div className="flex margin-top--little center-items" style={{ gap: "5px", width : "100%" }}>
                    <span>Limit | </span>
                    {LIMITS.map(option => (
                        <OptionButton
                            key={option}
                            isSelected={option === selectedLimit}
                            onClick={() => updateParam("limit", option)}
                        >
                            <span>{option}</span>
                        </OptionButton>
                    ))}
                </div>
               
                <FeatureContainer
                    search_string={searchString}
                    limit={selectedLimit}
                    submission_tag={submission_tag}
                    selected_feature_tags={proteinGroupTags}
                    onClickFeature={(featureSearchResult) => {
                        updateProteinGroupTags(addStringToArrayOrRemove({ array: proteinGroupTags, string: featureSearchResult.tag }));
                    }}
                />
                
                </div>

                {/* Column 2: FeatureDataView only */}
                <div style={{marginLeft : "2rem"}}>
                    <FeatureDataView feature_tags={proteinGroupTags} submission_tag={submission_tag} />
                </div>
            </div>
        </div>
    );
}
