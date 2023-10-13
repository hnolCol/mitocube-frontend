import { motion } from "framer-motion"
import PropTypes from "prop-types"
import { Text } from "@visx/text"

UserDashboardIcon.propTypes = {
    fillColor: PropTypes.string,
    text: PropTypes.string,
    strokeWidth : PropTypes.number
}



function UserDashboardIcon({
    fillColor = "#466688",
    strokeWidth = 0.75,
    text = "HN",
        }) {
    
    return (
        <g>
            <path d="M25.66,25.65c0-6-4.53-10.8-10.12-10.8S5.42,19.68,5.42,25.65c0,.1,0,.21,0,.31H25.65C25.65,25.86,25.66,25.75,25.66,25.65Z" fill={fillColor}/>
            <circle cx="15" cy="9" r="6.16" fill="none" strokeWidth={strokeWidth} stroke={fillColor}/>
            <path d="M4.34,27" fill={fillColor} />
            <Text x={15} y={24} fill="#fff" verticalAnchor="center" fontSize={8} textAnchor="middle">{text}</Text>
        </g>
    )
}


export default UserDashboardIcon

