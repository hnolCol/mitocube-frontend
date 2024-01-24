import { Group } from "@visx/group"
import { Text } from "@visx/text"
import { SearchSVG } from "../../svg/icons/chartSelection/Search"


export function SearchIndicator({ width, margins, searchIndices, searchString, iconSize = 20, textOffset = -1 }) {

    return (
        <Group left={width - margins.right - 25} top={margins.top}>
            <Text x={0} y={10} dx={textOffset} verticalAnchor="middle" textAnchor="end">
                {`${searchIndices.size} (${searchString})`}
            </Text>
            <SearchSVG {...{ width: iconSize, height: iconSize, strokeColor: "#000" }} />
        </Group> 
    )
}