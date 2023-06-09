
import { useMemo } from "react"
import { motion } from "framer-motion"
import PropTypes from "prop-types"
import _ from "lodash"

PerformanceMonitorDashboardIcon.propTypes = {

    startx: PropTypes.number,
    marginBars: PropTypes.number, 
    baselineBar: PropTypes.number,
    numberBars: PropTypes.number,
    fillColor: PropTypes.string,
    strokeColor : PropTypes.string,
    strokeWidth : PropTypes.number
}

function PerformanceMonitorDashboardIcon({
    startx = 10,
    marginBars = 2,
    baselineBar = 30,
    numberBars = 5,
    fillColor = "#466688",
    strokeWidth = 0.4,
    strokeColor = "#1d1d1b" }) {
    
    const rectWidth = (35 - marginBars * numberBars) / numberBars
    
    const rects = useMemo(() => _.range(numberBars).map(idx => _.random(14, 30-1.3*idx, true)).map((barStart, barIdx) => {
        return {
            x: startx  + (barIdx * rectWidth) + (barIdx * marginBars),
            y: baselineBar,
            width: rectWidth,
            height: 0,
            custom : barStart
        }
    }), [baselineBar, startx, marginBars, rectWidth, numberBars]) 
    
    const barVariants = {

        hidden: {opacity : 1},
        visible: (barStart) => {
           
            return ({
                opacity: 1,
                y : barStart - baselineBar,
                height : baselineBar - barStart
            })
        }
    }

    return (
       <g>
            {/* Draw Monitor - hardcoded - change?*/}
            <rect x="5" y="5" width="40" height="30" rx="1.9" fill="#fff" stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="20" y="35.5" width="10" height="7" fill="#fff" stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="10" y="42.5" width="30" height="2" fill="#fff" stroke={strokeColor} strokeWidth={strokeWidth} />
            
          
            <motion.polyline points={_.join(rects.map(rectProps => `${rectProps.x + rectProps.width / 2} ${rectProps.custom}`), " ")}
                fill="none"
                stroke="#878787"
                pathLength={0}
                strokeWidth={strokeWidth + 1}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2 }} /> 
            
            {rects.map((rectProps, rectIdx) => {
                return (
                    <motion.circle
                        key={`${rectIdx}-${rectProps.x}`}
                        cx={rectProps.x + rectProps.width / 2} 
                        cy={rectProps.custom + 1}
                        r={3}
                        opacity={0}
                        animate={{ opacity: 1 }}
                        fill={fillColor}
                        transition={{ duration: 1.2, delay : 1.2 }}
                        strokeWidth={0.3} />
                )
            })}
            {/* Draw Bars */}
            {/* {rects.map((rectProps, rectIdx) => <motion.rect
                key={`r-p-${rectProps.x}-${rectIdx}`}
                {...rectProps}
                animate="visible"
                initial="hidden"
                variants={barVariants}
                transition={{duration : 1, repeat : Infinity, repeatType : "mirror", repeatDelay : rectIdx * 0.4 }}
                fill={fillColor} />)} */}
        
        </g>


    )
}


export default PerformanceMonitorDashboardIcon