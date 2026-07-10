import { useState, useMemo, useEffect } from "react";
import { Button, Checkbox, InputGroup, MenuItem, Menu, Popover } from "@blueprintjs/core";
import { api } from "@/api";
import { ConditionApplicationsView } from "@/comps/core/base/condition_applications/ConditionApplicationView";
import _ from "lodash";
import { Attribute } from "@/comps/core/base/attributes/Attribute";
import { Trait } from "@/comps/core/base/traits/Trait";
import { addStringToArrayOrRemove } from "@/services/arrays/transforms";


function CAHItem({ cahierarchy, onSelect, level = 0 }) {

    const is_ca = _.isString(cahierarchy)
    const type = cahierarchy?.type
    const tag = cahierarchy?.tag
    const children = cahierarchy?.children || []

    if (is_ca) {
        return (
            <div
                style={{
                    marginLeft: level * 10,
                    padding: "1px",
                    borderLeft: "1px solid #eee",
                    cursor: "pointer"
                }}
            >
                <button
                    className="dropdown-button dropdown-button--ca"
                    onClick={() => onSelect(cahierarchy)}
                >
                    <ConditionApplicationsView tag={cahierarchy} />
                </button>
            </div>
        )
    }

    return (
        <div
            style={{
                marginLeft: level * 10,
                padding: "1px",
                borderLeft: "1px solid #eee",
                cursor: "pointer"
            }}
        >
            {
                !is_ca && type === "attribute"
                    ? (
                        <button className="dropdown-button dropdown-button--attribute">
                            <Attribute attribute_tag={tag} />
                        </button>
                    )
                    : type === "trait" && children.length > 1
                        ? (
                            <button className="dropdown-button dropdown-button--trait">
                                <Trait trait_tag={tag} />
                            </button>
                        )
                        : null
            }

            {
                !is_ca
                    ? children.map(ca_i => (
                        <CAHItem
                            key={`${_.isString(ca_i) ? ca_i : ca_i.tag}-${type}-${tag}-${level}`}
                            cahierarchy={ca_i}
                            onSelect={onSelect}
                            level={level + 1}
                        />
                    ))
                    : null
            }
        </div>
    )
}
export function ConditionApplicationFilter({ setSubmissionFilter, submissionFilter, return_tags_only = false, infoText = "Datasets with the selected condition applications will be displayed.", showIncludeSampleLevelOption = true }) {
    const [searchString, setSearchString] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

    const { data: allCAs, isLoading, error } = api.condition_applications.useGetConditionApplicationHierarchyByQuery({
        search_string : searchString,
        limit : 40,
        exclude_attribute_group: "genotype"
    }, {
        staleTime: 3000000,
        enabled : _.isString(searchString) && searchString.length >= 1
    });

    useEffect(() => {
        if (searchString.length === 0) {
            setShowDropdown(false);
        }
        else if (!showDropdown) {
            setShowDropdown(true);
        }
    }, [searchString]);

    useEffect(() => {
        if (!_.has(submissionFilter, "include_sample_ca")) {
            setSubmissionFilter(prev => ({
                ...prev,
                include_sample_ca: true
            }));
        }
    }, [submissionFilter.include_sample_ca]);

    const selectedCATags = submissionFilter.ca_tags || [];

    const handleSearchChange = (e) => {
        setSearchString(e.target.value);
    };

    const handleSelectCA = (ca_tag) => {
        const updatedCATags = addStringToArrayOrRemove({ array: submissionFilter.ca_tags || [], string: ca_tag })
        if (return_tags_only) {
            setSubmissionFilter(updatedCATags)
            return;
        }
        setSubmissionFilter(prev => ({
            ...prev,
            ca_tags: updatedCATags
        }));
        
        setSearchString("");
    };

    const handleIncludeSampleLevelChange = (e) => {
        const checked = e.target.checked;
        setSubmissionFilter(prev => ({
            ...prev,
            include_sample_ca: checked
        }));
    };

   

    return (
        <div style={{ width: "100%", paddingRight: "0.1rem"}}>
            <h4>Condition Applications</h4>
            
            <Popover
                fill
                isOpen={showDropdown}
                onClose={() => setShowDropdown(false)}
                content={
                    <div style={{ minWidth: "700px", maxHeight: "50vh", overflowY: "auto" }}>

                        {_.isArray(allCAs) ? allCAs.map(cahierachy => <CAHItem key={cahierachy.tag} cahierarchy={cahierachy} onSelect={handleSelectCA} />) : null}
                    </div>
                }
                minimal
                matchTargetWidth={false}
                placement="bottom-start"
                enforceFocus={false}
                autoFocus={false}
                canEscapeKeyClose={true}
                
            >
                <div style={{ position: "relative", width: "100%" }}>
                <input 
                    style={{width: "100%"}}
                    value={searchString}
                    className="text-input"
                    placeholder="Search conditions..."
                    
                    onChange={handleSearchChange}
                />
                {isLoading && (
                <div style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    height: "2px",
                    width: "100%",
                    background: "linear-gradient(90deg, transparent, #4a90d9, transparent)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.2s infinite"
                }} />
                    )}
                    </div>
            </Popover>

            <div className="font-size--smallest" style={{ marginTop: "0.25rem" }}>
                {infoText}
            </div>

            {showIncludeSampleLevelOption && (
                <div style={{ marginTop: "0.5rem" }}>
                    <Checkbox
                        checked={_.has(submissionFilter, "include_sample_ca") ? submissionFilter.include_sample_ca : false}
                        onChange={handleIncludeSampleLevelChange}
                        label="Include sample-level condition applications"
                    />
                </div>
            )}

            {/* Full CA display */}
            {selectedCATags.length > 0 && (
                <div className="flex flex-column" style={{ marginTop: "0.5rem", gap: "0.1rem" }}>
                    {selectedCATags.map(tag => (
                        <CADisplay key={tag} tag={tag} onRemove={() => handleSelectCA(tag)} />
                    ))}
                </div>
            )}
        </div>
    );
}

function CADisplay({ tag, onRemove }) {
    return (
        <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            padding: "0.5rem",
            marginBottom: "0.5rem",
            backgroundColor: "#f5f5f5",
            borderRadius: "3px"
        }}>
            <div style={{ flex: 1 }}>
                <ConditionApplicationsView 
                    tag={tag} 
                    show_attribute={false}
                />
            </div>
            <button
                onClick={onRemove}
                style={{
                    top: "0.5rem",
                    right: "0.5rem",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1.5rem",
                    color: "#666",
                    padding: "0 0.5rem"
                }}
            >
                ×
            </button>
        </div>
    );
}
