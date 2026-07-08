import { Menu, MenuDivider, MenuItem } from "@blueprintjs/core"
import { Loading } from "../../../../../core/base/states/Loading"
import { TraitMenuItem } from "../../../../../core/input/items/AttributeValueMenu"
import TextInput from "../../../../../core/input/Text"
import { useEffect, useState } from "react"
import _ from "lodash"

import { api } from "@/api"
import useDebounce from "../../../../../../hooks/useDebounce"

export function AttributeContextMenuSearch({ attribute_tag,
                selectedAttributeValues,
                onSampleTraitSelection,
                rowIdces = [],
                clearAttributeTableByRowIndex = undefined,
                repeatSelection,
                copiedRows = [], onPaste = () => {} }) {
    
    const [currentSelection, setCurrentSelection] = useState([]) 
    const [searchString, setQuery] = useState("")

    const debouncedString = useDebounce(searchString,30)
    
    const { data : trait_tags, isLoading, isSuccess, isFetching } = api.traits.queryTraits.useGetTraitBySearchString({search_string : debouncedString, limit : 30, attribute_tag})
    
    

    useEffect(() => {
        const el = document.getElementById("attribute-context-input")
        if (el !== null) el.focus()
        
    }, [])


    useEffect(() => {
        setCurrentSelection(selectedAttributeValues)
       
    }, [])



    return (
        <div>
            <Menu style={{ zIndex: 10, maxWidth : "min(35rem, 80vw)" }} onWheelCapture={e => e.stopPropagation()}>
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
                        const indexInSelection = _.findIndex(currentSelection, ['tag', trait_tag])
                        return <div key={`${index}-${trait_tag}-${indexInSelection}`}>
                            <TraitMenuItem
                                tag={trait_tag}
                                attribute_tag={attribute_tag}
                                selected={_.includes(currentSelection, trait_tag)}
                                onClick={(p) => onSampleTraitSelection(p, rowIdces)} />
                        </div>
                    })}
                </Menu>
                <MenuDivider />
                <MenuItem text={`Repeat Selection (${rowIdces.length} rows)`} icon="clean" onClick={() => repeatSelection(rowIdces, attribute_tag)} />
                <MenuItem text={`Clear Selection (${rowIdces.length} row(s))`} icon="clean" onClick={() => clearAttributeTableByRowIndex(rowIdces, attribute_tag)} />
                {copiedRows.length > 0 && <MenuItem text={`Paste copied values to selection (${rowIdces.length} row(s))`} icon="clipboard" onClick={() => onPaste(attribute_tag, copiedRows, rowIdces)} />}
            </Menu>
            </div>
    )
}
