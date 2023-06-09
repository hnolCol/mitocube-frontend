
import { motion } from "framer-motion"
import PropTypes from "prop-types"
import _ from "lodash"

ProteinDashboardIcon.propTypes = {
    fillColor: PropTypes.string,
}


function ProteinDashboardIcon({
    fillColor = "#466688",
    strokeWidth = 0.75,
    strokeColor = "#1d1d1b",
    isSelected = false,
        }) {
    
    return (
        <motion.g>
            <circle cx="26.06" cy="42.73" r="4" fill={isSelected ? "#ffd900" : "#fafafa" } {...{strokeWidth, stroke : strokeColor}}/>
            <line x1="26.06" y1="12.64" x2="26.06" y2="19.51" fill="none" {...{strokeWidth, stroke : strokeColor}}/>
            <circle cx="5.13" cy="23.69" r="2.8" fill="#cac9c9" {...{strokeWidth, stroke : strokeColor}}/>
            <circle cx="5.13" cy="8.77" r="2.8" fill="#cac9c9"  {...{strokeWidth, stroke : strokeColor}}/>
            <path d="M8.43,10.49s7.07,4,0,11.17" fill="none" {...{strokeWidth, stroke : strokeColor}}/>
            <circle cx="13.7" cy="16.07" r="4" fill={isSelected ? "#b93418" : "#fafafa"}   {...{strokeWidth, stroke : strokeColor}}/>
            <circle cx="26.06" cy="25.56" r="4.85" fill={fillColor}   {...{strokeWidth, stroke : strokeColor}}/>
            <circle cx="26.06" cy="8.34" r="4" fill={isSelected ? "#79c29e" : "#fafafa"}  {...{strokeWidth, stroke : strokeColor}}/>
            <path d="M9.1,12.27" fill="none" {...{strokeWidth, stroke : strokeColor}}/>
            <path d="M33.76,18.42" fill="none"/>
            <circle cx="39.29" cy="34.2" r="3.71" fill="#c7c6c6" {...{strokeWidth, stroke : strokeColor}}/>
            <line x1="24.86" y1="16.07" x2="18" y2="16.07" fill="none" {...{strokeWidth, stroke : strokeColor}}/>
            <line x1="33.93" y1="34.2" x2="27.07" y2="34.2" fill="none" {...{strokeWidth, stroke : strokeColor}}/>
            <rect width="50" height="50" fill="none"/>
            <line x1="24.86" y1="15.01" x2="24.86" y2="17.14" fill="none"  {...{strokeWidth, stroke : strokeColor}}/>
            <line x1="25.97" y1="30.77" x2="25.97" y2="37.63" fill="none"{...{strokeWidth, stroke : strokeColor}}/>
    </motion.g>
    )
}


export default ProteinDashboardIcon