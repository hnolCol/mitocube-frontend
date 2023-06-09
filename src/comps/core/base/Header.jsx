import PropTypes from "prop-types"

Header.propTypes = {
    text : PropTypes.string,
    hexColor: PropTypes.string, 
    fontSize: PropTypes.string,
    fontWeight: PropTypes.number,
    darkMode: PropTypes.bool
}

export function Header({
    text = "Welcome",
    hexColor = "#2F5597",
    fontSize = "1.0rem",
    fontWeight = 400,
    }) {
    
    return(
        <div style={{
            color:hexColor,
            fontSize:fontSize,
            fontWeight: fontWeight,
            fontFamily: "Helvetica",
            marginTop:"0.1rem",
            marginBottom: "0.2rem",
            transitionDuration: "1.0s",
            transitionProperty: "color fontWeight",
            cursor:"default"}}>
            {text}
        </div>
    )
}

