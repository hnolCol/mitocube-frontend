import PropTypes from 'prop-types'
import { InputGroup } from "@blueprintjs/core"
import { addItemToArrayIfNotPresent, addItemToArrayOrRemoveItIfPresent } from "../../../../../services/arrays/transforms"
import _ from "lodash"
import useDebounce from '../../../../../hooks/useDebounce'
import FilterIcon from '../../../../core/svg/icons/chartSelection/Filter'

/**
 * @description Component to use a string search on the data to find a specific item. 
 * @param {Object} props 
 * @param {String[]} props.keyNames The list of names to be displayed as options for the given selections. (e.g. items in a combobox)
 * @param {Object} props.selection 
 * @param {Function} props.onSearchStringChange 
 * @param {Boolean} props.minimal
 * @returns 
 */
export function ChartStringSearch({ keyNames, selection, onSelectionChange, handleStringSearch, minimal, debounceDuration, callbackKey}) {
    const [searchString, setSearchString] = useState("")
    const debounceString = useDebounce(searchString, debounceDuration)

    useEffect(() => {

        if (!_.isFunction(handleStringSearch)) return 

        handleStringSearch(selection.filterNames,debounceString)
    }, [debounceString, _.join(selection.filterNames)])


    return (
        <div className="flex center-items">
            <InputGroup value={searchString} onChange={(event) => setSearchString(event.target.value)} small={true} rightElement={<Button icon="cross" minimal={true} onClick={() => setSearchString("")} />} />
            <FilterIcon
                    items={keyNames}
                    callbackKey={callbackKey}
                    selectedItems={_.map(selection.filterNames, text => { return { text } })}
                    minimal={minimal}
                    callback={(key, item) => onSelectionChange(prevValues =>{
                    return {
                        ...prevValues,
                        [key]: addItemToArrayOrRemoveItIfPresent({ array: prevValues.filterNames, item }),
                        tooltipNames : addItemToArrayIfNotPresent({array : prevValues.tooltipNames, item})
                    }
                })} />
        </div>
    )
}

ChartStringSearch.defaultProps = {
    minimal: true,
    selection: {},
    debounceDuration: 200,
    callbackKey : "filterNames"
}

ChartStringSearch.propTypes = {
    keyNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    selection: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string,PropTypes.arrayOf(PropTypes.string)])).isRequired,
    onSelectionChange: PropTypes.func.isRequired,
    handleStringSearch : PropTypes.func.isRequired,
    minimal: PropTypes.bool,
    debounceDuration: PropTypes.number.isRequired,
    callbackKey: PropTypes.string.isRequired
}
 
