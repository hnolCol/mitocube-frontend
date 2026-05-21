import { useState, useMemo } from "react";
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
export function ConditionApplicationFilter({ setSubmissionFilter, submissionFilter }) {
    const [searchString, setSearchString] = useState("");
    const [includeSampleLevel, setIncludeSampleLevel] = useState(submissionFilter.include_sample_ca || false);

    const { data: allCAs, isLoading, error } = api.condition_applications.useGetConditionApplicationHierarchyByQuery({
        search_string : searchString,
        limit : 50
    }, {
        staleTime: 300000,
        enabled : _.isString(searchString) && searchString.length >= 1
    });

    console.log(allCAs)
    const filteredCAs = useMemo(() => {
        if (!allCAs || !searchString || searchString.length < 2) return [];
        
        const lowerSearch = searchString.toLowerCase();
        const matching = allCAs.filter(ca => {
            const traitSearch = ca.trait_search || "";
            const attributeSearch = ca.attribute_search || "";
            return traitSearch.toLowerCase().includes(lowerSearch) || 
                   attributeSearch.toLowerCase().includes(lowerSearch);
        });
        
        const deduped = {};
        matching.forEach(ca => {
            if (!deduped[ca.trait_tag]) {
                deduped[ca.trait_tag] = {
                    ...ca,
                    frequency: ca.frequency
                };
            } else {
                deduped[ca.trait_tag].frequency += ca.frequency;
            }
        });
        
        return Object.values(deduped).sort((a, b) => b.frequency - a.frequency);
    }, [allCAs, searchString]);
    console.log(submissionFilter)
    const selectedCATags = submissionFilter.ca_tags || [];

    const handleSearchChange = (e) => {
        setSearchString(e.target.value);
    };

    const handleSelectCA = (ca_tag) => {
        const updatedCATags = addStringToArrayOrRemove({ array: submissionFilter.ca_tags || [], string: ca_tag})
        console.log("updatedCATags", updatedCATags)
        setSubmissionFilter(prev => ({
            ...prev,
            ca_tags: updatedCATags
        }));
        
        setSearchString("");
    };


    const handleIncludeSampleLevelChange = (e) => {
        const checked = e.target.checked;
        setIncludeSampleLevel(checked);
        setSubmissionFilter(prev => ({
            ...prev,
            include_sample_ca: checked
        }));
    };

    const showDropdown = searchString.length >= 2 

    return (
        <div style={{ width: "100%", paddingRight: "0.1rem" }}>
            <h4>Condition Applications</h4>
            
            <Popover
                isOpen={showDropdown}
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
            >
                <InputGroup
                    leftIcon="search"
                    placeholder="Search..."
                    value={searchString}
                    onChange={handleSearchChange}
                    rightElement={isLoading ? <Button icon="blank" minimal loading /> : null}
                />
            </Popover>

            <div className="font-size--smallest" style={{ marginTop: "0.25rem" }}>
                Datasets with the selected condition applications will be displayed.
            </div>

            <div style={{ marginTop: "0.5rem" }}>
                <Checkbox
                    checked={includeSampleLevel}
                    onChange={handleIncludeSampleLevelChange}
                    label="Include sample-level condition applications"
                />
            </div>

            {/* Full CA display */}
            {selectedCATags.length > 0 && (
                <div style={{ marginTop: "0.5rem" }}>
                    {selectedCATags.map(tag => (
                        <CADisplay key={tag} tag={tag} onRemove={() => handleSelectCA(tag)} />
                    ))}
                </div>
            )}
        </div>
    );
}

function CADisplay({ tag, onRemove }) {
    console.log(tag)
    return (
        <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            marginBottom: "0.5rem",
            position: "relative"
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
                    position: "absolute",
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