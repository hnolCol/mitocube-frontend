import PropType from 'prop-types'
import { Group } from "@visx/group"
import { Text } from "@visx/text"
import { SearchSVG } from "../../svg/icons/chartSelection/Search"
import { checkFullMargin } from '../../types/checks/chart'
import { checkPropIsSet } from '../../types/checks/data'

/**
 * @description A text with icon that indicates the result of search. Mainly it should be used to present the 
 * number of this that were found using the given searchString. 
 * @param {Object} props 
 * @param {Number} props.width The total width of the graph in which the text should be displayed 
 * @param {Object} props.margins 
 */
export function SearchIndicator({ width, margins, searchIndices, searchString, iconSize, textOffset }) {

    return (
        <Group left={width - margins.right - 25} top={margins.top}>
            <Text x={0} y={10} dx={textOffset} verticalAnchor="middle" textAnchor="end">
                {searchString.length ? `${searchIndices.size} (${searchString})` : `${searchIndices.size}`}
            </Text>
            <SearchSVG {...{ width: iconSize, height: iconSize, strokeColor: "#000" }} />
        </Group> 
    )
}

SearchIndicator.defaultProps = {
    iconSize: 20,
    textOffset: -2 
}


SearchIndicator.propTypes = {
    width: PropType.number.isRequired,
    margins: checkFullMargin, 
    searchIndices: checkPropIsSet, 
    searchString: PropType.string.isRequired,
    iconSize: PropType.number,
    textOffset: PropType.number
}