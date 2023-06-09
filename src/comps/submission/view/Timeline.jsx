
import { Text } from "@visx/text"
import PropTypes from "prop-types"
import _ from "lodash"
function SubmissionTimeLine ({states, state}) {

    var posText = 0
    const xStart = 10
    const svgWidth = 40 + (states.length-1)*20 
    return(
        <div style={{marginRight:"1rem"}}>
            <svg width={svgWidth } height = {100}>
                <line x1 = {xStart} x2={10 + (states.length-1)*20} y1={50} y2={50} stroke="black" strokeWidth={0.5}/>
                {_.isArray(states)?_.range(states.length).map(v => {
                    if (states[v] === state) posText += xStart+v*20
                    
                    return(
                        <circle key = {v} cx = {xStart+v*20} cy={50} fill = {states[v] === state?"#2F5597":"#efefef"} stroke={"black"} strokeWidth={0.5} r={7}/>
                    )}):null}
                <line x1={posText} x2={posText} y1={60} y2={68} stroke={"black"} strokeWidth={0.5} />
            
                <Text x = {posText<60?posText-4:posText+4} y= {70} textAnchor={posText<60?"start":"end"} verticalAnchor="start" fill="#828282">{state}</Text>
            </svg>

        </div>

    )
}


SubmissionTimeLine.propTypes = {
    states: PropTypes.array.isRequired,
    state : PropTypes.string.isRequired
}

export default SubmissionTimeLine