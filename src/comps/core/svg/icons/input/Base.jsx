
import { SVG } from "../../../charts/SVGHeader"
import _ from "lodash"
import { Group } from "@visx/group"

/**
 * 
 * @param {Object} props 
 * @param {Number} props.height - The SVG height 
 * @param {Number} props.width - The SVG width 
 * @returns 
 */
function InputIconBase({
    height = 25,
    width = 25,
    children }) {
    
    return (
   
            <div style={{height,width}}>
                <SVG {...{ width, height }}>
                    {/* <rect width={width} height={height} fill="blue"/> */}
                <Group  left={0} top={0}>
                        {children}
                </Group>
            </SVG>
            </div>
  
    )
}

export default InputIconBase