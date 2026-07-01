import { useState } from "react";
// import { useGetPhenotypes } from "../../../../hooks/queries/phenotype.hooks";
import useDebounce from "../../../../hooks/useDebounce";
import { MultiSelect } from "@blueprintjs/select";
import { Button, MenuItem } from "@blueprintjs/core";
import _ from "lodash"
import {motion } from "framer-motion"
import { api } from "@/api";
export function PhenotypeInput({selectedItems = [], placeHolderText = "Search phenotype", debounce = 400, min_search_string_length = 0, matchTargetWidth = false , onPhenotypeSelection}) {
    
    const [query, setQuery] = useState()
    const debounceString = useDebounce(query, debounce)
    const searchStringValid = debounceString.length >= min_search_string_length

    const { data : queried_phenotypes, isLoading, isFetching } = api.phenotypes.query.useGetPhenotypes({
        query: debounceString,
        limit: 15
    }, {
            enabled : searchStringValid
        })
    
    /**
     * @description Handles the item selection 
     * @param {Object} item 
     */
    const handleItemSelection = (tag, e) => {
        if (_.isFunction(e.stopPropagation)) {
            e.stopPropagation()
        }
        
        onPhenotypeSelection(tag)
    }


    const renderPhenotype = ({ activeItem, items, query, filteredItems }) => {


        return <div className="padding--medium" style={{ minWidth: "40vw", maxHeight: "400px", overflowY: "scroll", maxWidth: "80vh", backgroundColor: "transparent", overflowX : "hidden" }}>
            
            {items.map(phenotype => <motion.button
                onClick={(e)=>handleItemSelection(phenotype.tag,e)}
                key={phenotype.tag}
                className="div--expand padding--little"
                style={{ border: "none", backgroundColor: selectedItems.includes(phenotype.tag)?"#62b58a":"#fefefe", color: "#000000", fontSize: "0.85rem" }}
                whileHover={{ backgroundColor: "#00000", color: "#ffffff" }}>
                
                <div className="flex flex-column div--expand"
                    style={{ alignItems: "flex-start", justifyContent: "flex-start", justifyItems: "flex-start",}}>
                    <div><strong>{phenotype.text} </strong></div>
                    <div className="font-size--smallest" style={{textAlign : "left"}}>{phenotype.group_text} {phenotype.description}</div>
                </div>
            </motion.button>)}

        </div>
    }
    
    /**
     * 
     * @param {Object} item 
     * @returns 
     */
    const renderValue = (item) => {
           
            return item
        }
    
    return <MultiSelect
        items={searchStringValid && _.isArray(queried_phenotypes) ? queried_phenotypes : []}
        placeholder={placeHolderText}
        tagRenderer={renderValue}
        onItemSelect={handleItemSelection}
        itemListRenderer={renderPhenotype}
        resetOnSelect={true}
        resetOnQuery={true}
        onQueryChange={(searchString => setQuery(searchString))}
        onRemove={handleItemSelection}
        popoverProps={{minimal : true, matchTargetWidth}}
        tagInputProps={{
            rightElement : <Button icon="blank" minimal={true} loading={isLoading || isFetching} intent="primary" />,
            inputProps: { intent: "primary" }, // onFocus : checkValues
            tagProps: { minimal: true }
        }}
        selectedItems={selectedItems}/>
}