

import {motion} from "framer-motion"
import { SVG } from "../../../charts/SVGHeader"
import { Text } from "@visx/text"
import { Group } from "@visx/group"


export function TextButtonIcon({width = 25,height = 25}) {
    
    return <motion.button className="state__filter__button" style={{backgroundColor : "transparent",height,width}}>
        <div className="flex margin--very-little icon__container center-items div--expand" >
            <div style={{height,width}}>
            <SVG {...{ width : width, height : height }}>
            <Group>
                <Text x={width / 2} y={height / 2} fontSize={0.6 * height} textAnchor="middle" verticalAnchor="middle">
                    T
                </Text>
            </Group>
                </SVG>
                </div>
        </div>

    </motion.button>
}