import PropTypes from "prop-types"
import { getColorPalette } from "../colors/colorPalette"

const primaryColor = getColorPalette(1)

Header.propTypes = {
    text : PropTypes.string,
    hexColor: PropTypes.string, 
    fontSize: PropTypes.string,
    fontWeight: PropTypes.number,
    darkMode: PropTypes.bool
}

export function Header({
    text = "Welcome",
    hexColor = primaryColor,
    fontSize = "1.2rem",
    fontWeight = 400,
    textTransform = "none",
    letterSpacing = "0.0rem",
    backgroundColor = "transparent"
    }) {
    
    return(
        <div style={{
            backgroundColor,
            color:hexColor,
            fontSize,
            fontWeight,
            textTransform,
            letterSpacing,
            fontFamily: "Linotype Univers W01 Regular",
            marginTop:"0.1rem",
            marginBottom: "0.25rem",
            transitionDuration: "1.0s",
            cursor:"default"}}>
            {text}
        </div>
    )
}

