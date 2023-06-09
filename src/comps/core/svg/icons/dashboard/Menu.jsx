import { motion } from "framer-motion"
import PropTypes from "prop-types"
import _ from "lodash"

MenuDashboardIcon.propTypes = {
    fillColor: PropTypes.string,
    strokeWidth: PropTypes.number,
    svgHeight: PropTypes.number, 
    margin : PropTypes.number,
    numberLines : PropTypes.number
}


function MenuDashboardIcon({
    fillColor = "#466688",
    strokeWidth = 0.75,
    svgHeight = 30,
    margin = 8,
    numberLines = 3
        }) {
    const marginBetweenLines = (svgHeight - margin * 2) / (numberLines-1)
    const yCoords = _.range(numberLines).map(lineIdx => _.round(margin + marginBetweenLines * lineIdx))
    const lineCoords = _.map(yCoords, (y, idx) => { return { x1: idx % 2?5:25, x2: idx % 2?25:5 , y1 : y, y2: y, strokeWidth, stroke: fillColor, } })

    return (
        <motion.g>

            {lineCoords.map((lineCord, lineIdx) => {
                return (
                    <motion.line key={`${lineIdx}-menuLine`}
                        pathLength={0}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1 }}
                        {...lineCord}/>)
            })}
        </motion.g>
    )
}


export default MenuDashboardIcon
