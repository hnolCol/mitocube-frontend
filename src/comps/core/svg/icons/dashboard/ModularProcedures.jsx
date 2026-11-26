import PropTypes from "prop-types"


ModularProceduresDashboardIcon.propTypes = {
    fillColor: PropTypes.string,
    width: PropTypes.number
}


/**
 * The modular procedures icon: three cubes of different sizes - the workflow modules of
 * different scope the submissions travel through, chained as a process.
 */
function ModularProceduresDashboardIcon({
    fillColor = "#466688",
    width = 50 }) {

    const isSelected = fillColor === "#466688"
    const topColor = isSelected ? "#75A8D4" : "#D3D3D3"
    const leftColor = isSelected ? "#4F82A8" : "#AFAFAF"
    const rightColor = isSelected ? "#355F7D" : "#8C8C8C"

    return (
        <g>
            {/* process chain */}
            <path d="M12 35 L25 27 L37 31" fill="none" stroke={isSelected ? "#466688" : "#999999"} strokeWidth={1.2}
                strokeLinecap="round" strokeDasharray="2 3" opacity={0.7} />

           
            

            {/* medium cube */}
            <g>
                <polygon points="23,24 32,19 41,24 32,29" fill={topColor} stroke="white" strokeWidth={0.4} />
                <polygon points="23,24 32,29 32,38 23,33" fill={leftColor} stroke="white" strokeWidth={0.4} />
                <polygon points="32,29 41,24 41,33 32,38" fill={rightColor} stroke="white" strokeWidth={0.4} />
            </g>

            {/* large cube */}
            <g>
                <polygon points="3,18 15,12 27,18 15,24" fill={topColor} stroke="white" strokeWidth={0.4} />
                <polygon points="3,18 15,24 15,36 3,30" fill={leftColor} stroke="white" strokeWidth={0.4} />
                <polygon points="15,24 27,18 27,30 15,36" fill={rightColor} stroke="white" strokeWidth={0.4} />
            </g>
             {/* small cube */}
            <g style={{ transform: "translateX(-20px) translateY(3px)" }}>
                <polygon points="35,31 43,27 51,31 43,35" fill={topColor} stroke="white" strokeWidth={0.4} />
                <polygon points="35,31 43,35 43,43 35,39" fill={leftColor} stroke="white" strokeWidth={0.4} />
                <polygon points="43,35 51,31 51,39 43,43" fill={rightColor} stroke="white" strokeWidth={0.4} />
            </g>
        </g>
    )
}


export default ModularProceduresDashboardIcon
