



import PropTypes from "prop-types"
import { MultiSelect } from "@blueprintjs/select";
import _ from "lodash"
import { useState } from "react";
import { Button } from "@blueprintjs/core";
import "./style.css"
import useDebounce from "../../../../hooks/useDebounce";
import { TraitMenuItem } from "../items/AttributeValueMenu";
import TextInput from "../Text";

import { api } from "@/api";
import { HIGHLIGHT_COLOR } from "../../colors/colorPalette";

/**
 * 
 * @param {Object} props 
 * @param {String} props.tag The attribute tag 
 * @param {String[]} props.trait_tags - List of trait tags 
 * @param {String[]} props.selected_traits - List of traits that should be marked as selected.
 * @param {Function} props.handleTraitSelection Handle the selection of a trait.
 * @returns 
 */
export function AttributeWithTraitsMenuItem({ tag, trait_tags, handleTraitSelection, selected_traits, isMissing = false, trait_paths = undefined, parent_tags = undefined }) {
    const { data: attribute, isSuccess } = api.attributes.queryAttributes.useGetAttribute({ tag }, { enabled: _.isArray(trait_tags) || isMissing, staleTime : 60000 })
    
    const { data: fetchedTraitTags } = api.traits.queryTraits.useGetTraitsByAttributeTag(
        { tag, limit : 10 },
        { enabled: isMissing && (!_.isArray(trait_tags) || trait_tags.length === 0) }
    )

    const effectiveTraitTags = _.isArray(trait_tags) && trait_tags.length > 0 ? trait_tags : (fetchedTraitTags || [])

    const [pendingTraitTag, setPendingTraitTag] = useState(undefined)
    const [chosenParentSteps, setChosenParentSteps] = useState([])
    const [parentSearchString, setParentSearchString] = useState("")
    const debouncedParentSearchString = useDebounce(parentSearchString, 200)

    const currentParentTag = _.isArray(parent_tags) ? parent_tags[chosenParentSteps.length] : undefined
    const { data: currentParentTraitTags } = api.traits.queryTraits.useGetTraitsByAttributeTag(
        { tag: currentParentTag, limit: 50 },
        { enabled: _.isString(currentParentTag) && _.isString(pendingTraitTag) && debouncedParentSearchString.length === 0 }
    )
    const { data: searchedParentTraitTags } = api.traits.queryTraits.useGetTraitBySearchString(
        { search_string: debouncedParentSearchString, attribute_tag: currentParentTag, limit: 50 },
        { enabled: _.isString(currentParentTag) && _.isString(pendingTraitTag) && debouncedParentSearchString.length > 0 }
    )
    const effectiveParentTraitTags = debouncedParentSearchString.length > 0 ? (searchedParentTraitTags || []) : (currentParentTraitTags || [])
    const { data: currentParentAttribute } = api.attributes.queryAttributes.useGetAttribute(
        { tag: currentParentTag },
        { enabled: _.isString(currentParentTag) && _.isString(pendingTraitTag), staleTime: 60000 }
    )

    const resetPendingSelection = () => {
        setPendingTraitTag(undefined)
        setChosenParentSteps([])
        setParentSearchString("")
    }

    const handleTraitClick = (path) => {
        const trait_tag = _.last(path).tag
        if (_.isArray(trait_paths?.[trait_tag])) {
            handleTraitSelection(path)
            return
        }
        if (_.isArray(parent_tags) && parent_tags.length > 0) {
            setPendingTraitTag(trait_tag)
            setChosenParentSteps([])
            return
        }
        handleTraitSelection(path)
    }

    const handleParentTraitPick = (path) => {
        const parent_trait_tag = _.last(path).tag
        const steps = [...chosenParentSteps, { attribute_tag: currentParentTag, trait_tag: parent_trait_tag }]
        setParentSearchString("")
        if (steps.length < parent_tags.length) {
            setChosenParentSteps(steps)
            return
        }
        const fullPath = steps.flatMap(step => ([{ "type": "attribute", "tag": step.attribute_tag }, { "type": "trait", "tag": step.trait_tag }]))
        fullPath.push({ "type": "attribute", "tag": tag }, { "type": "trait", "tag": pendingTraitTag })
        handleTraitSelection(fullPath)
        resetPendingSelection()
    }

    if (_.isString(pendingTraitTag)) {
        return <div style={{ backgroundColor: "#f0f4f8", borderRadius: "3px" }}>
            <div className="menu_item_header">
                <span style={{ color: HIGHLIGHT_COLOR }}>Select parent first</span>
            </div>
            <PendingTraitContext trait_tag={pendingTraitTag} attribute_tag={tag} step={chosenParentSteps.length + 1} total={_.isArray(parent_tags) ? parent_tags.length : 1} />
            <div className="padding--tiny">
                <TextInput
                    callbackKey="parent-trait-search"
                    value={parentSearchString}
                    placeholder="Search parent trait ..."
                    onChange={(key, value, type) => setParentSearchString(value)}
                />
            </div>
            <div className="menu_item_header">
                <span style={{ color: HIGHLIGHT_COLOR }}>{currentParentAttribute?.text ?? currentParentTag}</span>
            </div>
            {_.isArray(effectiveParentTraitTags) ? effectiveParentTraitTags.map(parent_trait_tag => {
                return <TraitMenuItem
                    key={parent_trait_tag}
                    tag={parent_trait_tag}
                    attribute_tag={currentParentTag}
                    onClick={handleParentTraitPick}
                    selected={_.some(chosenParentSteps, { trait_tag: parent_trait_tag })}
                />
            }) : <div className="padding--tiny">Loading traits ...</div>}
            <button className="menu_item" onClick={resetPendingSelection}>Cancel</button>
        </div>
    }

    return <div>
        {isSuccess ? <div className="menu_item_header">
            <span style={{color : HIGHLIGHT_COLOR}}>{attribute.text}</span>{isMissing ? <span style={{ color: "red" }}> *</span> : null}
        </div> : null}
        {_.isArray(effectiveTraitTags) ? effectiveTraitTags.map(trait_tag => {
            return <TraitMenuItem key={trait_tag} tag={trait_tag} attribute_tag={tag} onClick={handleTraitClick} selected={_.isArray(selected_traits) && selected_traits.includes(trait_tag)} trait_path={trait_paths?.[trait_tag]} />
        }) : null}
    </div>
}

