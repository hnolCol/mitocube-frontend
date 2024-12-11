import PropTypes from 'prop-types'
import DownloadIcon from '../../../../core/svg/icons/chartSelection/Download'
import { downloadTxtFile } from '../../../../../services/downloads/txt'
import { arrayOfObjectsToString } from '../../../../../services/arrays/transforms'
import { downloadSVG } from '../../../../../services/downloads/svg'



/**
 * @description Component to handle the download of the chart as a svg file and the underlying data as txt file. 
 * 
 * @param {Object} props
 * @param {Array} props.elements - The elemen to download (For svg it must be the SVG ID while for data it must be the actual data array.)
 * @param {('svg'|'data')[]} props.elementTypes - The element types based on which the download function is set. 
 * @param {String[]} props.elementNames - The file element names .e.g what is shown to the user in a selection menu.
 * @param {String[]} props.fileNames - The actual file names.
 * @returns 
 */
export function DownloadData({ elements, elementNames, elementTypes, fileNames }) {

    const handleDownload = (elementName) => {
        const idx = elementNames.indexOf(elementName)
        if (elementTypes[idx] === "svg") {
            //if a svg is selected, the svg is returned by its id 
            downloadSVG(document.getElementById(elements[idx]), fileNames[idx])
        }
        else if (elementTypes[idx] === "data") {
            if (_.isArray(elements[idx]) && _.isObject(elements[idx][0])) {
                const txtData = arrayOfObjectsToString({ data: elements[idx], keyNames : _.keys(elements[idx][0]) })
                downloadTxtFile(txtData, fileNames[idx])
            }
        }
    }
    
    return (
    
        <DownloadIcon
            items={elementNames}
            callbackValueOnly={true}
            callback={handleDownload}
            callbackKey={"download"}
        />
    )
}



DownloadData.propTypes = {
    elementTypes : PropTypes.arrayOf(PropTypes.oneOf(['svg','data'])),
    elementNames: PropTypes.arrayOf(PropTypes.string),
    fileNames: PropTypes.arrayOf(PropTypes.string)
}