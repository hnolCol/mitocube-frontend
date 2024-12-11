import { Menu, MenuDivider, MenuItem } from "@blueprintjs/core"
import { Loading } from "../../../../../core/base/states/Loading"
import { AttributeValueMenuItem } from "../../../../../core/input/items/AttributeValueMenu"
import TextInput from "../../../../../core/input/Text"
import { useEffect, useMemo, useState } from "react"
import { useGetValueForAttributeByTag } from "../../../../../../hooks/queries/attribute.hooks"
import _ from "lodash"
import { filterArrayBySearchString } from "../../../../../../services/arrays/filter"
import { addItemToArrayOrRemoveIfPresentByTag } from "../../../../../../services/arrays/transforms"

export function AttributeContextMenuSearch({attribute, selectedAttributeValues, onAttributeSelect, rowIdces = [], clearAttributeTableByRowIndex = undefined, repeatSelection, handleUnitInput, samplesAttributeUnit}) {
    const { data: attribute_values, isLoading, isFetching, isSuccess } = useGetValueForAttributeByTag({ tag: attribute.tag })
    const [currentSelection, setCurrentSelection] = useState([]) 
    const [searchString, setQuery] = useState("")

    let attributeValueBySearchQuery = useMemo(() => {
        
        if (searchString === "" && isSuccess)
            return  attribute_values
        
        return _.sortBy(filterArrayBySearchString({
            searchString,
            array: attribute_values,
            keyNames: ["tag","text", "description"]
        }),'text')
    }, [searchString, isSuccess])
    

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

    const handleAttributeSelection = (attributeTag, attributeValue, rowIdces) => {
        
        const updatedSelection = addItemToArrayOrRemoveIfPresentByTag({ array: currentSelection, item: attributeValue })
        setCurrentSelection(updatedSelection)
        
        onAttributeSelect(attributeTag, attributeValue, rowIdces)
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
                    {isLoading || isFetching ? <Loading /> : attributeValueBySearchQuery.map((attributeValue, index) => {
                        // index === 25 ? <MenuItem disabled key={attributeValue.text} text=" . . . not all items shown, please use the search function.." /> : index > 25 ? null :
                        const indexInSelection = _.findIndex(currentSelection, ['tag', attributeValue.tag])
                        return <div key={`${index}-${attributeValue.tag}-${indexInSelection}`}>
                            <AttributeValueMenuItem
                                attributeValue={attributeValue}
                                selected={_.isObject(_.includes(currentSelection, attributeValue.tag))}
                                onClick={(e) => handleAttributeSelection(attribute.tag, attributeValue, rowIdces)} />
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
