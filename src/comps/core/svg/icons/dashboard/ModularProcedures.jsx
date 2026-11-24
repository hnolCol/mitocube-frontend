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

    return (
    <g>
        {/* the small module */}
        <rect x={9} y={27} width={13} height={13} fill={fillColor} stroke="white" strokeWidth={0.4}
            opacity={0.75} rx={1} />
        {/* the medium module - the central step of the chain */}
        <rect x={24.5} y={17} width={17.5} height={17.5} fill={fillColor} stroke="white" strokeWidth={0.4}
            opacity={0.9} rx={1} />
        {/* the large module */}
        <rect x={4} y={6} width={29} height={29} fill={fillColor} stroke="white" strokeWidth={0.4}
            opacity={0.55} rx={1} />
        {/* the chain: the process flow between the three modules */}
        <path d="M15.5 33.5 l 9 0 M33.2 25.7 l 6.8 0 M18.5 20.5 l 6 0"
            stroke={fillColor} strokeWidth={1.6} strokeLinecap="round" opacity={0.95} />
    </g>
    )
}


export default ModularProceduresDashboardIcon
