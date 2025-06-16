import { Menu, MenuDivider, MenuItem } from "@blueprintjs/core"
import { Loading } from "../../../../../core/base/states/Loading"
import { TraitMenuItem } from "../../../../../core/input/items/AttributeValueMenu"
import TextInput from "../../../../../core/input/Text"
import { useEffect, useMemo, useState } from "react"
import { useGetValueForAttributeByTag } from "../../../../../../hooks/queries/attribute.hooks"
import _ from "lodash"
import { filterArrayBySearchString } from "../../../../../../services/arrays/filter"
import { addItemToArrayOrRemoveIfPresentByTag, addStringToArrayOrRemove } from "../../../../../../services/arrays/transforms"

import hooks from "@mitocube/api-hooks"
import useDebounce from "../../../../../../hooks/useDebounce"

export function AttributeContextMenuSearch({ attribute_tag,
                selectedAttributeValues,
                onSampleTraitSelection,
                rowIdces = [],
                clearAttributeTableByRowIndex = undefined,
                repeatSelection,
                handleUnitInput,
    samplesAttributeUnit }) {
    
    const [currentSelection, setCurrentSelection] = useState([]) 
    const [searchString, setQuery] = useState("")

    const debouncedString = useDebounce(searchString,30)
    
    const { data : trait_tags, isLoading, isSuccess, isFetching } = hooks.traits.useGetTraitBySearchString({search_string : debouncedString, limit : 30, attribute_tag})
    // const { data: attribute_values, isLoading, isFetching, isSuccess } = useGetValueForAttributeByTag({ tag: attribute_tag })
    

    // let attributeValueBySearchQuery = useMemo(() => {
        
    //     if (searchString === "" && isSuccess)
    //         return  attribute_values
        
    //     return _.sortBy(filterArrayBySearchString({
    //         searchString,
    //         array: attribute_values,
    //         keyNames: ["tag","text", "description"]
    //     }),'text')
    // }, [searchString, isSuccess])
    

    useEffect(() => {
        const el = document.getElementById("attribute-context-input")
        if (el !== null) el.focus()
        
    }, [])


    useEffect(() => {
        setCurrentSelection(selectedAttributeValues)
       
    }, [])

    // /**
    //  * 
    //  * @param {import("../../../../../types/attributes").Attribute} attribute 
    //  * @param {import("../../../../../types/attributes").AttributeValue} attributeValue 
    //  * @param {Object} userInput 
    //  */
    // const handleUserInput = (attribute, attributeValue, userInput, rowIdces) => {
    //     handleUnitInput(attribute,attributeValue,userInput,rowIdces)
    // }

    const handleAttributeSelection = (attributeTag, trait_tag, rowIdces) => {
        
        const updatedSelection =  addStringToArrayOrRemove({array : currentSelection, string : trait_tag})  
        setCurrentSelection(updatedSelection)
        
        onAttributeSelect(attributeTag, trait_tag, rowIdces)
    }



    return (
        <div>
            <Menu style={{ zIndex: 10 }} onWheelCapture={e => e.stopPropagation()}>
                <TextInput
                    small
                    id="attribute-context-input"
                    value={searchString}
                    callbackKey={"a"}
                    placeholder="Search attribute value..."
                    onChange={(key, value, type) => setQuery(value)}
                />

                <Menu style={{ overflowY: "scroll", maxHeight: "40vh" }} onWheelCapture={e => e.stopPropagation()}>
                    {isLoading || isFetching ? <Loading /> : trait_tags.map((trait_tag, index) => {
                        // index === 25 ? <MenuItem disabled key={attributeValue.text} text=" . . . not all items shown, please use the search function.." /> : index > 25 ? null :
                        const indexInSelection = _.findIndex(currentSelection, ['tag', trait_tag])
                        return <div key={`${index}-${trait_tag}-${indexInSelection}`}>
                            <TraitMenuItem
                                tag={trait_tag}
                                attribute_tag={attribute_tag}
                                selected={_.includes(currentSelection, trait_tag)}
                                onClick={(attribute_tag, trait_tag) => onSampleTraitSelection([{ "type": "attribute", "tag": attribute_tag }, {"type" : "trait", "tag" : trait_tag}], rowIdces)} />
                        </div>
                    })}
           
                </Menu>
                <MenuDivider />
                <MenuItem text={`Repeat Selection (${rowIdces.length} rows)`} icon="clean" onClick={() => repeatSelection(rowIdces, attribute.tag)} />
                <MenuItem text={`Clear Selection (${rowIdces.length} row(s))`} icon="clean" onClick={() => clearAttributeTableByRowIndex(rowIdces, attribute.tag)} />
            </Menu>
            </div>
    )
}
