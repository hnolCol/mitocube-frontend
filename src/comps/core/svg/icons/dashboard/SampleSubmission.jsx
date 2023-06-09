import { motion } from "framer-motion"
import PropTypes from 'prop-types';
import { useMemo } from "react";
import _ from "lodash"


SampleSubmissionDashboardIcon.propTypes = {
    xstart: PropTypes.number,
    ystart: PropTypes.number,
    fillColor: PropTypes.string,
    strokeColor : PropTypes.string
}


export function SampleSubmissionDashboardIcon({
    xstart = 10,
    ystart = 10,
    fillColor = "#466688",
    strokeColor = "#1d1d1b" }) {
    
    const circleVariants = {

        hidden: ([cx,cy]) => {
            return ({
                opacity: 0,
                cy: cy,
                cx : cx,
            })
        },
        visible: ([cx, cy]) => {
            let xdirection = _.random() > 0.5 ? -1 : 1
            return ({
                opacity: 0.8,
                cx : cx + (xdirection * _.random(3,5,true)),
                cy: cy-23,
                r : 0,
            })
        }
    }
    const points = useMemo(() => _.range(20).map(() => { return ({ cx: _.random(14, 16.5,true) , cy : _.random(12,18,true), r : _.random(2,5,true)})}), []) 
    return (
        <g transform={`translate(${xstart},${ystart})`}>
        <polygon points="14.26 29.95 0.24 29.95 9.36 11.37 7.02 0.15 14.26 0.15 14.32 0.15 21.57 0.15 19.23 11.37 28.34 29.95 14.32 29.95 14.26 29.95"
            fill="#fff" stroke={strokeColor} strokeMiterlimit="10" strokeWidth="0.3"/>
        <path d="M20.38,16a1.46,1.46,0,0,0-.64-.68,1.48,1.48,0,0,0-1.41-.12,3.23,3.23,0,0,0-.53.41,8.06,8.06,0,0,1-3.44,1.81c-1.35.18-3.15-.9-4.1-1.81h-.11l-6,12.3a1.44,1.44,0,0,0,1.29,2.07H24.61a1.43,1.43,0,0,0,1.3-2Z"
            transform="translate(-0.71 -0.74)" fill={fillColor}/>
                {points.map((point, pIdx) =>
                    <motion.circle
                        key={`${point.cx}${pIdx}`}
                        {...point}
                        initial="hidden"
                        animate="visible"
                        fill={fillColor}
                        variants={circleVariants}
                        opacity={0}
                        custom={[point.cx, point.cy]}
                        transition={{duration : 3, repeat: Infinity, repeatType : "loop", delay : pIdx*0.4}} />)}
            </g>
            
    )
}