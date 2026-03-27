
import axios from "axios";
import { useState, useEffect } from "react";
import { Omnibar } from "@blueprintjs/select";
import { useQuery } from "react-query"
import useDebounce from "../../../hooks/useDebounce";
import { filterArrayBySearchString } from "../../../services/arrays/filter";
import { OmnibarItem } from "./OmnibarItem";
import _ from "lodash"

import "./OmnibarStyles.css"
import { useGetFeatureByQuery, useGetFeatures } from "../../../hooks/queries/feature.hooks";
import Loading from "../../core/base/loading";
import { ProteinMenuItem } from "../../core/input/items/FeatureMenu";
import hooks from "@mitocube/api-hooks";


export function OmnibarSearch(props) {
    // handle search for proteins in the protein centric view.
    const { isOpen, onClose, onSelect} = props
    const [featureDeatails, setFeatureDetails] = useState({items : [], featureLabels : {}, itemsToShow : [], searchString : "", sortBy : ""})
    const debounceSearchString = useDebounce(featureDeatails.searchString, 400)
    const { data : features, isLoading, isSuccess, isError, isFetching} = hooks.features.proteins.useGetProteinFeatureByQuery({ search_string: debounceSearchString, limit: 50 }, { staleTime: 5 * 60 * 1000 })
    // const {data : features, isLoading, isSuccess, isError, isFetching} = useGetFeatureByQuery({query : debounceSearchString},{enabled : _.isString(debounceSearchString) && debounceSearchString.length > 0})
 

    useEffect(() => {setSearchString("")},[isOpen])
    
    const setSearchString = (searchString) => {
        // sets state for search string. 
        setFeatureDetails(prevValues => {
            return {
                ...prevValues,
                "searchString": searchString,
            }
        })
    }

    /**
     * 
     * @param {import("../../../types/feature").Feature} feature 
     */
    const onFeatureSelect = (feature_tag, event) => {

        let featureURL = `/protein/${feature_tag}`
        onSelect({feature_tag, text: feature_tag, to : featureURL })
    } 

    /**
     * 
     * @param {import("../../../types/feature").Feature} item 
     * @param {Object} params 
     * @param {Function} params.handleClick  
     * @param {String} params.query 
     * @returns 
     */
    const renderItem = (item, { handleClick, modifiers, query, index }) => {
            if (!modifiers.matchesPredicate) {
              return null;
            }
        if ((isLoading || isFetching) && index === 0) {
            return <div><Loading/></div>
        }
        return (
            <ProteinMenuItem key={item} {...{tag : item, onClick : handleClick, active : modifiers.active}} />
        )
          }
    return (

        <Omnibar
            itemRenderer={renderItem}
            query={featureDeatails.searchString}
            resetOnSelect={true}
            onItemSelect={onFeatureSelect}
            onQueryChange={setSearchString}
            inputProps={{ placeholder: isFetching || isLoading ? "Fetching ..." :isError ? 'An error occured fetching the feature list.' : _.isArray(features) && features.length===0?'No feature items available. API is loading or filtering excluded all features.':`Search in for protein name, gene name or uniprot id.`}}
            {...{ isOpen, onClose, items: isLoading || isFetching ? [{}] : _.isArray(features) ? features : []}} />
    )

}


