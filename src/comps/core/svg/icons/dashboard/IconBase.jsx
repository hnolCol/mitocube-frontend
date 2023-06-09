import PropTypes from 'prop-types';
import { motion } from "framer-motion"

export const BaseDashboardIcon = (
    {
        width = 50,
        height = 50,
        isSelected = false,
        children, ...rest}) => {
    
    const viewBox = `0 0 ${width} ${height}`
    return (
        
        <motion.svg
            width={width}
            height={height}
            viewBox={viewBox}
            {...rest}>
                {children}
        
        </motion.svg>
    )
}

BaseDashboardIcon.propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    viewBox: PropTypes.string, 
    children : PropTypes.element
}







