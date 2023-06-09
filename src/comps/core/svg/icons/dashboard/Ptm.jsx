



import { motion } from "framer-motion"
import PropTypes from "prop-types"
import _ from "lodash"

PTMDashboardIcon.propTypes = {
    fillColor: PropTypes.string,
}


function PTMDashboardIcon({
        fillColor = "#466688"
        }) {
    
    return (
        <motion.g>
            <rect x="12.5" y="8.85" width="25" height="12" rx="2.49" fill={fillColor} />
            <motion.circle cx="14" cy="7" r="5" fill="#fafafa" stroke="#1d1d1b" strokeWidth="0.25" animate={{ opacity: 1 }} opacity={0} transition={{repeat:Infinity, repeatType :  "mirror", duration : 3}}/>
            <motion.polygon points="43.65 19.05 41.67 24.1 36.3 24.91 32.91 20.67 34.9 15.61 40.27 14.8 43.65 19.05" fill="#fafafa" stroke="#1d1d1b" strokeWidth="0.25"  animate={{ opacity: 1 }} opacity={0} transition={{ delay : 2,repeat:Infinity, repeatType :  "mirror", duration : 2}}/>
            <motion.line x1={25} x2={25} y1={24} y2={32} stroke="black" pathLength={0} animate={{ pathLength: 1 }} transition={{duration: 2 }} />
            <motion.g opacity={0} animate={{ opacity: 1 }} transition={{ duration: 2, delay : 1}} >
            <motion.rect x={10} y={32} width="10" height="10" rx="2.49" stroke={fillColor} fill="none"/>
            <motion.rect x={30} y={32} width="15" height="10" rx="2.49" stroke={fillColor} fill="none"/>
            </motion.g>
        </motion.g>
    )
}


export default PTMDashboardIcon