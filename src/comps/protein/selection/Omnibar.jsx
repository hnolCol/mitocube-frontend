
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

export function OmnibarSearch(props) {
    // handle search for proteins in the protein centric view.
    const { isOpen, onClose, token, filter, onSelect} = props
    const [featureDeatails, setFeatureDetails] = useState({items : [], featureLabels : {}, itemsToShow : [], searchString : "", sortBy : ""})
    const debounceSearchString = useDebounce(featureDeatails.searchString, 400)

    const {data : features, isLoading, isSuccess, isError, isFetching} = useGetFeatureByQuery({query : debounceSearchString, proteome_id : "UP000005640"},{enabled : _.isString(debounceSearchString) && debounceSearchString.length > 0})

    // useEffect(() => { 
    //     if (isLoading) return
    //     if (isFetching) return
    //     if (isError) return
    //     if (data === undefined) return
       
    // },
    //     [debounceSearchString,data, isSuccess, isLoading])
    
    console.log(isError)

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
            <OmnibarItem
                key={item.key}
                item={item}
                handleClose={onClose}
                onSelect={onSelect}
                />
               
            );
          }
    return (

        <Omnibar
            itemRenderer={renderItem}
            query={featureDeatails.searchString}
            resetOnSelect={true}
            onQueryChange={setSearchString}
            inputProps={{ placeholder: isFetching || isLoading ? "Fetching ..." :isError ? 'An error occured fetching the feature list.' : _.isArray(features) && features.length===0?'No feature items available. API is loading or filtering excluded all features.':`Search in for protein name, gene name or uniprot id.`}}
            {...{ isOpen, onClose, items: isLoading || isFetching ? [{}] : _.isArray(features) ? features : []}} />
    )

}


