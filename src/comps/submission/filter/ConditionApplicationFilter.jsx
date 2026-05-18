import { useState } from "react";
import _ from "lodash";
import { MultiSelect } from "@blueprintjs/select";
import { Button } from "@blueprintjs/core";
import { addItemToArrayOrRemoveItIfPresent } from "../../../services/arrays/transforms";
import { api } from "@/api";
import useDebounce from "../../../hooks/useDebounce";
import { AttributeWithTraitsMenuItem } from "../../core/input/api/DatasetAttributeInput";
import { DatasetAttributeView } from "../../core/base/attributes/DatasetAttributeView";

export function ConditionApplicationFilter({ setSubmissionFilter, submissionFilter }) {
    const [searchString, setSearchString] = useState("");
    const [itemsLoaded, setItemsLoaded] = useState(false);
    const debouncedSearchString = useDebounce(searchString, 300);

    const { data: queried_attributes, isLoading, isFetching } = api.attributes.queryAttributes.useGetAttributesByQuery({
        search_string: debouncedSearchString,
        attribute_groups: 'dataset',
        include_traits: true,
        limit: 100
    }, { 
        staleTime: 300000,
        enabled: itemsLoaded,
        placeholderData: (prev) => prev
    });

    const checkValues = () => {
        if (!itemsLoaded) {
            setItemsLoaded(true);
        }
    };

    // Convert submissionFilter to the format expected by DatasetAttributeView
    const attributeTraits = _.isArray(submissionFilter.attribute_tag) 
        ? submissionFilter.attribute_tag.map(attr => {
            // Group traits by attribute
            const attributeTraits = (submissionFilter.trait_tag || []).filter(t => {
                // You may need to track which trait belongs to which attribute
                // For now, include all
                return true;
            });
            
            return {
                type: "attribute",
                tag: attr.tag,
                id: attr.tag,
                children: attributeTraits.map(trait => ({
                    type: "trait",
                    tag: trait.tag,
                    id: trait.tag
                }))
            };
        })
        : [];

    // Get selected trait tags for highlighting in the menu
    const selectedTraitTags = _.isArray(submissionFilter.trait_tag) 
        ? submissionFilter.trait_tag.map(t => t.tag) 
        : [];

    // This is the handler that matches what TraitMenuItem expects
    const handleTraitSelection = (path) => {
        console.log("handleTraitSelection called with path:", path);
        
        // path is an array like [{type: "attribute", tag: "att_gene_expression_alteration"}, {type: "trait", tag: "KD"}]
        if (!_.isArray(path) || path.length === 0) return;
        
        const attributeItem = path.find(p => p.type === "attribute");
        const traitItem = path.find(p => p.type === "trait");
        
        if (!attributeItem || !traitItem) return;

        // Handle attribute selection
        const newAttributeArray = addItemToArrayOrRemoveItIfPresent({
            array: submissionFilter.attribute_tag || [],
            item: { tag: attributeItem.tag }
        });

        // Handle trait selection
        const newTraitArray = addItemToArrayOrRemoveItIfPresent({
            array: submissionFilter.trait_tag || [],
            item: { tag: traitItem.tag }
        });

        console.log("New filters:", { attribute_tag: newAttributeArray, trait_tag: newTraitArray });

        setSubmissionFilter(prevValues => ({ 
            ...prevValues, 
            attribute_tag: newAttributeArray,
            trait_tag: newTraitArray
        }));
    };

    const handleTraitRemove = (path) => {
        console.log("handleTraitRemove called with path:", path);
        const lastItem = _.last(path);
        
        if (lastItem.type === "trait") {
            const newTraitArray = (submissionFilter.trait_tag || []).filter(t => t.tag !== lastItem.tag);
            
            // Check if this was the last trait for its attribute
            const attributeTag = lastItem.tag.split(":")[0];
            const remainingTraitsForAttribute = newTraitArray.filter(t => t.tag.startsWith(attributeTag + ":"));
            
            let newAttributeArray = submissionFilter.attribute_tag || [];
            if (remainingTraitsForAttribute.length === 0) {
                // Remove the attribute if no traits remain
                newAttributeArray = newAttributeArray.filter(a => a.tag !== attributeTag);
            }
            
            setSubmissionFilter(prevValues => ({ 
                ...prevValues, 
                trait_tag: newTraitArray,
                attribute_tag: newAttributeArray
            }));
        } else if (lastItem.type === "attribute") {
            // Remove attribute and all its traits
            const newAttributeArray = (submissionFilter.attribute_tag || []).filter(a => a.tag !== lastItem.tag);
            const newTraitArray = (submissionFilter.trait_tag || []).filter(t => !t.tag.startsWith(lastItem.tag + ":"));
            
            setSubmissionFilter(prevValues => ({ 
                ...prevValues, 
                attribute_tag: newAttributeArray,
                trait_tag: newTraitArray
            }));
        }
    };

    const getSelectionByPath = (path) => {
        return [];
    };

    const renderAttributes = ({ items, query }) => {
        if (query.length > 0 && _.isArray(queried_attributes) && queried_attributes.length === 0) {
            return <div className="padding--medium"><p>No attributes/traits match the search string...</p></div>
        }

        return (
            <div className="padding--medium" style={{ minWidth: "40vw", maxHeight: "400px", overflowY: "scroll", maxWidth: "80vh", backgroundColor: "#efefef" }}>
                {items.map(attributeWithTraits => (
                    <AttributeWithTraitsMenuItem
                        key={attributeWithTraits.attribute_tag}
                        tag={attributeWithTraits.attribute_tag}
                        trait_tags={attributeWithTraits.trait_tags}
                        selected_traits={selectedTraitTags}
                        handleTraitSelection={handleTraitSelection}
                        isMissing={false}
                    />
                ))}
            </div>
        );
    };

        // ConditionApplicationFilter.jsx - Update the return statement
        return (
            <div style={{ width: "100%", paddingRight: "0.1rem" }}>
                <h4>Attributes</h4>
                <MultiSelect
                    items={itemsLoaded && _.isArray(queried_attributes) ? queried_attributes : []}
                    placeholder="Search..."
                    itemListRenderer={renderAttributes}
                    resetOnSelect={true}
                    resetOnQuery={true}
                    onQueryChange={(searchString) => setSearchString(searchString)}
                    popoverProps={{ minimal: true, matchTargetWidth: true }}
                    tagInputProps={{
                        rightElement: <Button icon="blank" minimal={true} loading={isLoading || isFetching} intent="primary" />,
                        inputProps: { intent: "primary", onFocus: checkValues },
                        tagProps: { minimal: true }
                    }}
                    selectedItems={[]}
                    tagRenderer={() => null}
                />
                
                {/* Description text right below search bar */}
                <div className="font-size--smallest" style={{ marginTop: "0.25rem" }}>
                    Datasets with the selected attributes will be displayed.
                </div>

                {/* Show selected attributes and traits */}
                {attributeTraits.length > 0 && (
                    <div style={{ marginTop: "0.5rem" }}>
                        <DatasetAttributeView
                            attributeTraits={attributeTraits}
                            handleTraitRemove={handleTraitRemove}
                            getSelectionByPath={getSelectionByPath}
                            onChildrenSelection={handleTraitSelection}
                        />
                    </div>
                )}
            </div>
        );
}