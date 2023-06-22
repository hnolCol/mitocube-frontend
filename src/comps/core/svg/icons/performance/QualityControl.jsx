


import { SVG } from "../../../charts/SVGHeader";





import { motion } from "framer-motion";
import AnimatedText from "../../AniamtedText";
import { getColorPalette } from "../../../colors/colorPalette";
import _ from "lodash"
function QualityControl({width=200,height=50}) {
    const colorPalette = getColorPalette()
    const animatedLines = _.map([11.4,14.4,17.4,20.4,23.4,26.4], y => {return{ y1 : y, y2: y, strokeWidth : 0.5, stroke : "#000000"}})



    return (
        
        <SVG {...{width,height}}>

<g transform="translate(5,6)">
<rect x="3.61" y="2.41" width="27" height="31" rx="3.21" fill="none" stroke="#000"  strokeWidth="0.5"/>
<rect x="7.61" y="6.41" width="19" height="24" fill="none" stroke="#000"  strokeWidth="0.5"/>
                <path d="M28.18,11.83" fill="#fff" transform="translate(-9.57 -5.92)" />
                {animatedLines.map((lprops, lidx) => <motion.line x1="18.11" x2="24.11" {...lprops} pathLength={0} animate={{ pathLength: 1 }} transition={{delay : lidx * 0.4, duration : 0.75}} />)}

<polyline points="9.62 12.41 11.62 14.41 15.36 10.91" fill="none" stroke="#000" stroke-linecap="round"  strokeWidth="0.5"/>
                <path d="M20,23.28a8.43,8.43,0,0,0-8.41,8.41,8.34,8.34,0,0,0,1.79,5.16l-3,3.27a2.21,2.21,0,1,0,3.26,3L17,39.52A8.41,8.41,0,1,0,20,23.28Z"
                    fill="#fff" stroke="#000" stroke-linecap="round"  strokeWidth="0.5" transform="translate(-9.57 -5.92)"/>
<g>
  <circle cx="10.48" cy="25.68" r="5.76" fill="none" stroke="#000" stroke-linecap="round"  strokeWidth="0.5"/>
                    <motion.polyline points="7.22 25.63 9.6 27.94 13.74 23.42" fill="none" stroke={colorPalette[0]} transition={{ duration: 5, repeat: Infinity, repeatType: "mirror" }} animate={{ stroke: colorPalette}} stroke-linecap="round"  strokeWidth="2.5"/>
</g>
<path d="M29.6,9.08a1.84,1.84,0,0,0,0-.33,2.73,2.73,0,0,0-5.45,0c0,.11,0,.22,0,.33l-3.86,5.25H33.46Z" fill="#fff" stroke="#000"  strokeWidth="0.5" transform="translate(-9.57 -5.92)"/>
<circle cx="17.34" cy="2.91" r="1"/>
            </g>
            <AnimatedText x={45} y={height/2} text="Quality Control" verticalAnchor="middle" textAnchor="start"/>

        </SVG>
    )
}

export default QualityControl