AttributeWithTraitsMenuItem.propTypes = {
    tag: PropTypes.string.isRequired,
    trait_tags: PropTypes.arrayOf(PropTypes.string),
    handleTraitSelection: PropTypes.func,
    selected_traits: PropTypes.arrayOf(PropTypes.string),
    isMissing: PropTypes.bool,
    trait_paths: PropTypes.object,
    parent_tags: PropTypes.arrayOf(PropTypes.string),
}

function PendingTraitContext({ trait_tag, attribute_tag, step, total }) {
    const { data: trait } = api.traits.queryTraits.useGetTraitByTag({ tag: trait_tag }, { enabled: _.isString(trait_tag), staleTime: Infinity })
    const { data: attribute } = api.attributes.queryAttributes.useGetAttribute({ tag: attribute_tag }, { enabled: _.isString(attribute_tag), staleTime: 60000 })

    return <div className="padding--tiny" style={{ fontSize: "0.75rem", color: "#666" }}>
        <span>Selecting: <strong>{trait?.text ?? trait_tag}</strong>{attribute?.text ? ` (${attribute.text})` : null}</span>
        {total > 1 ? <span> — parent {step} of {total}</span> : null}
    </div>
}

PendingTraitContext.propTypes = {
    trait_tag: PropTypes.string.isRequired,
    attribute_tag: PropTypes.string.isRequired,
    step: PropTypes.number,
    total: PropTypes.number,
}

AttributesInput.propTypes = {
    // selected_traits :   PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
    min_state: PropTypes.number,
    min_search_string_length: PropTypes.number,
    showSelection: PropTypes.bool,
    matchTargetWidth: PropTypes.bool,
    placeHolderText: PropTypes.string,
    handleTraitSelection: PropTypes.func,
    selected_traits: PropTypes.arrayOf(PropTypes.string),
    submission_tag: PropTypes.string,
    checkMandatoryAttributes: PropTypes.bool,
    disabled: PropTypes.bool,
    attribute_tags: PropTypes.arrayOf(PropTypes.string),
}


/**
 * @description Select dataset attributes using the API backend for searching through the attributes and traits. 
 * @param {Object} props 
 * @param {import("../../../../types/attributes").AttributeValue[]} props.selectedItems 
 * @param {Number} props.min_state - The submission state for which dataset attributes should be selected. 
 * @param {Number} props.min_search_string_length - The minimum search string length before the API request ist made. 
 * @param {Boolean} props.matchTargetWidth  - If the menu item width should match the Input widget. 
 * @param {String} props.placeHolderText - The text to be displayed as a hint for the user.
 * @param {Function} props.onItemSelect - Should take two props (attribute, trait)
 * @param {String[]} props.attribute_tags - If you want to limit the selection to specific attributes, pass them here.
 * @param {String[]} props.selected_traits - The selected traits. This is used to mark the selected traits in the menu.
 * @param {String} props.submission_tag - The submission tag for which the mandatory attributes should be checked. 
 * @param {Boolean} props.checkMandatoryAttributes - If the mandatory attributes should be checked. Default is true.
 * @param {Boolean} props.disabled - If the input should be disabled. Default is false.
 * @returns {JSX.Element} The rendered AttributesInput component.
 */
