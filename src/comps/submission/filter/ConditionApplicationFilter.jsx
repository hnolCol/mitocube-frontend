import { useState } from "react";
import _ from "lodash";
import { MultiSelect } from "@blueprintjs/select";
import { Button } from "@blueprintjs/core";
import { addItemToArrayOrRemoveItIfPresent } from "../../../services/arrays/transforms";
import { api } from "@/api";
import useDebounce from "../../../hooks/useDebounce";
import { Checkbox } from "@blueprintjs/core";
import { AttributeWithTraitsMenuItem } from "../../core/input/api/DatasetAttributeInput";
import { DatasetAttributeView } from "../../core/base/attributes/DatasetAttributeView";

export function ConditionApplicationFilter({ setSubmissionFilter, submissionFilter }) {
    const [searchString, setSearchString] = useState("");
    const [itemsLoaded, setItemsLoaded] = useState(false);
    const [includeSampleLevel, setIncludeSampleLevel] = useState(false);
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

    const attributeTraits = _.isArray(submissionFilter.attribute_tag) 
        ? submissionFilter.attribute_tag.map(attr => {
            // Group traits by attribute
            const attributeTraits = (submissionFilter.trait_tag || []).filter(t => {
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

    const selectedTraitTags = _.isArray(submissionFilter.trait_tag) 
        ? submissionFilter.trait_tag.map(t => t.tag) 
        : [];

        const handleTraitSelection = (path) => {
            console.log("handleTraitSelection called with path:", path);
            
           
            if (!_.isArray(path) || path.length === 0) return;
            

            const attributeItem = _.findLast(path, p => p.type === "attribute");
            const traitItem = _.findLast(path, p => p.type === "trait");
            
            if (!attributeItem || !traitItem) return;
        
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
            
        
            const attributeTag = lastItem.tag.split(":")[0];
            const remainingTraitsForAttribute = newTraitArray.filter(t => t.tag.startsWith(attributeTag + ":"));
            
            let newAttributeArray = submissionFilter.attribute_tag || [];
            if (remainingTraitsForAttribute.length === 0) {
                newAttributeArray = newAttributeArray.filter(a => a.tag !== attributeTag);
            }
            
            setSubmissionFilter(prevValues => ({ 
                ...prevValues, 
                trait_tag: newTraitArray,
                attribute_tag: newAttributeArray
            }));
        } else if (lastItem.type === "attribute") {
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
    const handleIncludeSampleLevelChange = (e) => {
        const checked = e.target.checked;
        setIncludeSampleLevel(checked);
        setSubmissionFilter(prevValues => {
            return {
                ...prevValues,
                "include_sample_ca": checked
            };
        });
        console.log("New submission filter:", newFilter);
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
                
                
                <div className="font-size--smallest" style={{ marginTop: "0.25rem" }}>
                    Datasets with the selected attributes will be displayed.
                </div>
                <div style={{ marginTop: "0.5rem" }}>
                    <Checkbox
                        checked={includeSampleLevel}
                        onChange={handleIncludeSampleLevelChange}
                        label="Include sample-level attributes (e.g. sample treatment conditions)"
                    />
                </div>

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