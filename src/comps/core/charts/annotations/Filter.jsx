import PropType from 'prop-types'
import { Group } from "@visx/group"
import { Text } from "@visx/text"
import { FilterSVG } from "../../svg/icons/chartSelection/Filter"
import { isPropHexColorString } from "../../types/checks/color"
import { checkFullMargin } from '../../types/checks/chart'
import { isPropSet } from '../../types/checks/data'


export function FilterIndicator({ width, margins, searchIndices, iconSize, textOffset, activeColor}) {

    const hexColor = searchIndices.size === 0 ? activeColor: "#000"
    return (
        <Group left={width - margins.right - 25} top={margins.top}>
            <Text x={0} y={10}  fill={hexColor} dx={textOffset} verticalAnchor="middle" textAnchor="end">{searchIndices.size}</Text>
                <FilterSVG {...{ width: iconSize, height: iconSize, strokeColor: hexColor }} />
        </Group> 
    )
}
FilterIndicator.defaultProps = {
    iconSize: 20,
    textOffset: -1,
    activeColor: "#a9a9a9"
}


FilterIndicator.propTypes = {
    width: PropType.number.isRequired,
    margins: checkFullMargin, 
    searchIndices: isPropSet, 
    iconSize: PropType.number,
    textOffset: PropType.number,
    activeColor: isPropHexColorString
}