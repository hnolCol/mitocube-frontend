
import { useState, useEffect } from "react";
import { Omnibar } from "@blueprintjs/select";
import useDebounce from "../../../hooks/useDebounce";
import _ from "lodash"

import "./OmnibarStyles.css"
import Loading from "../../core/base/loading";
import { ProteinMenuItem } from "../../core/input/items/FeatureMenu";
import { api } from "@/api";
import { MenuItem } from "@blueprintjs/core";
import { TraitMenuItem } from "@/comps/core/input/items/AttributeValueMenu";
import { addStringToArrayOrRemove } from "@/services/arrays/transforms";
import { HIGHLIGHT_COLOR } from "@mitocube/viz/src/colors/palette";

export function ProteomeSelection({attribute_tag = "att_proteome", onChange, selected_traits}) {
    const { data : traits, isLoading, isFetching} = api.traits.queryTraits.useGetTraitsByAttributeTag({tag : attribute_tag}, {enabled : _.isString(attribute_tag) && attribute_tag.length > 0, staleTime : 600000})
    return <MenuItem
        autoFocus={false}
        shouldDismissPopover={false}
        style={selected_traits.length > 0 ? { color: HIGHLIGHT_COLOR, fontWeight: 600 } : {}}
        text={selected_traits.length > 0 ? `Proteomes selected: ${selected_traits.length}` : "Proteome selection"}
        labelElement={isLoading || isFetching ? <Loading /> : <div style={{ fontSize: "0.7em", fontStyle: "italic", maxWidth: "15rem" }}>Select proteomes to include in the search. All are included by default.</div>} >
        {_.isArray(traits) ? traits.map(trait_tag => <TraitMenuItem key={trait_tag} attribute_tag={attribute_tag} tag={trait_tag} showDescription={false} selected={selected_traits.includes(trait_tag)} onClick={onChange}/>) : null}
    </MenuItem>
}


export function OmnibarSearch(props) {
    // handle search for proteins in the protein centric view.
    const { isOpen, onClose, onSelect, proteomeTags, setProteomeTags } = props
    
    const [searchString, setSearchString] = useState("")
    const debounceSearchString = useDebounce(searchString, 400)

    const { data: features, isLoading, isSuccess, isError, isFetching } = api.features.proteinsQuery.useGetProteinFeatureByQuery({
            search_string:
            debounceSearchString,
            limit: 50,
            proteome_tags: _.isArray(proteomeTags) && proteomeTags.length > 0 ? _.join(proteomeTags, ";") : undefined
    }, { staleTime: 5 * 60 * 10000 })
 
    const proteomeItem = ["proteome_selection"]

    useEffect(() => {setSearchString("")},[isOpen])

    /**
     * 
     * @param {import("../../../types/feature").Feature} feature 
     */
    const onFeatureSelect = (feature_tag, event) => {

        let featureURL = `/protein/${feature_tag}`
        onSelect({feature_tag, text: feature_tag, to : featureURL })
    } 

    const onProteomeSelect = (selection) => {
        const selected_tag = selection[1].tag
        setProteomeTags(addStringToArrayOrRemove({array : proteomeTags, string : selected_tag}))
    }

    /**
     * @param {import("../../../types/feature").Feature} item 
     * @param {Object} params 
     * @param {Function} params.handleClick  
     * @param {String} params.query 
     * @returns 
     */
    const renderItem = (item, { handleClick, modifiers, query, index }) => {
        
        if (item === "proteome_selection") {
            return <ProteomeSelection attribute_tag="att_proteome" onChange={onProteomeSelect} selected_traits={proteomeTags} />
        }
        if (!modifiers.matchesPredicate) {
              return null;
            }
        
        if ((isLoading || isFetching) && index === 1) {
            return <div><Loading/></div>
        }
        return (
            <ProteinMenuItem key={item} {...{tag : item, onClick : handleClick, active : modifiers.active}} />
        )
    }
    return (

        <Omnibar
            itemRenderer={renderItem}
            query={searchString}
            resetOnSelect={true}
            onItemSelect={onFeatureSelect}
            initialContent={<ProteomeSelection  attribute_tag="att_proteome" onChange={onProteomeSelect} selected_traits={proteomeTags} />}
            onQueryChange={query => setSearchString(query)}
            // inputProps={{ placeholder: isFetching || isLoading ? "Fetching ..." :isError ? 'An error occured fetching the feature list.' : _.isArray(features) && features.length===0?'No feature items available. API is loading or filtering excluded all features.':`Search in for protein name, gene name or uniprot id.`}}
            {...{
                isOpen,
                onClose,
                items: _.isArray(features) ? _.concat(proteomeItem, features) : proteomeItem
            }} />
    )

}


