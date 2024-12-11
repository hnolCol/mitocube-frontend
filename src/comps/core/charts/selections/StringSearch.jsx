import PropType from 'prop-types'
import _ from "lodash"

import { useEffect, useState } from 'react'
import useDebounce from '../../../../hooks/useDebounce'

import { Button, InputGroup } from "@blueprintjs/core"

import FilterIcon from "../../svg/icons/chartSelection/Filter"
import { addItemToArrayOrRemoveItIfPresent } from "../../../../services/arrays/transforms"


StringSearch.propTypes = {
    keyNames: PropType.arrayOf(PropType.string).isRequired,
    callbackKey: PropType.string.isRequired,
    selection: PropType.object,
    onSelectionChange: PropType.func.isRequired,
    handleStringSearch: PropType.func.isRequired,
    minimal: PropType.bool
}

StringSearch.defaultProps = {
    minimal: true,
    debounce: 200,
    callbackKey: "filterNames"
}

/**
 * @description Component to allow for string search. The component allows to select a keyName(s) in which the
 * search should be performed (multiple keyNames cam be selected).  
 * Two functions must be defined: a) onSelectionChange which handles the keyName selection. 
 * and b) onSearchStringChange handles the change of the search string. 
 *
 * @param {Object} props 
 * @param {String[]} props.keyNames
 * @param {String} prop.callbackKey
 * @param {Object} props.selection 
 * @param {Function} props.onSearchStringChange Should expect the properties ([selected keyNames],searchString).
 * @param {Function} props.onSelectionChange Should expect the (callbackKey = "filterNames", [selected keyNames])
 * @param {Boolean} props.minimal
 * @param {Number} props.debounce - The milliseconds to wait until the search string is passed to onSearchStringChange. 
 * @returns 
 */
export function StringSearch({ keyNames, selection, onSelectionChange, handleStringSearch, minimal, debounce }) {
    const [searchString, setSearchString] = useState("")
    const debounceString = useDebounce(searchString, debounce)

    useEffect(() => {

        if (!_.isFunction(handleStringSearch)) return 

        handleStringSearch(selection.filterNames, debounceString)
        
    }, [debounceString, _.join(selection.filterNames)])

    return (
        <div className="flex center-items">
            <InputGroup value={searchString}
                onChange={(event) => setSearchString(event.target.value)}
                small={true}
                rightElement={<Button
                    icon="cross" minimal={true}
                    onClick={() => setSearchString("")} />} />
            <FilterIcon
                items={keyNames}
                callbackKey={callbackKey}
                selectedItems={_.map(selection.filterNames, text => { return { text } })}
                minimal={minimal}
                callback={(key, value) => onSelectionChange(key, addItemToArrayOrRemoveItIfPresent({ array: selection.filterNames, item : value }))}
            />
        </div>
    )
}

