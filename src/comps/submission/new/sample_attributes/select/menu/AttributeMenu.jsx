import { Menu, MenuDivider, MenuItem } from "@blueprintjs/core"
import { Loading } from "../../../../../core/base/states/Loading"
import { TraitMenuItem } from "../../../../../core/input/items/AttributeValueMenu"
import TextInput from "../../../../../core/input/Text"
import { Trait } from "../../../../../core/base/traits/Trait"
import { useEffect, useState } from "react"
import _ from "lodash"

import { api } from "@/api"
import useDebounce from "../../../../../../hooks/useDebounce"

const readClipboardValues = async () => {
    const text = await navigator.clipboard.readText()
    return text
        .split(/\r?\n/)
        .map(line => line.split(/\t|\s*,\s*/)[0].trim())
        .filter(v => v.length > 0)
}

export function AttributeContextMenuSearch({ attribute_tag,
                selectedTraits,
                onSampleTraitSelection,
                rowIdces = [],
                clearAttributeTableByRowIndex = undefined,
                repeatSelection,
                copiedRows = [], onPaste = () => {}, onCopy = () => {}, onPasteValues = () => {},
                inputFields = [] }) {
    
    const [searchString, setQuery] = useState("")
    const [clipboardValues, setClipboardValues] = useState(null)

    const debouncedString = useDebounce(searchString,30)
    
    const { data : trait_tags, isLoading, isSuccess, isFetching } = api.traits.queryTraits.useGetTraitBySearchString({search_string : debouncedString, limit : 30, attribute_tag})

    useEffect(() => {
        const el = document.getElementById("attribute-context-input")
        if (el !== null) el.focus()
        
    }, [])

    // read the clipboard as soon as the context menu opens so pasting
    // requires no extra "copy" step
    useEffect(() => {
        readClipboardValues()
            .then(values => setClipboardValues(values))
            .catch(e => {
                console.error("Clipboard read failed", e)
                setClipboardValues([])
            })
    }, [])

    const handlePasteFromClipboard = (field) => {
        if (!_.isArray(clipboardValues) || clipboardValues.length === 0) return
        onPasteValues(attribute_tag, field, clipboardValues, rowIdces)
    }

    const clipboardCount = _.isArray(clipboardValues) ? clipboardValues.length : 0

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
                        const indexInSelection = _.findIndex(selectedTraits, ['tag', trait_tag])
                        return <div key={`${index}-${trait_tag}-${indexInSelection}`}>
                            <TraitMenuItem
                                tag={trait_tag}
                                attribute_tag={attribute_tag}
                                selected={_.includes(selectedTraits, trait_tag)}
                                onClick={(p) => onSampleTraitSelection(p, rowIdces)} />
                        </div>
                    })}
                </Menu>
                <MenuDivider />
                <MenuItem text={`Repeat Selection (${rowIdces.length} rows)`} icon="clean" onClick={() => repeatSelection(rowIdces, attribute_tag)} />
                {inputFields.length > 0
                    ? <MenuItem
                        icon="clipboard"
                        disabled={clipboardCount === 0}
                        label={`${clipboardCount} value(s)`}
                        text={<span>Paste values from clipboard <span className="font-size--smallest">(<Trait trait_tag={inputFields[0].trait_tag} />{inputFields.length > 1 ? ` and ${inputFields.length - 1} more` : ""})</span></span>}>
                        {inputFields.length === 1
                            ? <MenuItem
                                key={`${inputFields[0].attribute_tag}-${inputFields[0].trait_tag}`}
                                icon="clipboard"
                                text={<span><Trait trait_tag={inputFields[0].trait_tag} /></span>}
                                onClick={() => handlePasteFromClipboard(inputFields[0])} />
                            : inputFields.map(field =>
                                <MenuItem
                                    key={`${field.attribute_tag}-${field.trait_tag}`}
                                    icon="clipboard"
                                    text={<span><Trait trait_tag={field.trait_tag} /></span>}
                                    onClick={() => handlePasteFromClipboard(field)} />)}
                    </MenuItem>
                    : null}
                <MenuItem text={`Clear Selection (${rowIdces.length} row(s))`} icon="clean" onClick={() => clearAttributeTableByRowIndex(rowIdces, attribute_tag)} />
                <MenuItem text={`Copy selected rows (${rowIdces.length} row(s))`} icon="clipboard" onClick={() => onCopy(attribute_tag, rowIdces)} />

                {copiedRows.length > 0 && <MenuItem text={`Paste copied values to selection (${rowIdces.length} row(s))`} icon="th-derived" onClick={() => onPaste(attribute_tag, copiedRows, rowIdces)} />}
            </Menu>
            </div>
    )
}
