
import PropTypes from 'prop-types'
import { isPropHexColorString } from "../../types/checks/color";



function AxisBackground({x, y, height, width, fill}) {
    
    return (
        <rect {...{x,y,width,height,fill}} />
    )
}


AxisBackground.defaultProps = {
    fill : "#fafafa"
}

AxisBackground.propTypes = {
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    fill: isPropHexColorString
}


export default AxisBackground