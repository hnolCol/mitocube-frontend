import _ from "lodash"
import ComboboxIconBase from "./ComboboxBase"
import { Text } from "@visx/text"

function InfoIcon({ height = 25, width = 25, placeholder = "", items = [{ text: "Menu1" }], callbackKey = undefined, callback = undefined,callbackValueOnly = false, minimal = true, itemIsAttribute = false }) {
    
    const center = { x: width / 2, y: height / 2 }
    
    return (
        <ComboboxIconBase {...{width, height, placeholder, items, callback, callbackKey, callbackValueOnly, minimal, filterable : false, itemIsAttribute}}>
            <g>
                <circle cx={center.x} cy={center.y} r={width * 0.75/ 2} fill="#fafafa" stroke="#000" strokeWidth={0.5} fillOpacity={0.7}/>
                <Text x={center.x} y={center.y} textAnchor="middle" verticalAnchor="middle" fontWeight={500} fontSize={height*0.7}>i</Text>
            </g>
        </ComboboxIconBase>
    )
}

export default InfoIcon