
import axios from "axios";
import { useState, useEffect } from "react";
import { Omnibar } from "@blueprintjs/select";
import { useQuery } from "react-query"
import useDebounce from "../../../hooks/useDebounce";
import { filterArrayBySearchString } from "../../../services/arrays/filter";
import { OmnibarItem } from "./OmnibarItem";
import _ from "lodash"

import "./OmnibarStyles.css"
import { useGetFeatures } from "../../../hooks/queries/feature.hooks";

export function OmnibarSearch(props) {
    // handle search for proteins in the protein centric view.
    const { isOpen, onClose, token, filter, onSelect} = props
    const [featureDeatails, setFeatureDetails] = useState({items : [], featureLabels : {}, itemsToShow : [], searchString : "", sortBy : ""})
    const debounceSearchString = useDebounce(featureDeatails.searchString, 400)

    const {data, isLoading, isSuccess, isError, isFetching} = useGetFeatures()


    useEffect(() => { 
        if (isLoading) return 
        if (isFetching) return
        if (isError) return 
        if (data === undefined) return 
        //search in all entries of an item object
        if (!_.isArray(data.features)) return 
        if (data.features.length === 0) return 
        // search for string in all available columns, search is debounced (e.g. runs only if unchanged for some ms)

        let filteredItems = filterArrayBySearchString({
            searchString: debounceSearchString,
            array: data.features.slice(),
            searchColumns: Object.keys(data.features[0])
        })
        
        if (filteredItems.length > 200) {
            // if too many items, just show the first 50.
            filteredItems = filteredItems.slice(1,50)
        }
        if (Object.keys(data.features[0]).includes(data.sortBy)) {
            filteredItems = _.sortBy(filteredItems, data.sortBy)
        }
        
        setFeatureDetails(prevValues => {
            return {
                ...prevValues,
                "itemsToShow": filteredItems,
            }
        })
    },
        [debounceSearchString,data, isSuccess, isLoading])
    
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

    const renderItem = (item, { handleClick, modifiers, query }) => {
            if (!modifiers.matchesPredicate) {
              return null;
            }
        return (
            <OmnibarItem
                key={item.Entry}
                item={item}
                handleClose={onClose}
                onSelect={onSelect}
                featureLabels={data.featureLabels} />
               
            );
          }
    return (

        <Omnibar
            itemRenderer={renderItem}
            // itemListPredicate={filterItems}
            query={featureDeatails.searchString}
            resetOnSelect={true}
            onQueryChange={setSearchString}
            inputProps={{ placeholder: isFetching || isLoading ? "Fetching ..." :isError ? 'An error occured fetching the feature list.' : _.isArray(data.features) && data.features.length===0?'No feature items available. API is loading or filtering excluded all features.':`Search in ${data.features.length} items.. (example: Yme1l1, Uniprot ID) `}}
            
            {...{ isOpen, onClose, items : featureDeatails.itemsToShow}} />
    )

}


