import { Group } from "@visx/group"
import { Text } from "@visx/text"
import { FilterSVG } from "../../svg/icons/chartSelection/Filter"


export function FilterIndicator({ width, margins, searchIndices, iconSize = 20, textOffset = -1 }) {

    return (
        <Group left={width - margins.right - 25} top={margins.top}>
            <Text x={0} y={10} dx={textOffset} verticalAnchor="middle" textAnchor="end">{searchIndices.size}</Text>
                <FilterSVG {...{ width: iconSize, height: iconSize, strokeColor: "#000" }} />
        </Group> 
    )
}
