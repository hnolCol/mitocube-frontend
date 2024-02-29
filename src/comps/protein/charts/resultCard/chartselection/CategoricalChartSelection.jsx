import { Divider } from "@blueprintjs/core"
import { arrayOfObjectsToString } from "../../../../../services/arrays/transforms"
import { downloadSVG } from "../../../../../services/downloads/svg"
import { downloadTxtFile } from "../../../../../services/downloads/txt"
import ColorIconWithName from "../../../../core/svg/icons/chartSelection/Color"
import DownloadIcon from "../../../../core/svg/icons/chartSelection/Download"
import SizeIconWithName from "../../../../core/svg/icons/chartSelection/Size"
import SplitIconWithName from "../../../../core/svg/icons/chartSelection/Split"
import SubplotIconWithName from "../../../../core/svg/icons/chartSelection/Subplot"
import { TextIconWithName } from "../../../../core/svg/icons/chartSelection/Text"
import _ from "lodash"


function ChartInfo({ }) {
    
}

export function CategoricalFeaturePlotSelection({ keyNames, selection, onSelectionChange, minimal }) {
    
    return <div className="flex">
        <CategoricalChartSelection {...{ keyNames, selection, onSelectionChange, minimal }} />
        <Divider />
    </div>
}


export function CategoricalChartSelection({ keyNames, selection, onSelectionChange, minimal }) {

    const handleSelection = (key, item) => {
        onSelectionChange(prevValues => {
            return { ...prevValues, [key]: _.isObject(prevValues[key]) ? prevValues[key].tag === item.tag ? undefined : item : item }
        })
    }
    
    return <div className="flex">
        <ColorIconWithName
            callbackKey="colorName"
            items={keyNames}
            placeholder={selection.colorName}
            selectedItems={[selection.colorName]}
            minimal={minimal}
            callback={handleSelection} />
        <SplitIconWithName
            callbackKey="splitName"
            items={keyNames}
            placeholder={selection.splitName}
            selectedItems={[selection.splitName]}
            minimal={minimal}
            callback={handleSelection} />
        <SubplotIconWithName 
            callbackKey="subplotName"
            items={keyNames}
            placeholder={selection.subplotName}
            selectedItems={[selection.subplotName]}
            minimal={minimal}
            callback={handleSelection} />
    </div>
}



export function ScatterMarksSelection({keyNames, selection, onSelectionChange, minimal}) {
    
    return (
        <div className="flex">
            <ColorIconWithName
                items={keyNames}
                placeholder={selection.colorName}
                selectedItems={[{ text: selection.colorName }]}
                minimal={minimal}
                callbackKey="colorName" callback={(key, value) => onSelectionChange(prevValues => { return { ...prevValues, [key]: prevValues[key] === value ? undefined : value } })} />
            <SizeIconWithName
                items={keyNames}
                placeholder={selection.sizeName}
                selectedItems={[{ text: selection.sizeName }]}
                minimal={minimal}
                callbackKey="sizeName" callback={(key, value) => onSelectionChange(prevValues => { return { ...prevValues, [key]: prevValues[key] === value ? undefined : value } })} />
        </div>
    )
}


export function TextSelection({ keyNames, selection, onSelectionChange, minimal }) {
    return (
        <div className="flex">
            <TextIconWithName 
                items={keyNames}
                minimal={minimal}
                selectedItems={_.map(selection.tooltipNames, text => {return {text}})}
                placeholder={selection.tooltipNames.length === 1?selection.tooltipNames[0]:`${selection.tooltipNames.length} items`}
                callbackKey="tooltipNames" callback={(key, item) => onSelectionChange(prevValues =>
                {
                    return {
                        ...prevValues, [key]: addItemToArrayOrRemoveItIfPresent({ array: prevValues.tooltipNames, item})
                    }
                })} />
        </div>
    )
}


export function ChartAxisSelection({ keyNames, selection, onSelectionChange, minimal }) {
    return (
        <div className="flex">
            <XAxisName
                items={keyNames}
                selectedItems={[{text : selection.xaxisName}]}
                placeholder={selection.xaxisName}
                callbackKey="xaxisName"
                minimal={minimal}
                callback={(key, value) => onSelectionChange(prevValues => { return { ...prevValues, [key]: value } })} />
            <YAxisName
                items={keyNames}
                placeholder={selection.yaxisName}
                minimal={minimal}
                selectedItems={[{text : selection.yaxisName}]}
                callbackKey="yaxisName"
                callback={(key, value) => onSelectionChange(prevValues => { return { ...prevValues, [key]: value } })} />
        </div>
    )
}

/**
 * 
 * @param {Object} props 
 * @param {String[]} props.keyNames 
 * @param {Object} props.selection 
 * @param {Function} props.onSearchStringChange 
 * @param {Boolean} props.minimal
 * @returns 
 */
export function ChartStringSearch({ keyNames, selection, onSelectionChange, handleStringSearch, minimal = true}) {
    const [searchString, setSearchString] = useState("")
    const debounceString = useDebounce(searchString, 200)

    useEffect(() => {

        if (!_.isFunction(handleStringSearch)) return 

        handleStringSearch(selection.filterNames,debounceString)
    }, [debounceString, _.join(selection.filterNames)])


    return (
        <div className="flex center-items">
            <InputGroup value={searchString} onChange={(event) => setSearchString(event.target.value)} small={true} rightElement={<Button icon="cross" minimal={true} onClick={() => setSearchString("")} />} />
            <FilterIcon
                    items={keyNames}
                    callbackKey={"filterNames"}
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
 

/**
 * 
 * @param {Object} props
 * @param {('svg'|'data')[]} props.elementTypes - The element types based on which the download function is set. 
 * @param {String[]} props.elementNames - The file element names .e.g what is shown to the user in a selection menu.
 * @param {String[]} props.fileNames - The actual file names.
 * @returns 
 */
export function DownloadData({ elements = [], elementNames = [], elementTypes = [], fileNames = [] }) {
    const handleDownload = (elementName) => {
        const idx = elementNames.indexOf(elementName)
        if (elementTypes[idx] === "svg") {
            downloadSVG(document.getElementById(elements[idx]), fileNames[idx])
        }
        else if (elementTypes[idx] === "data") {
            if (_.isArray(elements[idx]) && _.isObject(elements[idx][0])) {
                const txtData = arrayOfObjectsToString({ data: elements[idx], keyNames : _.keys(elements[idx][0]) })
                downloadTxtFile(txtData,fileNames[idx])
            }
            
        }
    }
    
    return(
        <DownloadIcon items={elementNames} callbackValueOnly={true} callback={handleDownload} callbackKey={"download"}/>
    )
}
