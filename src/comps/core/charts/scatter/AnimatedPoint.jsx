
import { motion } from "framer-motion"
import { getDefaultStrokeProps } from "../../svg/styles/strokes"
import React from "react"
import PropTypes from "prop-types"


AnimatedCxPoint.propTypes = {
    cx0: PropTypes.number.isRequired,
    cx1: PropTypes.number.isRequired,
    cy : PropTypes.number.isRequired,
    r: PropTypes.number.isRequired,
    fill: PropTypes.string,
    opacity: PropTypes.number
}

function AnimatedCxPoint({ cx0, cx1, cy, r, fill = "#efefef", opacity = 1, ...rest }) {
    return (
        <motion.circle
            cx={cx0}
            cy={cy}
            animate={{ cx: cx1}}
            {...{
                opacity,
                r,
                fill
            }}
            {...rest}
            {...getDefaultStrokeProps()}
            />
    )
}


function areEqual(prevProps, nextProps) {
    /*
    return true if passing nextProps to render would return
    the same result as passing prevProps to render,
    otherwise return false
    */

    if (prevProps.r !== nextProps.r) return false 
    if (prevProps.fill !== nextProps.fill) return false 
    if (prevProps.opacity !== nextProps.opacity) return false 
    if (prevProps.cx1 !== nextProps.cx1) return false
    if (prevProps.cy !== nextProps.cy) return false

    //if (!_.isEqual(prevProps.p,nextProps.p)) return false 
   // if (!_.isEqual(prevProps.xscale.domain,nextProps.xscale.domain)) return false 
    return true
  }
  export default React.memo(AnimatedCxPoint, areEqual);
