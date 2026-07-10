import { Select } from "@blueprintjs/select"
import { useState } from "react"
import useDebounce from "../../../../hooks/useDebounce"
import _ from "lodash"
import { api } from "@/api"
import { GenotypeMenuItem } from "../../../submission/new/sample_attributes/select/menu/GenotypeMenu"




export function GenotypeInput({
        selectedGenotypes = [],
        attribute = { tag: "att_genotype" },
        onItemSelect,
        disabled = false,
        usedInSubmissionOnly = false   
}) {
    const [queryString, setQueryString] = useState("")
    const debouncedString = useDebounce(queryString, 200)
    const { data: items, isLoading, isFetching } = api.genotypes.queryGenotypes.useGetGenotypesBySearchString(
        { search_string: debouncedString, used_in_submission: usedInSubmissionOnly },  
        { staleTime: 6000 }
    )

    
    const renderFeature = (item, { handleClick, handleFocus, index, modifiers, query }) => {
        return <GenotypeMenuItem 
            genotype_tag={item}
            handleClick={handleClick}
            handleFocus={handleFocus}
            index={index}
            modifiers={modifiers}
            selected={selectedGenotypes.includes(item)}
        />
    }
    /**
     * @description Handles the item selection 
     * @param {Object} item 
     */
    const handleItemSelection = (item, e) => {
        if (_.isFunction(e.stopPropagation)) {
            e.stopPropagation()
        }
        onItemSelect(attribute, item)
        setQueryString("")
    }


    
    return (

            <Select
                minimal
                filterable={false}
                menuProps={{ style: { minWidth: "700px", maxHeight: "50vh" } }}
                disabled={disabled}
                items={_.isArray(items) ? items : []}
                itemRenderer={renderFeature}
                onItemSelect={handleItemSelection}
            >

                <input
                    className="search-input"
                    type="text"
                    placeholder="Search for genotypes ..."
                    value={queryString}
                    onChange={(e) => setQueryString(e.target.value)}
                />

            </Select>
    )
}