export function AttributesInput({
        min_state = 5,
        min_search_string_length = 0, //set to 0 if you want to search without any string... (E.g. getting all)
        handleTraitSelection,
        showSelection = true, 
        matchTargetWidth = true,
        placeHolderText = "Search dataset attribute (HEK, HeLa, Heart, Muscle, ...)",
        selected_traits = [],
    submission_tag,
    checkMandatoryAttributes = true,
    disabled = false,
    attribute_tags = undefined
}) {
 
    const { data: mandatoryCheck } = api.submissions.core.useCheckSubmission(
        { tag: submission_tag },
        { enabled: _.isString(submission_tag) && checkMandatoryAttributes }
    )
    const [searchString, setSearchString] = useState("")
    const debouncedSearchString = useDebounce(searchString,200)
    const [itemsLoaded, setItemsLoaded] = useState(false)
    const { data: queried_attributes, isLoading, isFetching } = api.attributes.queryAttributes.useGetAttributesByQuery(
        {
            search_string: debouncedSearchString,
            limit: 50,
            include_traits: true,
            include_parent_paths: true,
            min_state: min_state,
            attribute_tags : _.join(attribute_tags, ";"),
        }, {
            enabled: debouncedSearchString.length >= min_search_string_length,
            staleTime: 300000,
            placeholderData: (prev) => prev
    })
    /**
     * 
     * @param {MouseEvent} e 
     */
    const checkValues = (e) => {
        if (!itemsLoaded) {
            setItemsLoaded(true)
        }
        
    }
    /**
     * 
     * @param {Object} props 
     * @param {import("../../../../types/attributes").Attribute} props.activeItem+
     * @param {import("../../../../types/attributes").Attribute[]} props.items  
     * @param {import("../../../../types/attributes").Attribute[]} props.filteredItems
     * @returns 
     */
    const renderAttributes = ({ activeItem, items, query, filteredItems }) => {
        if (query.length > 0 && _.isArray(queried_attributes) && queried_attributes.length === 0) return <div><p>No attributes/traits match the search string ...</p></div>
        if (!itemsLoaded || items.length === 0) return <div className="padding--medium"><p>Start typing...</p></div>
    
        const missingTags = checkMandatoryAttributes ? mandatoryCheck?.missing?.map(m => m.tag) || [] : []

        const sortedItems = [...items].sort((a, b) => {
            if (missingTags.length === 0) return 0
            const aIsMissing = missingTags.includes(a.attribute_tag)
            const bIsMissing = missingTags.includes(b.attribute_tag)
            if (aIsMissing && !bIsMissing) return -1
            if (!aIsMissing && bIsMissing) return 1
            return 0
        })
        return <div className="padding--medium" style={{ minWidth: "40vw", maxHeight: "400px", overflowY: "scroll"}}>
            {sortedItems.map(attributeWithTraits => (
                <AttributeWithTraitsMenuItem
                    key={attributeWithTraits.attribute_tag}
                    tag={attributeWithTraits.attribute_tag}
                    trait_tags={attributeWithTraits.trait_tags}
                    trait_paths={attributeWithTraits.trait_paths}
                    parent_tags={attributeWithTraits.parent_tags}
                    selected_traits={selected_traits}
                    handleTraitSelection={handleTraitSelection}
                    isMissing={missingTags.includes(attributeWithTraits.attribute_tag)}
                />
            ))}
        </div>
    }

    const renderValue = (item) => {
        if (showSelection) return item.text
        
    }
    
    return (
   
        <MultiSelect
            disabled={disabled}
            items={debouncedSearchString.length >= min_search_string_length && _.isArray(queried_attributes) ? queried_attributes : []}
            placeholder={placeHolderText}
            tagRenderer={renderValue}
            //onItemSelect={handleItemSelection}
            itemListRenderer={renderAttributes}
            resetOnSelect={true}
            resetOnQuery={true}
            onQueryChange={(searchString => setSearchString(searchString))}
           // onRemove={handleItemSelection}
            popoverProps={{minimal : true, matchTargetWidth}}
            tagInputProps={{
                rightElement : <Button icon="blank" minimal={true} loading={isLoading || isFetching} intent="primary" />,
                inputProps: { intent: "primary", onFocus : checkValues},
                tagProps: { minimal: true }
            }}
            selectedItems={_.keys(selected_traits)}
            />
    )
}