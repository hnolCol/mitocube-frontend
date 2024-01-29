import { FormGroup, Menu, MenuItem, Tag, TagInput } from "@blueprintjs/core"
import { MultiSelect } from "@blueprintjs/select"
import PropTypes from "prop-types"
import _ from "lodash"
import { filterArrayBySearchStringByMultipleKeys } from "../../../../services/arrays/filter"


function FeatureInput({
    attribute,
    features,
    selectedItems = [],
    onItemSelect = undefined,
    onRemove = undefined,
    helperText = "",
    matchTargetWidth = true,
    searchNames = ["gene_name", "protein_name","uniprot_id"],
    maxItemsShown = 30,
    minimumSearchStringLength = 0,
    handleFeatureSelection = undefined,
    showLabel = true,
    inline = false,
    isRequired = true,
    placeholder = "Search feature..",
    disabled = false, ...rest }) {
    //Atribute Input

    const selectedItemsIDs = selectedItems.map(item => item.id)
    // const renderItems = ({ activeItem, filteredItems, query, ...rest}) => {
        
        
    //     return
    //     const queryLength = query.length
    //     const justNumbersString = query.replace(/[^\d.]/g, "")
    //     if (attribute.has_features_value && attributeValues.length === 0) {
    //         return <Menu>
    //             <MenuItem text="Select protein feature..."
    //                 onClick={() => {
    //                     handleFeatureSelection({ attribute })
    //                 }} />
    //         </Menu>
    //     }
    //     return <Menu>
    //         {filteredItems.length === 0 && attribute.has_numeric_input ? <MenuItem
    //             icon={queryLength ? "add" : "blank"}
    //             text={queryLength === 0 ? "Enter numeric value to create item" : `Create: ${justNumbersString}`}
    //             disabled={!queryLength || !_.isFinite(_.toNumber(justNumbersString))}
    //             onClick={() => onItemCreate(attribute,justNumbersString)}/> : null}
    //         {filteredItems.length === 0 && !attribute.has_numeric_input? <MenuItem text="No attribute values found." disabled={true} />: null}
    //         {filteredItems.map((attrValue, attrIdx) => {
    //             if (attrIdx < maxItemsShown) return <MenuItem
    //                 key={`${attrValue.id}-${attribute.tag}`}
    //                 icon={selectedItemsIDs.includes(attrValue.id)?"tick":"blank"}
    //                 selected={selectedItemsIDs.includes(attrValue.id)}
    //                 active={activeItem.id === attrValue.id}
    //                 text={attrValue.text}
    //                 onClick={() => onItemSelect(attribute, attrValue)}
    //                 labelElement={<div style={{ maxWidth: "24rem", textAlign : "right" }}>{attrValue.description}</div>} />
                
    //             if (attrIdx === maxItemsShown) return <MenuItem key={`items-not-show${attribute.id}`} text="Not all items shown ..." disabled={true} />

    //             return null
                        
    //         })}
            

    //     </Menu>
    // }
    /**
     * 
     * @param {import("../../../../types/feature").Feature} item 
     * @param {*} param1 
     */
    const renderFeature = (item, {handleClick, handleFocus, index, modifiers, query}) => {
        return <MenuItem key={item.key} text={item.genes} onClick={handleClick} onFocus={handleFocus} active={modifiers.active}
        labelElement={<div style={{ maxWidth: "24rem", textAlign : "right" }}>{`${item.key} ${item.protein_name}`}</div>}/>
    }
    /**
     * @description Render selected feature as a tag using the gene name.
     * @param {import("../../../../types/feature").Feature} item 
     * @returns 
     */
    const renderSelectedItemAsTag = (item) => {
        //render selected item as a tag 
        return item.genes
    }

    /**
     * 
     * @param {String} searchString - The search string provided by the user.
     * @param {import("../../../../types/feature").Feature[]} items  - The items to filter/search by the search string.
     * @returns {Object[]}
     */
    const filterItems = (searchString, items) => {
        if (searchString === "" || searchString.length < minimumSearchStringLength) {
            if (items.length > maxItemsShown) {
                return items.slice(0,maxItemsShown+1)
            }
            else return items 
        }
        const { data : filteredItems } = filterArrayBySearchStringByMultipleKeys({ array: items, keyNames: searchNames, searchString })
        if (filteredItems.length > maxItemsShown) return filteredItems.slice(0,maxItemsShown+1)
        return filteredItems
    }
    return (
        <FormGroup
            style={{margin : "0.1rem"}}
            label={showLabel?attribute.text:""}
            labelInfo={isRequired ? "(required)" : "(optional)"}
            inline={inline}
            disabled={disabled}
            helperText={helperText}>
            <MultiSelect
                disabled={disabled}
                popoverProps={{ matchTargetWidth, minimal: true }}
                resetOnQuery={true}
                resetOnSelect={true}
                fill={true}
                tagInputProps={{
                    tagProps: {minimal : true},
                }}
                items={features}
                itemRenderer={renderFeature}
                //itemListRenderer={renderItems}
                itemListPredicate={filterItems}
                tagRenderer={renderSelectedItemAsTag}
                onItemSelect={(item) => onItemSelect(attribute, item)}
                onRemove = {(item,index) => onItemSelect(attribute,item)}
               { ...{selectedItems, placeholder}}/>
        </FormGroup>
    )
}

export default FeatureInput